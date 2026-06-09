"use client";
import { useEffect, useRef } from "react";

// Same-origin proxy URLs — canvas drawImage works without any CORS taint.
const FACE_SRCS = [
  "/api/avatar?gender=women&num=2",
  "/api/avatar?gender=women&num=14",
  "/api/avatar?gender=women&num=25",
  "/api/avatar?gender=women&num=27",
  "/api/avatar?gender=women&num=31",
  "/api/avatar?gender=women&num=33",
  "/api/avatar?gender=women&num=45",
  "/api/avatar?gender=women&num=63",
  "/api/avatar?gender=women&num=64",
  "/api/avatar?gender=women&num=65",
  "/api/avatar?gender=women&num=83",
  "/api/avatar?gender=women&num=85",
  "/api/avatar?gender=men&num=5",
  "/api/avatar?gender=men&num=7",
  "/api/avatar?gender=men&num=22",
  "/api/avatar?gender=men&num=25",
  "/api/avatar?gender=men&num=29",
  "/api/avatar?gender=men&num=30",
  "/api/avatar?gender=men&num=31",
  "/api/avatar?gender=men&num=38",
  "/api/avatar?gender=men&num=54",
  "/api/avatar?gender=men&num=65",
  "/api/avatar?gender=men&num=85",
  "/api/avatar?gender=men&num=90",
];

// Lazy-load face images only on desktop (deferred until after first paint)
let faceImages: HTMLImageElement[] = [];
let facesLoaded = false;
function loadFacesIfNeeded() {
  if (facesLoaded || typeof window === "undefined") return;
  if (window.innerWidth < 768 || navigator.maxTouchPoints > 1) return; // skip on mobile
  facesLoaded = true;
  faceImages = FACE_SRCS.map((src) => {
    const img = new Image();
    img.src = src;
    return img;
  });
}

// Page background colour (#07091f)
const BG_R = 7, BG_G = 9, BG_B = 31;

// Distance (px) within which a face begins to reveal (~1 inch at 96 dpi)
const PROXIMITY_RADIUS = 110;
// Lines only appear within this distance from the cursor
const LINE_REACH = 200;

interface Star {
  x: number; y: number; r: number;
  alpha: number; speed: number; phase: number;
  depth: number;
  driftX: number; driftY: number; driftPhase: number;
  faceIdx: number;
  faceReveal: number; // 0 = golden star dot · 1 = full face circle
}
interface Ripple { x: number; y: number; t: number; }
interface Shooter {
  x: number; y: number; vx: number; vy: number;
  len: number; life: number; maxLife: number; size: number;
}

export function StarField({
  count = 280,
  className = "",
  shootingInterval = 1500,
}: {
  count?: number;
  className?: string;
  shootingInterval?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Device detection ──────────────────────────────────────────────────────
    const isMobile = window.innerWidth < 768 || navigator.maxTouchPoints > 1;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 2 : 2);
    const effectiveCount = isMobile ? Math.min(count, 110) : count;
    const fpsTarget = isMobile ? 30 : 60;
    const minFrameMs = 1000 / fpsTarget;

    // Lazy-load faces on desktop only, after a short delay so they don't block first paint
    if (!isMobile) {
      setTimeout(loadFacesIfNeeded, 800);
    }

    let animId: number;
    let stars: Star[] = [];
    let ripples: Ripple[] = [];
    let shooters: Shooter[] = [];
    let nextShootAt = 0;
    let lastFrameTs = 0;

    let mouseX = -9999, mouseY = -9999;
    let curOffX = 0, curOffY = 0;
    let tgtOffX = 0, tgtOffY = 0;
    const MAX_PARALLAX = isMobile ? 0 : 52; // no parallax on mobile

    // Logical (CSS) dimensions — canvas is scaled by dpr internally
    let cssW = 0, cssH = 0;

    function init() {
      cssW = canvas!.offsetWidth;
      cssH = canvas!.offsetHeight;
      canvas!.width  = cssW * dpr;
      canvas!.height = cssH * dpr;
      ctx!.scale(dpr, dpr);

      stars = Array.from({ length: effectiveCount }, () => {
        const r = Math.pow(Math.random(), 1.5) * 3.2 + 0.3;
        return {
          x: Math.random() * cssW, y: Math.random() * cssH, r,
          alpha: Math.random() * 0.65 + 0.28,
          speed: Math.random() * 0.0022 + 0.0006,
          phase: Math.random() * Math.PI * 2,
          depth: Math.pow((r - 0.3) / 3.2, 1.4),
          driftX: (Math.random() - 0.5) * 0.018,
          driftY: (Math.random() - 0.5) * 0.012,
          driftPhase: Math.random() * Math.PI * 2,
          faceIdx: Math.floor(Math.random() * FACE_SRCS.length),
          faceReveal: 0,
        };
      });
      nextShootAt = performance.now() + shootingInterval * 0.5;
    }

    function spawnShooter(ts: number) {
      const burst = isMobile ? 1 : (Math.random() < 0.3 ? Math.floor(Math.random() * 2) + 2 : 1);
      for (let b = 0; b < burst; b++) {
        const angle = (Math.random() * Math.PI) / 3.5 + Math.PI / 7;
        const speed = 9 + Math.random() * 10;
        shooters.push({
          x: Math.random() * cssW * 0.75, y: Math.random() * cssH * 0.55,
          vx: Math.cos(-angle) * speed, vy: Math.sin(-angle) * speed,
          len: 180 + Math.random() * 250, life: 0,
          maxLife: 60 + Math.random() * 45, size: 1.5 + Math.random() * 2.5,
        });
      }
      nextShootAt = ts + shootingInterval * (0.4 + Math.random() * 0.8);
    }

    // Draw one star. faceReveal: 0 = golden dot, 1 = full face.
    function drawStar(s: Star, px: number, py: number, a: number, faceReveal: number) {
      const starDotR = Math.max(2.0, s.r * 1.0 + 1.0);
      const faceHalf  = 26 + s.r * 3;
      const half = starDotR + (faceHalf - starDotR) * faceReveal;

      if (faceReveal < 0.04) {
        if (isMobile) {
          // ── Mobile: simple dot, no radial gradient (much faster) ──────
          ctx!.beginPath();
          ctx!.arc(px, py, starDotR, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(255,252,200,${a})`;
          ctx!.fill();
        } else {
          // ── Desktop: golden glow ──────────────────────────────────────
          const glowR = starDotR * 5;
          const grd = ctx!.createRadialGradient(px, py, 0, px, py, glowR);
          grd.addColorStop(0,   `rgba(255,232,110,${a * 0.85})`);
          grd.addColorStop(0.3, `rgba(255,210, 55,${a * 0.35})`);
          grd.addColorStop(0.7, `rgba(255,180, 25,${a * 0.10})`);
          grd.addColorStop(1,   "rgba(255,160,20,0)");
          ctx!.beginPath();
          ctx!.arc(px, py, glowR, 0, Math.PI * 2);
          ctx!.fillStyle = grd;
          ctx!.fill();
          ctx!.beginPath();
          ctx!.arc(px, py, starDotR, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(255,252,200,${a})`;
          ctx!.fill();
        }
      } else {
        // ── Transitioning / revealed face (desktop only) ─────────────────
        const glowR = half * 2.0;
        const ga    = a * (0.55 - faceReveal * 0.25);
        const gr    = Math.round(255 - 75  * faceReveal);
        const gg    = Math.round(220 - 35  * faceReveal);
        const gb    = Math.round(80  + 175 * faceReveal);
        const grd   = ctx!.createRadialGradient(px, py, 0, px, py, glowR);
        grd.addColorStop(0,    `rgba(${gr},${gg},${gb},${ga})`);
        grd.addColorStop(0.55, `rgba(${gr},${gg},${gb},${ga * 0.12})`);
        grd.addColorStop(1,    `rgba(${gr},${gg},${gb},0)`);
        ctx!.beginPath();
        ctx!.arc(px, py, glowR, 0, Math.PI * 2);
        ctx!.fillStyle = grd;
        ctx!.fill();

        ctx!.save();
        ctx!.globalAlpha = a;
        ctx!.beginPath();
        ctx!.arc(px, py, half, 0, Math.PI * 2);
        ctx!.clip();

        const faceSize = half * 2;
        const img = faceImages[s.faceIdx];
        if (img && img.complete && img.naturalWidth > 0) {
          ctx!.globalAlpha = a * Math.min(1, faceReveal * 2.5);
          ctx!.drawImage(img, px - half, py - half, faceSize, faceSize);
          const vigStart = 0.62 + faceReveal * 0.13;
          const vgrd = ctx!.createRadialGradient(px, py, half * vigStart, px, py, half);
          vgrd.addColorStop(0, `rgba(${BG_R},${BG_G},${BG_B},0)`);
          vgrd.addColorStop(1, `rgba(${BG_R},${BG_G},${BG_B},${0.88 - faceReveal * 0.30})`);
          ctx!.globalAlpha = 1;
          ctx!.fillStyle = vgrd;
          ctx!.fillRect(px - half - 1, py - half - 1, faceSize + 2, faceSize + 2);
        } else {
          const dotG = ctx!.createRadialGradient(px, py, 0, px, py, half);
          dotG.addColorStop(0, `rgba(255,230,110,${a})`);
          dotG.addColorStop(1, "rgba(255,180,30,0)");
          ctx!.globalAlpha = a;
          ctx!.fillStyle = dotG;
          ctx!.fill();
        }
        ctx!.restore();

        if (faceReveal > 0.15) {
          ctx!.beginPath();
          ctx!.arc(px, py, half, 0, Math.PI * 2);
          ctx!.strokeStyle = `rgba(255,255,255,${a * faceReveal * 0.75})`;
          ctx!.lineWidth = faceReveal * 2.2;
          ctx!.stroke();
        }
      }
    }

    function draw(ts: number) {
      // Frame rate cap
      if (ts - lastFrameTs < minFrameMs) {
        animId = requestAnimationFrame(draw);
        return;
      }
      lastFrameTs = ts;

      ctx!.clearRect(0, 0, cssW, cssH);

      if (!isMobile) {
        curOffX += (tgtOffX - curOffX) * 0.045;
        curOffY += (tgtOffY - curOffY) * 0.045;
      }

      if (ts > nextShootAt) spawnShooter(ts);

      // Pre-compute positions with parallax + drift
      const pos = stars.map((s) => {
        const drift = Math.sin(ts * 0.00008 + s.driftPhase);
        return {
          px: s.x + curOffX * s.depth + (isMobile ? 0 : drift * s.driftX * 40),
          py: s.y + curOffY * s.depth + (isMobile ? 0 : drift * s.driftY * 40),
        };
      });

      // Update faceReveal per star (desktop only)
      let topRevealIdx = -1, topReveal = 0.001;
      if (!isMobile) {
        for (let i = 0; i < stars.length; i++) {
          const { px, py } = pos[i];
          let target = 0;
          if (mouseX > -500) {
            const d = Math.hypot(mouseX - px, mouseY - py);
            if (d < PROXIMITY_RADIUS) {
              target = Math.pow(1 - d / PROXIMITY_RADIUS, 0.65);
            }
          }
          stars[i].faceReveal += (target - stars[i].faceReveal) * 0.10;
          if (stars[i].faceReveal > topReveal) {
            topReveal    = stars[i].faceReveal;
            topRevealIdx = i;
          }
        }
      }

      // ── Cursor constellation lines (desktop only) ─────────────────────
      if (!isMobile && mouseX > -500) {
        for (let i = 0; i < stars.length; i++) {
          const { px, py } = pos[i];
          const d = Math.hypot(mouseX - px, mouseY - py);
          if (d < LINE_REACH) {
            const prox = 1 - d / LINE_REACH;
            const op   = Math.pow(prox, 1.3) * 0.82;
            const g    = ctx!.createLinearGradient(mouseX, mouseY, px, py);
            g.addColorStop(0,    `rgba(210,230,255,${op})`);
            g.addColorStop(0.45, `rgba(180,205,255,${op * 0.45})`);
            g.addColorStop(1,    "rgba(160,185,255,0)");
            ctx!.beginPath();
            ctx!.moveTo(mouseX, mouseY);
            ctx!.lineTo(px, py);
            ctx!.strokeStyle = g;
            ctx!.lineWidth   = 1.3 * prox + 0.25;
            ctx!.stroke();
          }
        }
        const halo = ctx!.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 26);
        halo.addColorStop(0,   "rgba(220,238,255,0.60)");
        halo.addColorStop(0.4, "rgba(180,208,255,0.22)");
        halo.addColorStop(1,   "rgba(140,170,255,0)");
        ctx!.beginPath();
        ctx!.arc(mouseX, mouseY, 26, 0, Math.PI * 2);
        ctx!.fillStyle = halo;
        ctx!.fill();
        ctx!.beginPath();
        ctx!.arc(mouseX, mouseY, 2.0, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(242,252,255,0.92)";
        ctx!.fill();
      }

      // ── Click ripples ─────────────────────────────────────────────────
      ripples = ripples.filter((r) => ts - r.t < 1000);
      for (const rp of ripples) {
        const p = Math.min(1, (ts - rp.t) / 1000);
        ctx!.beginPath();
        ctx!.arc(rp.x, rp.y, p * 240, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(160,185,255,${(1 - p) * 0.45})`;
        ctx!.lineWidth   = 1.2 * (1 - p * 0.5);
        ctx!.stroke();
      }

      // ── Draw all stars (most-revealed goes last = on top) ─────────────
      for (let i = 0; i < stars.length; i++) {
        if (i === topRevealIdx) continue;
        const s = stars[i];
        const { px, py } = pos[i];
        if (!isFinite(px) || !isFinite(py)) continue;
        const twinkle = Math.sin(ts * s.speed + s.phase) * 0.42;
        const a = Math.max(0.05, Math.min(0.98, s.alpha + twinkle));
        drawStar(s, px, py, a, s.faceReveal);
      }
      if (topRevealIdx !== -1) {
        const s = stars[topRevealIdx];
        const { px, py } = pos[topRevealIdx];
        if (isFinite(px) && isFinite(py)) {
          const twinkle = Math.sin(ts * s.speed + s.phase) * 0.42;
          const a = Math.max(0.05, Math.min(0.98, s.alpha + twinkle));
          drawStar(s, px, py, a, s.faceReveal);
        }
      }

      // ── Shooting stars ────────────────────────────────────────────────
      shooters = shooters.filter((sh) => sh.life < sh.maxLife);
      for (const sh of shooters) {
        sh.life++; sh.x += sh.vx; sh.y += sh.vy;
        const p = sh.life / sh.maxLife;
        const alpha = p < 0.12 ? p / 0.12 : 1 - (p - 0.12) / 0.88;
        const spd = Math.hypot(sh.vx, sh.vy);
        const tx = sh.x - (sh.vx / spd) * sh.len;
        const ty = sh.y - (sh.vy / spd) * sh.len;
        const sg = ctx!.createLinearGradient(sh.x, sh.y, tx, ty);
        sg.addColorStop(0,    `rgba(255,255,255,${alpha})`);
        sg.addColorStop(0.2,  `rgba(220,235,255,${alpha * 0.7})`);
        sg.addColorStop(0.55, `rgba(180,205,255,${alpha * 0.3})`);
        sg.addColorStop(1,    "rgba(160,190,255,0)");
        ctx!.beginPath();
        ctx!.moveTo(sh.x, sh.y); ctx!.lineTo(tx, ty);
        ctx!.strokeStyle = sg;
        ctx!.lineWidth   = sh.size * (1 - p * 0.35);
        ctx!.stroke();
        if (!isMobile) {
          const hg = ctx!.createRadialGradient(sh.x, sh.y, 0, sh.x, sh.y, sh.size * 2.8);
          hg.addColorStop(0, `rgba(255,255,255,${alpha})`);
          hg.addColorStop(1, "rgba(180,200,255,0)");
          ctx!.beginPath();
          ctx!.arc(sh.x, sh.y, sh.size * 2.8, 0, Math.PI * 2);
          ctx!.fillStyle = hg; ctx!.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    }

    function updateMouse(cx: number, cy: number) {
      const r = canvas!.getBoundingClientRect();
      mouseX = cx - r.left; mouseY = cy - r.top;
      tgtOffX = ((mouseX - r.width  / 2) / (r.width  / 2)) * MAX_PARALLAX;
      tgtOffY = ((mouseY - r.height / 2) / (r.height / 2)) * MAX_PARALLAX;
    }

    const onMM = (e: MouseEvent)   => updateMouse(e.clientX, e.clientY);
    const onML = ()                => { mouseX = -9999; mouseY = -9999; tgtOffX = 0; tgtOffY = 0; };
    const onPD = (e: PointerEvent) => {
      const r = canvas!.getBoundingClientRect();
      ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() });
    };

    window.addEventListener("mousemove",  onMM, { passive: true });
    window.addEventListener("pointerdown",onPD, { passive: true });
    document.documentElement.addEventListener("mouseleave", onML);

    const ro = new ResizeObserver(() => {
      // Re-scale: reset transform before re-applying dpr scale
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      cssW = canvas!.offsetWidth;
      cssH = canvas!.offsetHeight;
      canvas!.width  = cssW * dpr;
      canvas!.height = cssH * dpr;
      ctx!.scale(dpr, dpr);
      // Reposition stars to new dimensions
      stars.forEach((s) => {
        s.x = Math.random() * cssW;
        s.y = Math.random() * cssH;
      });
      nextShootAt = performance.now() + shootingInterval * 0.5;
    });
    ro.observe(canvas);

    // Initial size
    cssW = canvas.offsetWidth;
    cssH = canvas.offsetHeight;
    canvas.width  = cssW * dpr;
    canvas.height = cssH * dpr;
    ctx.scale(dpr, dpr);
    init();

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      window.removeEventListener("mousemove",  onMM);
      window.removeEventListener("pointerdown",onPD);
      document.documentElement.removeEventListener("mouseleave", onML);
    };
  }, [count, shootingInterval]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ willChange: "transform" }}
    />
  );
}
