"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";
import Link from "next/link";
import { ZodiacIcon } from "@/components/ui/zodiac-icon";
import { getZodiacColor } from "@/lib/zodiac-colors";
import { cn } from "@/lib/utils";

interface MatchCelebrationProps {
  open: boolean;
  onClose: () => void;
  match: {
    name: string;
    sunSign: string;
    moonSign: string;
    risingSign: string;
    matchScore: number;
    birthCity: string;
    birthCountry: string;
  };
  mySunSign: string;
}

function StarCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: 90 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.4 + 0.3,
      a: Math.random(),
      s: Math.random() * 0.006 + 0.002,
      p: Math.random() * Math.PI * 2,
    }));

    let frame = 0;
    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      stars.forEach((star) => {
        star.p += star.s;
        const alpha = 0.3 + 0.5 * ((1 + Math.sin(star.p)) / 2);
        ctx.beginPath();
        ctx.arc(star.x * canvas.width, star.y * canvas.height, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,252,240,${alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

function SignBadge({ sign, label }: { sign: string; label: string }) {
  const c = getZodiacColor(sign);
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border",
      c.bg, c.text, c.border
    )}>
      <ZodiacIcon sign={sign} size={14} className="bg-transparent border-0" />
      {label && <span className="opacity-60">{label}:</span>} {sign}
    </span>
  );
}

export function MatchCelebration({ open, onClose, match, mySunSign }: MatchCelebrationProps) {
  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const sunColor = getZodiacColor(match.sunSign);
  const scoreBand = match.matchScore >= 80 ? "amber" : match.matchScore >= 65 ? "stone" : "stone";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="match-celebration"
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-stone-950/95"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Star canvas */}
          <div className="absolute inset-0 overflow-hidden">
            <StarCanvas />
          </div>

          {/* Card */}
          <motion.div
            className="relative z-10 w-full max-w-sm bg-stone-900/80 border border-stone-700/60 rounded-3xl p-8 text-center backdrop-blur-md shadow-2xl overflow-hidden"
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Subtle radial glow behind card content */}
            <div
              className="absolute inset-0 pointer-events-none rounded-3xl"
              style={{
                background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(251,191,36,0.07) 0%, transparent 70%)",
              }}
            />

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-6"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-stone-600" />
                <span className="text-stone-500 text-xs tracking-widest uppercase">Cosmic Match</span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-stone-600" />
              </div>
              <h2 className="font-serif text-3xl font-semibold text-stone-100 leading-tight">
                You&apos;re aligned
              </h2>
              <p className="text-stone-400 text-sm mt-1">The stars had this planned all along.</p>
            </motion.div>

            {/* Avatars — two initials connected by a heart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 260, damping: 20 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              {/* My sign */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-stone-700 to-stone-900 border-2 border-stone-600 flex items-center justify-center shadow-lg">
                <ZodiacIcon sign={mySunSign} size={32} className="bg-transparent border-0" />
              </div>

              {/* Heart */}
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart className="h-6 w-6 text-rose-400 fill-rose-400/60" />
              </motion.div>

              {/* Their sign */}
              <div className={cn(
                "w-16 h-16 rounded-full border-2 flex items-center justify-center shadow-lg",
                sunColor.bg, sunColor.border
              )}>
                <ZodiacIcon sign={match.sunSign} size={32} className="bg-transparent border-0" />
              </div>
            </motion.div>

            {/* Name + location */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mb-4"
            >
              <p className="font-serif text-xl font-semibold text-stone-100">{match.name}</p>
              <p className="text-stone-500 text-sm">{match.birthCity}, {match.birthCountry}</p>
            </motion.div>

            {/* Signs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-1.5 justify-center mb-6"
            >
              <SignBadge sign={match.sunSign} label="Sun" />
              <SignBadge sign={match.moonSign} label="Moon" />
              <SignBadge sign={match.risingSign} label="Rising" />
            </motion.div>

            {/* Score pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, type: "spring" }}
              className="mb-8"
            >
              <div className={cn(
                "inline-flex items-center gap-2 px-5 py-2 rounded-full border font-bold text-lg",
                scoreBand === "amber"
                  ? "bg-amber-900/30 border-amber-600/40 text-amber-300"
                  : "bg-stone-800 border-stone-600 text-stone-200"
              )}>
                {match.matchScore}%
                <span className="text-sm font-normal opacity-70">compatible</span>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <Link
                href="/matches"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full bg-stone-100 hover:bg-white text-stone-900 font-medium rounded-full py-3 px-6 transition-colors text-sm"
              >
                See full compatibility
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={onClose}
                className="w-full text-stone-500 hover:text-stone-300 transition-colors text-sm py-2"
              >
                Keep swiping
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
