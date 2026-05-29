"use client";
import { useEffect, useRef } from "react";

interface Star {
  x: number; y: number; r: number;
  alpha: number; speed: number; phase: number;
  depth: number;
  r_: number; g_: number; b_: number; // color channels
}

interface ConstellationLine { a: number; b: number; }
interface Ripple { x: number; y: number; t: number; }
interface Shooter {
  x: number; y: number; vx: number; vy: number;
  len: number; life: number; maxLife: number;
}

export function StarField({
  count = 220,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let stars: Star[] = [];
    let constLines: ConstellationLine[] = [];
    let ripples: Ripple[] = [];
    let shooters: Shooter[] = [];
    let nextShootAt = 0;

    // cursor in canvas-local coords (-9999 = off screen)
    let mouseX = -9999, mouseY = -9999;
    let curOffX = 0, curOffY = 0;
    let tgtOffX = 0, tgtOffY = 0;
    const MAX_PARALLAX = 32;

    // ── Init ────────────────────────────────────────────────────────────────
    function init() {
      const w = canvas!.width, h = canvas!.height;

      // Star color palettes (R,G,B) for dark sky
      const palettes = [
        [200, 220, 255], // blue-white
        [255, 252, 240], // warm white
        [220, 225, 255], // cool white
        [255, 238, 200], // golden
        [180, 200, 255], // blue
        [255, 255, 255], // pure white
      ];

      stars = Array.from({ length: count }, () => {
        const r = Math.pow(Math.random(), 1.8) * 2.4 + 0.25;
        const pal = palettes[Math.floor(Math.random() * palettes.length)];
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r,
          alpha: Math.random() * 0.55 + 0.2,
          speed: Math.random() * 0.0012 + 0.0003,
          phase: Math.random() * Math.PI * 2,
          depth: Math.pow((r - 0.25) / 2.4, 1.6),
          r_: pal[0], g_: pal[1], b_: pal[2],
        };
      });

      // Pre-compute sparse constellation backbone
      constLines = [];
      for (let i = 0; i < stars.length; i++) {
        let connections = 0;
        for (let j = i + 1; j < stars.length; j++) {
          if (connections >= 2) break;
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          if (dx * dx + dy * dy < 120 * 120 && Math.random() < 0.18) {
            constLines.push({ a: i, b: j });
            connections++;
          }
        }
      }

      nextShootAt = performance.now() + 2000 + Math.random() * 6000;
    }

    // ── Spawn shooting star ──────────────────────────────────────────────────
    function spawnShooter(ts: number) {
      const w = canvas!.width, h = canvas!.height;
      const angle = (Math.random() * Math.PI) / 4 + Math.PI / 6;
      const speed = 5 + Math.random() * 6;
      shooters.push({
        x: Math.random() * w * 0.6,
        y: Math.random() * h * 0.45,
        vx: Math.cos(-angle) * speed,
        vy: Math.sin(-angle) * speed,
        len: 90 + Math.random() * 120,
        life: 0,
        maxLife: 55 + Math.random() * 35,
      });
      nextShootAt = ts + 7000 + Math.random() * 15000;
    }

    // ── Resize ───────────────────────────────────────────────────────────────
    function resize() {
      canvas!.width = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
      init();
    }

    // ── Draw ─────────────────────────────────────────────────────────────────
    function draw(ts: number) {
      const w = canvas!.width, h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      // Smooth parallax
      curOffX += (tgtOffX - curOffX) * 0.055;
      curOffY += (tgtOffY - curOffY) * 0.055;

      if (ts > nextShootAt) spawnShooter(ts);

      const mouseNear = mouseX > -500;
      const PULL_R = 170;
      const PULL_STR = 12;
      const GLOW_R = 140;
      const LINE_R = 210;

      // ── 1. Background constellation lines ────────────────────────────────
      for (const { a, b } of constLines) {
        const sa = stars[a], sb = stars[b];
        const ax = sa.x + curOffX * sa.depth;
        const ay = sa.y + curOffY * sa.depth;
        const bx = sb.x + curOffX * sb.depth;
        const by = sb.y + curOffY * sb.depth;
        const al = ((sa.alpha + sb.alpha) / 2) * 0.14;
        ctx!.beginPath();
        ctx!.moveTo(ax, ay);
        ctx!.lineTo(bx, by);
        ctx!.strokeStyle = `rgba(100,130,220,${al})`;
        ctx!.lineWidth = 0.45;
        ctx!.stroke();
      }

      // ── 2. Cursor constellation lines + glow ─────────────────────────────
      if (mouseNear) {
        // Collect stars within LINE_R
        const near: { s: Star; d: number }[] = [];
        for (const s of stars) {
          const sx = s.x + curOffX * s.depth;
          const sy = s.y + curOffY * s.depth;
          const d = Math.hypot(mouseX - sx, mouseY - sy);
          if (d < LINE_R) near.push({ s, d });
        }
        near.sort((a, b) => a.d - b.d);

        for (const { s, d } of near.slice(0, 7)) {
          const sx = s.x + curOffX * s.depth;
          const sy = s.y + curOffY * s.depth;
          const op = Math.pow(1 - d / LINE_R, 1.4) * 0.75;
          const grad = ctx!.createLinearGradient(mouseX, mouseY, sx, sy);
          grad.addColorStop(0, `rgba(180,205,255,${op})`);
          grad.addColorStop(0.6, `rgba(160,185,255,${op * 0.4})`);
          grad.addColorStop(1, `rgba(160,185,255,0)`);
          ctx!.beginPath();
          ctx!.moveTo(mouseX, mouseY);
          ctx!.lineTo(sx, sy);
          ctx!.strokeStyle = grad;
          ctx!.lineWidth = 0.9;
          ctx!.stroke();
        }

        // Cursor outer glow halo
        const halo = ctx!.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 18);
        halo.addColorStop(0, "rgba(160,185,255,0.35)");
        halo.addColorStop(0.4, "rgba(140,170,255,0.12)");
        halo.addColorStop(1, "rgba(140,170,255,0)");
        ctx!.beginPath();
        ctx!.arc(mouseX, mouseY, 18, 0, Math.PI * 2);
        ctx!.fillStyle = halo;
        ctx!.fill();

        // Cursor core dot
        ctx!.beginPath();
        ctx!.arc(mouseX, mouseY, 2.2, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(210,225,255,0.95)";
        ctx!.fill();
      }

      // ── 3. Click / tap ripples ────────────────────────────────────────────
      ripples = ripples.filter((r) => ts - r.t < 1000);
      for (const rp of ripples) {
        const age = ts - rp.t;
        const p = age / 1000;

        // Outer ring
        const r1 = p * 240;
        const o1 = (1 - p) * 0.45;
        ctx!.beginPath();
        ctx!.arc(rp.x, rp.y, r1, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(160,185,255,${o1})`;
        ctx!.lineWidth = 1.2 * (1 - p * 0.5);
        ctx!.stroke();

        // Inner ring (faster, shorter)
        if (p < 0.7) {
          const r2 = (p / 0.7) * 130;
          const o2 = (1 - p / 0.7) * 0.3;
          ctx!.beginPath();
          ctx!.arc(rp.x, rp.y, r2, 0, Math.PI * 2);
          ctx!.strokeStyle = `rgba(200,215,255,${o2})`;
          ctx!.lineWidth = 0.8;
          ctx!.stroke();
        }
      }

      // ── 4. Stars (with cursor pull + glow) ───────────────────────────────
      for (const s of stars) {
        const twinkle = Math.sin(ts * s.speed + s.phase) * 0.32;
        let a = Math.max(0.05, Math.min(0.98, s.alpha + twinkle));

        let dx = curOffX * s.depth;
        let dy = curOffY * s.depth;

        if (mouseNear) {
          const sx = s.x + dx, sy = s.y + dy;
          const mdx = mouseX - sx, mdy = mouseY - sy;
          const dist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (dist < PULL_R && dist > 0.5) {
            const pull = ((1 - dist / PULL_R) ** 2) * PULL_STR;
            dx += (mdx / dist) * pull;
            dy += (mdy / dist) * pull;
          }
          if (dist < GLOW_R) {
            a = Math.min(1, a + (1 - dist / GLOW_R) * 0.65);
          }
        }

        const px = s.x + dx, py = s.y + dy;

        // Glow halo for bigger stars
        if (s.r > 1.1) {
          const gr = s.r * 4.5;
          const grd = ctx!.createRadialGradient(px, py, 0, px, py, gr);
          grd.addColorStop(0, `rgba(${s.r_},${s.g_},${s.b_},${a * 0.28})`);
          grd.addColorStop(1, `rgba(${s.r_},${s.g_},${s.b_},0)`);
          ctx!.beginPath();
          ctx!.arc(px, py, gr, 0, Math.PI * 2);
          ctx!.fillStyle = grd;
          ctx!.fill();
        }

        // Star core
        ctx!.beginPath();
        ctx!.arc(px, py, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${s.r_},${s.g_},${s.b_},${a})`;
        ctx!.fill();

        // Cross sparkle for the brightest stars
        if (s.r > 1.7 && a > 0.7) {
          const len = s.r * 3.5;
          ctx!.save();
          ctx!.globalAlpha = (a - 0.7) * 0.5;
          ctx!.strokeStyle = `rgb(${s.r_},${s.g_},${s.b_})`;
          ctx!.lineWidth = 0.6;
          ctx!.beginPath();
          ctx!.moveTo(px - len, py); ctx!.lineTo(px + len, py);
          ctx!.moveTo(px, py - len); ctx!.lineTo(px, py + len);
          ctx!.stroke();
          ctx!.restore();
        }
      }

      // ── 5. Shooting stars ────────────────────────────────────────────────
      shooters = shooters.filter((sh) => sh.life < sh.maxLife);
      for (const sh of shooters) {
        sh.life++;
        sh.x += sh.vx;
        sh.y += sh.vy;
        const p = sh.life / sh.maxLife;
        const alpha = p < 0.15 ? p / 0.15 : 1 - (p - 0.15) / 0.85;
        const speed = Math.hypot(sh.vx, sh.vy);
        const tailX = sh.x - (sh.vx / speed) * sh.len;
        const tailY = sh.y - (sh.vy / speed) * sh.len;

        const sGrad = ctx!.createLinearGradient(sh.x, sh.y, tailX, tailY);
        sGrad.addColorStop(0, `rgba(255,255,255,${alpha})`);
        sGrad.addColorStop(0.25, `rgba(200,215,255,${alpha * 0.6})`);
        sGrad.addColorStop(1, "rgba(180,200,255,0)");
        ctx!.beginPath();
        ctx!.moveTo(sh.x, sh.y);
        ctx!.lineTo(tailX, tailY);
        ctx!.strokeStyle = sGrad;
        ctx!.lineWidth = 1.8 * (1 - p * 0.4);
        ctx!.stroke();

        // Bright head
        const hGrad = ctx!.createRadialGradient(sh.x, sh.y, 0, sh.x, sh.y, 4);
        hGrad.addColorStop(0, `rgba(255,255,255,${alpha})`);
        hGrad.addColorStop(1, "rgba(255,255,255,0)");
        ctx!.beginPath();
        ctx!.arc(sh.x, sh.y, 4, 0, Math.PI * 2);
        ctx!.fillStyle = hGrad;
        ctx!.fill();
      }
    }

    // ── Event handlers ───────────────────────────────────────────────────────
    function updateMouse(clientX: number, clientY: number) {
      const rect = canvas!.getBoundingClientRect();
      mouseX = clientX - rect.left;
      mouseY = clientY - rect.top;
      const cx = rect.width / 2, cy = rect.height / 2;
      tgtOffX = ((mouseX - cx) / cx) * MAX_PARALLAX;
      tgtOffY = ((mouseY - cy) / cy) * MAX_PARALLAX;
    }

    function onMouseMove(e: MouseEvent) { updateMouse(e.clientX, e.clientY); }

    function onMouseLeave() {
      mouseX = -9999; mouseY = -9999;
      tgtOffX = 0; tgtOffY = 0;
    }

    function onTouchMove(e: TouchEvent) {
      const t = e.touches[0];
      updateMouse(t.clientX, t.clientY);
    }

    function addRipple(clientX: number, clientY: number, ts: number) {
      const rect = canvas!.getBoundingClientRect();
      ripples.push({ x: clientX - rect.left, y: clientY - rect.top, t: ts });
    }

    function onPointerDown(e: PointerEvent) {
      addRipple(e.clientX, e.clientY, performance.now());
    }

    // Attach to window so events fire even when cursor is over content divs
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    // Track mouse leaving the viewport
    document.documentElement.addEventListener("mouseleave", onMouseLeave);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    function loop(ts: number) {
      draw(ts);
      animId = requestAnimationFrame(loop);
    }
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("pointerdown", onPointerDown);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
