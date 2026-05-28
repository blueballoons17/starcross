"use client";
import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  alpha: number;
  speed: number;
  phase: number;
  depth: number; // 0–1; larger = "closer" = moves more with cursor
}

interface Line {
  a: number;
  b: number;
}

export function StarField({
  count = 180,
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
    let lines: Line[] = [];

    // Smooth parallax state
    let curOffX = 0;
    let curOffY = 0;
    let tgtOffX = 0;
    let tgtOffY = 0;
    const MAX_PARALLAX = 38; // pixels of max star-layer movement

    function resize() {
      canvas!.width = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
      init();
    }

    function init() {
      const w = canvas!.width;
      const h = canvas!.height;

      stars = Array.from({ length: count }, () => {
        const r = Math.random() * 1.6 + 0.3;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r,
          alpha: Math.random() * 0.55 + 0.2,
          speed: Math.random() * 0.014 + 0.004,
          phase: Math.random() * Math.PI * 2,
          // Bigger stars feel "closer" — non-linear depth
          depth: Math.pow((r - 0.3) / 1.6, 1.8),
        };
      });

      // Constellation lines: connect nearby stars with limited branching
      lines = [];
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 115 && Math.random() < 0.16) {
            lines.push({ a: i, b: j });
          }
        }
      }
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Lerp toward target parallax offset
      curOffX += (tgtOffX - curOffX) * 0.055;
      curOffY += (tgtOffY - curOffY) * 0.055;

      // ── Constellation lines ──
      lines.forEach(({ a, b }) => {
        const sa = stars[a];
        const sb = stars[b];
        const ax = sa.x + curOffX * sa.depth;
        const ay = sa.y + curOffY * sa.depth;
        const bx = sb.x + curOffX * sb.depth;
        const by = sb.y + curOffY * sb.depth;

        const avgAlpha = ((sa.alpha + sb.alpha) / 2) * 0.22;
        ctx!.beginPath();
        ctx!.moveTo(ax, ay);
        ctx!.lineTo(bx, by);
        ctx!.strokeStyle = `rgba(190, 180, 165, ${avgAlpha})`;
        ctx!.lineWidth = 0.65;
        ctx!.stroke();
      });

      // ── Stars ──
      stars.forEach((s) => {
        const twinkle = Math.sin(t * s.speed + s.phase) * 0.38;
        const a = Math.max(0.04, Math.min(0.9, s.alpha + twinkle));

        const dx = curOffX * s.depth;
        const dy = curOffY * s.depth;

        // Soft glow for larger stars
        if (s.r > 1.1) {
          ctx!.beginPath();
          ctx!.arc(s.x + dx, s.y + dy, s.r * 3, 0, Math.PI * 2);
          const grd = ctx!.createRadialGradient(
            s.x + dx, s.y + dy, 0,
            s.x + dx, s.y + dy, s.r * 3
          );
          grd.addColorStop(0, `rgba(210, 200, 185, ${a * 0.18})`);
          grd.addColorStop(1, "rgba(210, 200, 185, 0)");
          ctx!.fillStyle = grd;
          ctx!.fill();
        }

        // Star core
        ctx!.beginPath();
        ctx!.arc(s.x + dx, s.y + dy, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(215, 205, 190, ${a})`;
        ctx!.fill();
      });
    }

    // Mouse tracking — update target parallax offset
    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      tgtOffX = ((e.clientX - cx) / (rect.width / 2)) * MAX_PARALLAX;
      tgtOffY = ((e.clientY - cy) / (rect.height / 2)) * MAX_PARALLAX;
    }

    // Touch tracking for mobile
    function onTouchMove(e: TouchEvent) {
      const t = e.touches[0];
      const rect = canvas!.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      tgtOffX = ((t.clientX - cx) / (rect.width / 2)) * (MAX_PARALLAX * 0.6);
      tgtOffY = ((t.clientY - cy) / (rect.height / 2)) * (MAX_PARALLAX * 0.6);
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    const startTime = Date.now();
    function loop() {
      draw(Date.now() - startTime);
      animId = requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    loop();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
