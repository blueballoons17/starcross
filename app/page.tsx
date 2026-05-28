"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Heart, Sparkles, Moon } from "lucide-react";
import { AnimatedHero } from "@/components/ui/animated-hero";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { StarField } from "@/components/ui/star-field";
import { ShootingStarLogo } from "@/components/ui/shooting-star-logo";
import { ZodiacIcon, ZodiacIconDark } from "@/components/ui/zodiac-icon";
import { Button } from "@/components/ui/button";
import { getZodiacColor } from "@/lib/zodiac-colors";
import { cn } from "@/lib/utils";
import { useRef, useEffect } from "react";

const SIGNS = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces",
];

const HERO_WORDS = [
  "truly compatible", "written for you", "cosmically aligned",
  "deeply resonant", "meant to last",
];

const HOW_IT_WORKS = [
  {
    id: 1, title: "Birth Chart", subtitle: "Step 1",
    content: "Enter your date, time, and place of birth. We calculate your Sun, Moon, and Rising signs to form your unique astrological fingerprint.",
    icon: "⊙", relatedIds: [2], energy: 100,
  },
  {
    id: 2, title: "Elements", subtitle: "Step 2",
    content: "We map your elemental makeup — fire, earth, air, water — and modal tendencies across cardinal, fixed, and mutable energies.",
    icon: "◈", relatedIds: [1, 3], energy: 90,
  },
  {
    id: 3, title: "Personality", subtitle: "Step 3",
    content: "Your chart generates a structured personality profile: emotional style, communication tendencies, relationship needs, and conflict patterns.",
    icon: "❋", relatedIds: [2, 4], energy: 85,
  },
  {
    id: 4, title: "Matching", subtitle: "Step 4",
    content: "Our engine scores compatibility across elemental harmony, sign synastry, emotional alignment, and communication style. 0–100.",
    icon: "◎", relatedIds: [3, 5], energy: 80,
  },
  {
    id: 5, title: "Connection", subtitle: "Step 5",
    content: "See why each match works, what to navigate, and shared traits — so you start every conversation with context, not guesswork.",
    icon: "✦", relatedIds: [4], energy: 75,
  },
];

const FEATURES = [
  {
    symbol: "⊙", title: "Three-Sign Matching",
    description: "Your Sun sign is just the beginning. We use your Sun, Moon, and Rising together — the way astrology was always meant to be read.",
  },
  {
    symbol: "◈", title: "Elemental Harmony",
    description: "Fire and air feed each other. Earth and water ground each other. We weight elemental affinity as the backbone of every compatibility score.",
  },
  {
    symbol: "✦", title: "Human Explanations",
    description: "Every match comes with a plain-language breakdown of what works, what to navigate, and which traits you share. No cryptic jargon.",
  },
];

const PREVIEW_MATCHES = [
  { name: "Sofia",  age: 27, sun: "Pisces",   moon: "Cancer",  rising: "Libra",     score: 94, city: "New York" },
  { name: "Amara",  age: 29, sun: "Scorpio",  moon: "Pisces",  rising: "Cancer",    score: 88, city: "London"   },
  { name: "Zara",   age: 25, sun: "Taurus",   moon: "Virgo",   rising: "Capricorn", score: 82, city: "Paris"    },
];

// ── Inline constellation canvas for the hero strip ──────────────────────────
function ConstellationCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    // Fixed constellation points (normalised 0-1)
    const pts = [
      [0.08, 0.35], [0.18, 0.20], [0.28, 0.55], [0.38, 0.25],
      [0.50, 0.45], [0.60, 0.18], [0.70, 0.55], [0.80, 0.30],
      [0.90, 0.60], [0.95, 0.20],
      [0.45, 0.75], [0.55, 0.82], [0.65, 0.72],
      [0.15, 0.72], [0.25, 0.80], [0.35, 0.68],
    ];
    const edges = [
      [0,1],[1,3],[3,2],[2,4],[4,5],[5,7],[7,9],[7,8],
      [10,11],[11,12],[13,14],[14,15],
    ];

    // Scattered tiny stars
    const stars = Array.from({ length: 55 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 0.9 + 0.2,
      a: Math.random(), s: Math.random() * 0.012 + 0.004, p: Math.random() * Math.PI * 2,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const W = canvas.width, H = canvas.height;

      // Constellation lines
      ctx.strokeStyle = "rgba(120,113,108,0.22)";
      ctx.lineWidth = 0.7;
      edges.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(pts[a][0] * W, pts[a][1] * H);
        ctx.lineTo(pts[b][0] * W, pts[b][1] * H);
        ctx.stroke();
      });

      // Constellation nodes
      pts.forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(px * W, py * H, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(168,162,158,0.7)";
        ctx.fill();
      });

      // Twinkling stars
      stars.forEach((s) => {
        s.p += s.s;
        const alpha = 0.18 + 0.32 * ((1 + Math.sin(s.p)) / 2);
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(120,113,108,${alpha})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    const obs = new ResizeObserver(resize);
    obs.observe(canvas);
    return () => { cancelAnimationFrame(raf); obs.disconnect(); };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" />;
}

// Light score ring (stone palette, matches actual app style)
function PreviewScoreRing({ score }: { score: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 90 ? "#92400e" : score >= 80 ? "#44403c" : "#a8a29e";
  const colorEnd = score >= 90 ? "#b45309" : score >= 80 ? "#78716c" : "#d6d3d1";
  const id = `pg-${score}`;

  return (
    <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
      <svg width="44" height="44" className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={colorEnd} />
          </linearGradient>
        </defs>
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(28,25,23,0.07)" strokeWidth="3.5" />
        <circle cx="22" cy="22" r={r} fill="none" stroke={`url(#${id})`}
          strokeWidth="3.5" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-[11px] font-bold text-stone-800">{score}</span>
        <span className="text-[7px] text-stone-400 mt-px">%</span>
      </div>
    </div>
  );
}

// Light match card — mirrors actual MatchCard style
function PreviewMatchCard({ match, delay }: { match: typeof PREVIEW_MATCHES[0]; delay: number }) {
  const sunColor = getZodiacColor(match.sun);
  const moonColor = getZodiacColor(match.moon);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-stone-100 shadow-sm"
    >
      {/* Avatar */}
      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
        {match.name[0]}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1 mb-1.5">
          <span className="text-stone-900 font-semibold text-sm leading-none">{match.name},</span>
          <span className="text-stone-400 text-xs">{match.age} · {match.city}</span>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <span className={cn(
            "inline-flex items-center gap-1 px-1.5 py-px rounded-full text-[10px] border font-medium",
            sunColor.bg, sunColor.text, sunColor.border
          )}>
            <ZodiacIcon sign={match.sun} size={11} className="bg-transparent border-0" />
            {match.sun}
          </span>
          <span className={cn(
            "inline-flex items-center gap-1 px-1.5 py-px rounded-full text-[10px] border font-medium",
            moonColor.bg, moonColor.text, moonColor.border
          )}>
            <ZodiacIcon sign={match.moon} size={11} className="bg-transparent border-0" />
            {match.moon} Moon
          </span>
        </div>
      </div>

      <PreviewScoreRing score={match.score} />
    </motion.div>
  );
}

function AppPreview() {
  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[#FAF8F4]">

      {/* ── Dark constellation hero strip ───────────────────────── */}
      <div className="relative shrink-0 overflow-hidden bg-stone-950" style={{ height: "38%" }}>
        <ConstellationCanvas />

        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(255,252,245,0.045) 0%, transparent 70%)" }}
        />

        {/* Orbital rings */}
        {[140, 100, 64].map((d, i) => (
          <div key={d} className="absolute rounded-full border border-stone-700/20"
            style={{
              width: d, height: d,
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              opacity: 0.35 - i * 0.08,
              animation: `ring-spin ${38 + i * 14}s linear infinite ${i % 2 ? "reverse" : ""}`,
            }}
          />
        ))}

        {/* Center orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center shadow-lg">
            <span className="text-stone-300 text-xs select-none">✦</span>
          </div>
        </div>

        {/* Floating sign icons around orb */}
        {([
          { sign: "Leo",      angle: -40, r: 52 },
          { sign: "Aquarius", angle:  90, r: 50 },
          { sign: "Pisces",   angle: 200, r: 54 },
          { sign: "Scorpio",  angle: 310, r: 50 },
        ] as { sign: string; angle: number; r: number }[]).map(({ sign, angle, r }) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <div key={sign}
              className="absolute z-10"
              style={{
                top: "50%", left: "50%",
                transform: `translate(calc(-50% + ${r * Math.cos(rad)}px), calc(-50% + ${r * Math.sin(rad)}px))`,
              }}
            >
              <ZodiacIconDark sign={sign} size={20} />
            </div>
          );
        })}

        {/* Caption */}
        <div className="absolute bottom-0 inset-x-0 px-4 pb-3 z-20">
          <p className="text-[9px] text-stone-500 uppercase tracking-[0.18em]">Your cosmic fingerprint</p>
          <div className="flex items-center gap-1.5 mt-1">
            <ZodiacIconDark sign="Leo"      size={16} />
            <span className="text-[10px] text-stone-300 font-medium">Leo</span>
            <span className="text-stone-700 text-[9px] mx-0.5">·</span>
            <ZodiacIconDark sign="Aquarius" size={16} />
            <span className="text-[10px] text-stone-300 font-medium">Aquarius</span>
            <span className="text-stone-700 text-[9px] mx-0.5">·</span>
            <ZodiacIconDark sign="Gemini"   size={16} />
            <span className="text-[10px] text-stone-300 font-medium">Gemini</span>
          </div>
        </div>
      </div>

      {/* ── Light content ────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">

        {/* NavBar strip */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-100 bg-[#FAF8F4]/90 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-1.5">
            <ShootingStarLogo size={12} className="text-stone-700" />
            <span className="font-serif text-stone-900 font-semibold text-xs tracking-tight">StarCross</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-stone-400 uppercase tracking-wider">Matches</span>
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-stone-600 to-stone-900 flex items-center justify-center text-white text-[9px] font-bold">Y</div>
          </div>
        </div>

        {/* Match list */}
        <div className="flex-1 overflow-hidden px-3 pt-3 space-y-2">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[9px] text-stone-400 uppercase tracking-widest">Cosmic matches</span>
            <span className="text-[9px] text-stone-400">3 new today</span>
          </div>
          {PREVIEW_MATCHES.map((m, i) => (
            <PreviewMatchCard key={m.name} match={m} delay={0.1 + i * 0.09} />
          ))}
        </div>

        {/* Bottom nav */}
        <div className="shrink-0 border-t border-stone-100 bg-white/80 px-4 py-2 flex items-center justify-around">
          {[
            { icon: Heart,    label: "Discover", active: false },
            { icon: Sparkles, label: "Matches",  active: true  },
            { icon: Moon,     label: "Chart",    active: false },
          ].map(({ icon: Icon, label, active }) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <Icon className={cn("h-3.5 w-3.5", active ? "text-stone-900" : "text-stone-300")} />
              <span className={cn("text-[8px] font-medium", active ? "text-stone-900" : "text-stone-400")}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY       = useTransform(heroScroll, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(heroScroll, [0, 0.55], [1, 0]);

  return (
    <div className="min-h-screen bg-[#FAF8F4] overflow-x-hidden">

      {/* ── Fixed header ─────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#FAF8F4]/80 border-b border-stone-100/60">
        <div className="max-w-5xl mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <ShootingStarLogo size={18} className="text-stone-800" />
            <span className="font-serif text-lg font-semibold text-stone-900 tracking-tight">
              StarCross
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="text-stone-600 hover:text-stone-900">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild className="bg-stone-900 text-white hover:bg-stone-800 rounded-full px-5">
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-28 overflow-hidden bg-stone-950"
      >
        {/* Cursor-parallax star canvas */}
        <StarField count={230} />

        {/* Radial glow at center */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 42%, rgba(255,252,245,0.055) 0%, transparent 70%)",
          }}
        />

        {/* Slowly-rotating orbital rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[680, 490, 310, 155].map((d, i) => (
            <div
              key={d}
              className="absolute rounded-full border border-stone-700/25"
              style={{
                width: d, height: d,
                animation: `ring-spin ${42 + i * 18}s linear infinite ${i % 2 ? "reverse" : ""}`,
                opacity: 0.38 - i * 0.07,
              }}
            />
          ))}
        </div>

        {/* Hero text */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center max-w-3xl w-full"
        >
          {/* ── Static label "Find someone" ──────────────────────────── */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-stone-500 font-medium tracking-wide mb-3"
            style={{ fontSize: "clamp(1.1rem, 2.6vw, 1.5rem)" }}
          >
            Find someone
          </motion.p>

          {/*
            ── Animated word ──────────────────────────────────────────
            Container has a FIXED PIXEL height (clamp) so the layout
            never collapses regardless of font metrics or word length.
            overflow-hidden clips any sub-pixel bleed from italic glyphs.
          */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="w-full overflow-hidden mb-10"
            style={{ height: "clamp(4rem, 9.5vw, 6.8rem)" }}
          >
            {/* Inner div centres the text inside the fixed-height slot */}
            <div
              className="w-full h-full flex items-center justify-center font-serif font-semibold text-stone-100 tracking-tight"
              style={{ fontSize: "clamp(3rem, 8vw, 5.8rem)" }}
            >
              <AnimatedHero words={HERO_WORDS} prefix="" suffix="" />
            </div>
          </motion.div>

          {/* ── Sub-headline — sits BELOW the reserved slot, never overlaps ── */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.32 }}
            className="text-base sm:text-lg text-stone-400 max-w-lg mx-auto leading-relaxed mb-12"
          >
            StarCross maps your birth chart into a compatibility fingerprint — then finds the people who match it most deeply.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button size="lg" asChild className="bg-white text-stone-900 hover:bg-stone-100 px-10 rounded-full h-12 font-medium">
              <Link href="/signup">
                Begin your journey <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-stone-700 text-stone-300 hover:bg-stone-800/50 rounded-full h-12 px-8">
              <Link href="/login">Already a member</Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-stone-600 text-xs"
        >
          <span className="tracking-widest uppercase text-[10px]">Scroll to discover</span>
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-8 bg-gradient-to-b from-stone-600 to-transparent"
          />
        </motion.div>
      </section>

      {/* ── ContainerScroll: app preview ─────────────────────────────────── */}
      <section className="bg-[#FAF8F4] overflow-hidden">
        <ContainerScroll
          titleComponent={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-5 pb-4"
            >
              <span className="text-xs tracking-widest uppercase text-stone-400 block">
                The experience
              </span>
              <h2 className="font-serif text-4xl md:text-[3.5rem] font-semibold text-stone-900 leading-[1.1] tracking-tight">
                Your cosmic matches,{" "}
                <span className="italic text-stone-500">beautifully surfaced</span>
              </h2>
              <p className="text-stone-500 text-base max-w-md mx-auto leading-relaxed">
                Every profile scored, every connection explained — using the full depth of your birth chart.
              </p>
            </motion.div>
          }
        >
          <AppPreview />
        </ContainerScroll>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-3"
          >
            <span className="text-xs tracking-widest uppercase text-stone-400">The system</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl font-semibold text-stone-900 text-center tracking-tight mb-4"
          >
            How StarCross works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-stone-500 text-center max-w-md mx-auto mb-4 text-base"
          >
            Click any node to explore each step. Watch the orbit to see how the pieces connect.
          </motion.p>
          <RadialOrbitalTimeline timelineData={HOW_IT_WORKS} />
        </div>
      </section>

      {/* ── Zodiac ticker strip ───────────────────────────────────────────── */}
      <section className="py-14 bg-stone-50 border-y border-stone-100 overflow-hidden">
        <div className="relative">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 36, ease: "linear", repeat: Infinity }}
            className="flex gap-5 whitespace-nowrap w-max"
          >
            {[...Array(2)].flatMap((_, rep) =>
              SIGNS.map((sign, idx) => {
                // Warm monochromatic palette — all amber/honey/stone family, progressively shaded
                const warmPalette: { bg: string; text: string; border: string }[] = [
                  { bg: "#fef9f0", text: "#a16207", border: "#fde68a" }, // Aries
                  { bg: "#fef5e3", text: "#92400e", border: "#fcd34d" }, // Taurus
                  { bg: "#fef1d4", text: "#b45309", border: "#fbbf24" }, // Gemini
                  { bg: "#f5f3f0", text: "#57534e", border: "#d6d3d1" }, // Cancer
                  { bg: "#fff1e0", text: "#9a3412", border: "#fdba74" }, // Leo
                  { bg: "#fef7e8", text: "#78350f", border: "#fde68a" }, // Virgo
                  { bg: "#faf0e2", text: "#854d0e", border: "#f5d49a" }, // Libra
                  { bg: "#f4ede2", text: "#5c4033", border: "#e0c8a8" }, // Scorpio
                  { bg: "#fef6e0", text: "#b45309", border: "#fde68a" }, // Sagittarius
                  { bg: "#eeebe6", text: "#44403c", border: "#d0c8be" }, // Capricorn
                  { bg: "#fef8ed", text: "#a16207", border: "#fde68a" }, // Aquarius
                  { bg: "#fef4e0", text: "#92400e", border: "#fcd34d" }, // Pisces
                ];
                const c = warmPalette[idx % warmPalette.length];
                return (
                  <span
                    key={`${sign}-${rep}`}
                    className="inline-flex items-center gap-2 pl-2 pr-4 py-2 rounded-full border text-sm font-medium"
                    style={{ background: c.bg, color: c.text, borderColor: c.border }}
                  >
                    <ZodiacIcon sign={sign} size={26} />
                    {sign}
                  </span>
                );
              })
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 bg-[#FAF8F4] relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-xs tracking-widest uppercase text-stone-400 block mb-4">
              The difference
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-stone-900 tracking-tight">
              Built for depth,
              <br />
              <span className="italic text-stone-500">not novelty</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-xl mb-7">
                  {f.symbol}
                </div>
                <h3 className="font-serif text-lg font-semibold text-stone-900 mb-4">{f.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-36 px-6 bg-stone-950 text-white text-center relative overflow-hidden">
        <StarField count={130} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[780, 540, 310].map((d) => (
            <div
              key={d}
              className="absolute rounded-full border border-stone-800"
              style={{ width: d, height: d }}
            />
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-2xl mx-auto space-y-6"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShootingStarLogo size={22} className="text-stone-400" />
          </div>
          <p className="font-serif text-sm italic text-stone-400">
            Your chart is waiting
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold leading-tight tracking-tight">
            The stars have always
            <br />
            known your story.
          </h2>
          <p className="text-stone-400 text-base leading-relaxed max-w-md mx-auto">
            Create your birth profile in two minutes. Discover who you&apos;re cosmically aligned with.
          </p>
          <div className="pt-2">
            <Button size="lg" asChild className="bg-white text-stone-900 hover:bg-stone-100 rounded-full px-12 h-12">
              <Link href="/signup">
                Begin your journey <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 bg-stone-950 text-stone-500 text-center text-sm border-t border-stone-900">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ShootingStarLogo size={16} className="text-stone-400" />
          <span className="font-serif text-stone-300">StarCross</span>
        </div>
        <p>&copy; {new Date().getFullYear()} StarCross. Written in the stars.</p>
      </footer>

      <style>{`
        @keyframes ring-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
