"use client";
import { useEffect, useRef } from "react";

// Real diverse headshot photos — preloaded once at module level
// pravatar.cc delivers CORS-safe real human face photos (Access-Control-Allow-Origin: *)
const FACE_SRCS = [
  // Spread of 16 across the 1-70 pool for maximum diversity of gender + ethnicity
  "https://i.pravatar.cc/80?img=1",
  "https://i.pravatar.cc/80?img=5",
  "https://i.pravatar.cc/80?img=8",
  "https://i.pravatar.cc/80?img=12",
  "https://i.pravatar.cc/80?img=16",
  "https://i.pravatar.cc/80?img=20",
  "https://i.pravatar.cc/80?img=25",
  "https://i.pravatar.cc/80?img=29",
  "https://i.pravatar.cc/80?img=33",
  "https://i.pravatar.cc/80?img=38",
  "https://i.pravatar.cc/80?img=43",
  "https://i.pravatar.cc/80?img=47",
  "https://i.pravatar.cc/80?img=52",
  "https://i.pravatar.cc/80?img=57",
  "https://i.pravatar.cc/80?img=62",
  "https://i.pravatar.cc/80?img=68",
];

const faceImages: HTMLImageElement[] =
  typeof window !== "undefined"
    ? FACE_SRCS.map((src) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = src;
        return img;
      })
    : [];

interface Star {
  x: number; y: number; r: number;
  alpha: number; speed: number; phase: number;
  depth: number;
  r_: number; g_: number; b_: number;
  driftX: number; driftY: number; driftPhase: number;
  faceIdx: number;
}

interface ConstellationLine { a: number; b: number; }
interface Ripple { x: number; y: number; t: number; }
interface Shooter {
  x: number; y: number; vx: number; vy: number;
  len: number; life: number; maxLife: number;
  size: number;
}

export function StarField({
  count = 280,
  className = "",
  shootingInterval = 1500,
}: {
  count?: number;
  className?: string;
  /** ms between shooting-star bursts — lower = more frequent */
  shootingInterval?: number;
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

    let mouseX = -9999, mouseY = -9999;
    let curOffX = 0, curOffY = 0;
    let tgtOffX = 0, tgtOffY = 0;
    const MAX_PARALLAX = 52; // more movement

    function init() {
      const w = canvas!.width, h = canvas!.height;

      const palettes = [
        [200, 220, 255],
        [255, 252, 240],
        [220, 225, 255],
        [255, 238, 200],
        [180, 200, 255],
        [255, 255, 255],
        [210, 230, 255],
        [255, 245, 210],
      ];

      stars = Array.from({ length: count }, () => {
        const r = Math.pow(Math.random(), 1.5) * 3.2 + 0.3; // slightly bigger stars
        const pal = palettes[Math.floor(Math.random() * palettes.length)];
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r,
          alpha: Math.random() * 0.6 + 0.25,
          speed: Math.random() * 0.0022 + 0.0006, // faster twinkle
          phase: Math.random() * Math.PI * 2,
          depth: Math.pow((r - 0.3) / 3.2, 1.4),
          r_: pal[0], g_: pal[1], b_: pal[2],
          driftX: (Math.random() - 0.5) * 0.018, // slow drift
          driftY: (Math.random() - 0.5) * 0.012,
          driftPhase: Math.random() * Math.PI * 2,
          faceIdx: Math.floor(Math.random() * FACE_SRCS.length),
        };
      });

      constLines = [];
      for (let i = 0; i < stars.length; i++) {
        let connections = 0;
        for (let j = i + 1; j < stars.length; j++) {
          if (connections >= 2) break;
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          if (dx * dx + dy * dy < 130 * 130 && Math.random() < 0.18) {
            constLines.push({ a: i, b: j });
            connections++;
          }
        }
      }

      nextShootAt = performance.now() + shootingInterval * 0.5;
    }

    function spawnShooter(ts: number) {
      const w = canvas!.width, h = canvas!.height;
      // Spawn 1-3 shooters at once for burst effect
      const burst = Math.random() < 0.3 ? Math.floor(Math.random() * 2) + 2 : 1;
      for (let b = 0; b < burst; b++) {
        const angle = (Math.random() * Math.PI) / 3.5 + Math.PI / 7;
        const speed = 9 + Math.random() * 10;
        const size = 1.5 + Math.random() * 2.5; // variable size, much bigger
        shooters.push({
          x: Math.random() * w * 0.75,
          y: Math.random() * h * 0.55,
          vx: Math.cos(-angle) * speed,
          vy: Math.sin(-angle) * speed,
          len: 180 + Math.random() * 250, // longer tails
          life: 0,
          maxLife: 60 + Math.random() * 45,
          size,
        });
      }
      nextShootAt = ts + shootingInterval * (0.4 + Math.random() * 0.8);
    }

    function resize() {
      canvas!.width = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
      init();
    }

    function draw(ts: number) {
      const w = canvas!.width, h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      curOffX += (tgtOffX - curOffX) * 0.045; // slightly slower, more fluid
      curOffY += (tgtOffY - curOffY) * 0.045;

      if (ts > nextShootAt) spawnShooter(ts);

      const mouseNear = mouseX > -500;
      const PULL_R = 200;
      const PULL_STR = 18;
      const GLOW_R = 160;
      const LINE_R = 230;

      // ── Constellation lines ──────────────────────────────────────────────
      for (const { a, b } of constLines) {
        const sa = stars[a], sb = stars[b];
        const ax = sa.x + curOffX * sa.depth;
        const ay = sa.y + curOffY * sa.depth;
        const bx = sb.x + curOffX * sb.depth;
        const by = sb.y + curOffY * sb.depth;
        const al = ((sa.alpha + sb.alpha) / 2) * 0.18;
        ctx!.beginPath();
        ctx!.moveTo(ax, ay);
        ctx!.lineTo(bx, by);
        ctx!.strokeStyle = `rgba(120,150,240,${al})`;
        ctx!.lineWidth = 0.5;
        ctx!.stroke();
      }

      // ── Cursor constellation lines + glow ────────────────────────────────
      if (mouseNear) {
        const near: { s: Star; d: number }[] = [];
        for (const s of stars) {
          const sx = s.x + curOffX * s.depth;
          const sy = s.y + curOffY * s.depth;
          const d = Math.hypot(mouseX - sx, mouseY - sy);
          if (d < LINE_R) near.push({ s, d });
        }
        near.sort((a, b) => a.d - b.d);

        for (const { s, d } of near.slice(0, 8)) {
          const sx = s.x + curOffX * s.depth;
          const sy = s.y + curOffY * s.depth;
          const op = Math.pow(1 - d / LINE_R, 1.4) * 0.8;
          const grad = ctx!.createLinearGradient(mouseX, mouseY, sx, sy);
          grad.addColorStop(0, `rgba(180,205,255,${op})`);
          grad.addColorStop(0.6, `rgba(160,185,255,${op * 0.4})`);
          grad.addColorStop(1, `rgba(160,185,255,0)`);
          ctx!.beginPath();
          ctx!.moveTo(mouseX, mouseY);
          ctx!.lineTo(sx, sy);
          ctx!.strokeStyle = grad;
          ctx!.lineWidth = 1.0;
          ctx!.stroke();
        }

        const halo = ctx!.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 22);
        halo.addColorStop(0, "rgba(160,185,255,0.4)");
        halo.addColorStop(0.4, "rgba(140,170,255,0.14)");
        halo.addColorStop(1, "rgba(140,170,255,0)");
        ctx!.beginPath();
        ctx!.arc(mouseX, mouseY, 22, 0, Math.PI * 2);
        ctx!.fillStyle = halo;
        ctx!.fill();

        ctx!.beginPath();
        ctx!.arc(mouseX, mouseY, 2.5, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(220,235,255,0.95)";
        ctx!.fill();
      }

      // ── Click ripples ────────────────────────────────────────────────────
      ripples = ripples.filter((r) => ts - r.t < 1000);
      for (const rp of ripples) {
        const age = Math.max(0, ts - rp.t);
        const p = Math.min(1, age / 1000);
        const r1 = p * 240;
        const o1 = (1 - p) * 0.45;
        ctx!.beginPath();
        ctx!.arc(rp.x, rp.y, r1, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(160,185,255,${o1})`;
        ctx!.lineWidth = 1.2 * (1 - p * 0.5);
        ctx!.stroke();
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

      // ── Stars ────────────────────────────────────────────────────────────
      for (const s of stars) {
        // Bigger twinkle amplitude
        const twinkle = Math.sin(ts * s.speed + s.phase) * 0.42;
        let a = Math.max(0.05, Math.min(0.98, s.alpha + twinkle));

        // Drift offset — stars slowly float
        const drift = Math.sin(ts * 0.00008 + s.driftPhase);
        let dx = curOffX * s.depth + drift * s.driftX * 40;
        let dy = curOffY * s.depth + drift * s.driftY * 40;

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
            a = Math.min(1, a + (1 - dist / GLOW_R) * 0.7);
          }
        }

        const px = s.x + dx, py = s.y + dy;

        if (!isFinite(px) || !isFinite(py)) continue;

        // Soft glow halo behind each face
        if (s.r > 1.2) {
          const gr = s.r * 6;
          const grd = ctx!.createRadialGradient(px, py, 0, px, py, gr);
          grd.addColorStop(0, `rgba(${s.r_},${s.g_},${s.b_},${a * 0.28})`);
          grd.addColorStop(1, `rgba(${s.r_},${s.g_},${s.b_},0)`);
          ctx!.beginPath();
          ctx!.arc(px, py, gr, 0, Math.PI * 2);
          ctx!.fillStyle = grd;
          ctx!.fill();
        }

        // Circular face avatar — sized so even small stars show a face
        const faceSize = Math.max(12, s.r * 9);
        const half = faceSize / 2;
        const img = faceImages[s.faceIdx];
        ctx!.save();
        ctx!.globalAlpha = a;
        ctx!.beginPath();
        ctx!.arc(px, py, half, 0, Math.PI * 2);
        ctx!.clip();
        if (img && img.complete && img.naturalWidth > 0) {
          try {
            ctx!.drawImage(img, px - half, py - half, faceSize, faceSize);
          } catch {
            // canvas taint fallback
            ctx!.fillStyle = `rgba(${s.r_},${s.g_},${s.b_},1)`;
            ctx!.fill();
          }
        } else {
          // Dot while loading
          ctx!.fillStyle = `rgba(${s.r_},${s.g_},${s.b_},1)`;
          ctx!.fill();
        }
        ctx!.restore();

        // Thin white ring so each face reads clearly against dark sky
        ctx!.beginPath();
        ctx!.arc(px, py, half, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(255,255,255,${a * 0.55})`;
        ctx!.lineWidth = 0.9;
        ctx!.stroke();
      }

      // ── Shooting stars (larger, more frequent) ───────────────────────────
      shooters = shooters.filter((sh) => sh.life < sh.maxLife);
      for (const sh of shooters) {
        sh.life++;
        sh.x += sh.vx;
        sh.y += sh.vy;
        const p = sh.life / sh.maxLife;
        const alpha = p < 0.12 ? p / 0.12 : 1 - (p - 0.12) / 0.88;
        const speed = Math.hypot(sh.vx, sh.vy);
        const tailX = sh.x - (sh.vx / speed) * sh.len;
        const tailY = sh.y - (sh.vy / speed) * sh.len;

        const sGrad = ctx!.createLinearGradient(sh.x, sh.y, tailX, tailY);
        sGrad.addColorStop(0, `rgba(255,255,255,${alpha})`);
        sGrad.addColorStop(0.2, `rgba(220,235,255,${alpha * 0.7})`);
        sGrad.addColorStop(0.55, `rgba(180,205,255,${alpha * 0.3})`);
        sGrad.addColorStop(1, "rgba(160,190,255,0)");
        ctx!.beginPath();
        ctx!.moveTo(sh.x, sh.y);
        ctx!.lineTo(tailX, tailY);
        ctx!.strokeStyle = sGrad;
        ctx!.lineWidth = sh.size * (1 - p * 0.35); // thicker lines
        ctx!.stroke();

        // Bright flaring head
        const headR = sh.size * 2.8;
        const hGrad = ctx!.createRadialGradient(sh.x, sh.y, 0, sh.x, sh.y, headR);
        hGrad.addColorStop(0, `rgba(255,255,255,${alpha})`);
        hGrad.addColorStop(0.4, `rgba(200,220,255,${alpha * 0.6})`);
        hGrad.addColorStop(1, "rgba(180,200,255,0)");
        ctx!.beginPath();
        ctx!.arc(sh.x, sh.y, headR, 0, Math.PI * 2);
        ctx!.fillStyle = hGrad;
        ctx!.fill();
      }
    }

    function updateMouse(clientX: number, clientY: number) {
      const rect = canvas!.getBoundingClientRect();
      mouseX = clientX - rect.left;
      mouseY = clientY - rect.top;
      const cx = rect.width / 2, cy = rect.height / 2;
      tgtOffX = ((mouseX - cx) / cx) * MAX_PARALLAX;
      tgtOffY = ((mouseY - cy) / cy) * MAX_PARALLAX;
    }

    function onMouseMove(e: MouseEvent) { updateMouse(e.clientX, e.clientY); }
    function onMouseLeave() { mouseX = -9999; mouseY = -9999; tgtOffX = 0; tgtOffY = 0; }
    function onTouchMove(e: TouchEvent) { updateMouse(e.touches[0].clientX, e.touches[0].clientY); }
    function addRipple(clientX: number, clientY: number, ts: number) {
      const rect = canvas!.getBoundingClientRect();
      ripples.push({ x: clientX - rect.left, y: clientY - rect.top, t: ts });
    }
    function onPointerDown(e: PointerEvent) { addRipple(e.clientX, e.clientY, performance.now()); }

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.documentElement.addEventListener("mouseleave", onMouseLeave);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    function loop(ts: number) { draw(ts); animId = requestAnimationFrame(loop); }
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("pointerdown", onPointerDown);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [count, shootingInterval]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
