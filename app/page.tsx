"use client";

import Link from "next/link";
import { motion, useInView, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Heart, Sparkles, Moon } from "lucide-react";
import { AnimatedHero } from "@/components/ui/animated-hero";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import { StarField } from "@/components/ui/star-field";
import { ZodiacIcon } from "@/components/ui/zodiac-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRef, useEffect } from "react";
import { useSession } from "next-auth/react";

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
    content: "We map your elemental makeup, fire, earth, air, water, and modal tendencies across cardinal, fixed, and mutable energies.",
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
    content: "See why each match works, what to navigate, and shared traits, so you start every conversation with context, not guesswork.",
    icon: "✦", relatedIds: [4], energy: 75,
  },
];

const ELEMENTS = [
  {
    name: "Fire",
    glyph: "△",
    signs: ["Aries", "Leo", "Sagittarius"],
    tagline: "Passion & Drive",
    description:
      "Magnetic, bold, and electric. Fire signs ignite every room they enter and love with fierce, undeniable intensity.",
    accent: "#f59e0b",
    bg: "#fffbeb",
    border: "#fde68a",
    textAccent: "#b45309",
  },
  {
    name: "Earth",
    glyph: "◻",
    signs: ["Taurus", "Virgo", "Capricorn"],
    tagline: "Stability & Loyalty",
    description:
      "Grounded, sensual, and enduring. Earth signs build lasting bonds with patience, presence, and quiet devotion.",
    accent: "#78716c",
    bg: "#fafaf9",
    border: "#e7e5e4",
    textAccent: "#44403c",
  },
  {
    name: "Air",
    glyph: "○",
    signs: ["Gemini", "Libra", "Aquarius"],
    tagline: "Curiosity & Connection",
    description:
      "Witty, communicative, and restlessly curious. Air signs need intellectual spark to truly fall, and stay, in love.",
    accent: "#6366f1",
    bg: "#eef2ff",
    border: "#c7d2fe",
    textAccent: "#4338ca",
  },
  {
    name: "Water",
    glyph: "▽",
    signs: ["Cancer", "Scorpio", "Pisces"],
    tagline: "Depth & Intuition",
    description:
      "Empathic, intuitive, and profoundly feeling. Water signs love with their whole soul and never forget a real connection.",
    accent: "#0ea5e9",
    bg: "#f0f9ff",
    border: "#bae6fd",
    textAccent: "#0369a1",
  },
];

const FEATURES = [
  {
    symbol: "⊙", title: "Three-Sign Matching",
    description: "Your Sun sign is just the beginning. We use your Sun, Moon, and Rising together, the way astrology was always meant to be read.",
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


// ── Synastry aspect data ─────────────────────────────────────────────────────
const SYNASTRY_ASPECTS = [
  { planet1: "♀ Venus", aspect: "trine",   planet2: "☽ Moon",    label: "Harmonic", col: "#818cf8" },
  { planet1: "☉ Sun",   aspect: "sextile", planet2: "♀ Venus",   label: "Flowing",  col: "#34d399" },
  { planet1: "☽ Moon",  aspect: "conjunct",planet2: "☽ Moon",    label: "Deep bond", col: "#f472b6" },
  { planet1: "↑ Rising",aspect: "trine",   planet2: "☉ Sun",     label: "Magnetic", col: "#f59e0b" },
];

function SynastryRow({ planet1, aspect, planet2, label, col }: typeof SYNASTRY_ASPECTS[0]) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="text-[8px] text-stone-300 font-medium w-12 shrink-0">{planet1}</span>
      <div className="flex items-center gap-1 shrink-0">
        <div className="w-3 h-px" style={{ background: col }} />
        <span className="text-[7px] uppercase tracking-[0.08em]" style={{ color: col }}>{aspect}</span>
        <div className="w-3 h-px" style={{ background: col }} />
      </div>
      <span className="text-[8px] text-stone-300 font-medium w-12 shrink-0">{planet2}</span>
      <span className="ml-auto text-[6px] px-1.5 py-0.5 rounded-full border shrink-0"
        style={{ color: col, borderColor: `${col}40`, background: `${col}15` }}>
        {label}
      </span>
    </div>
  );
}

function CompatScore({ score }: { score: number }) {
  const r = 18, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg width="48" height="48" className="-rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
        <circle cx="24" cy="24" r={r} fill="none" stroke="#818cf8" strokeWidth="2.5"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-[11px] font-bold text-white">{score}</span>
        <span className="text-[5px] text-indigo-300 -mt-px">%</span>
      </div>
    </div>
  );
}

function AppPreview() {
  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[#07091f]">

      {/* ── NavBar ───────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-indigo-400/20 bg-[#07091f]/90 backdrop-blur-md">
        <span className="text-[8px] font-semibold text-white tracking-[0.28em]" style={{ fontFamily: "var(--font-inter)" }}>starcross</span>
        <div className="flex items-center gap-3">
          {["Discover","Matches","Astrology"].map((l, i) => (
            <span key={l} className={cn("text-[7px] uppercase tracking-[0.1em]", i === 2 ? "text-indigo-300" : "text-stone-500")}>{l}</span>
          ))}
        </div>
      </div>

      {/* ── Two profiles + score ─────────────────────────────────── */}
      <div className="shrink-0 px-4 pt-3 pb-2 flex items-center justify-between">
        {/* Profile A */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-400/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Zara" className="w-full h-full object-cover" />
          </div>
          <p className="text-[7px] text-stone-300">Zara, 25</p>
          <p className="text-[6px] text-indigo-300/70">♉ Taurus</p>
        </div>

        {/* Compatibility ring + label */}
        <div className="flex flex-col items-center gap-0.5">
          <CompatScore score={94} />
          <p className="text-[6px] uppercase tracking-[0.14em] text-indigo-300/80">Cosmic Match</p>
        </div>

        {/* Profile B */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-rose-400/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://randomuser.me/api/portraits/women/26.jpg" alt="Sofia" className="w-full h-full object-cover" />
          </div>
          <p className="text-[7px] text-stone-300">Sofia, 27</p>
          <p className="text-[6px] text-rose-300/70">♓ Pisces</p>
        </div>
      </div>

      {/* ── Synastry aspects ─────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col px-4 gap-1.5">
        <p className="text-[6px] uppercase tracking-[0.16em] text-indigo-400/70 shrink-0">Key Aspects</p>
        <div className="flex-1 overflow-hidden bg-indigo-950/40 border border-indigo-400/15 rounded-[4px] px-2 divide-y divide-indigo-400/[0.08]">
          {SYNASTRY_ASPECTS.map((a) => (
            <SynastryRow key={a.planet1 + a.planet2} {...a} />
          ))}
        </div>

        {/* Elemental bars */}
        <div className="shrink-0 bg-white/[0.03] border border-indigo-400/10 rounded-[4px] px-2.5 py-2">
          <p className="text-[6px] uppercase tracking-[0.12em] text-indigo-400/60 mb-1.5">Elemental Harmony</p>
          {[
            { label: "Fire",  pct: 72, col: "#f59e0b" },
            { label: "Water", pct: 88, col: "#6366f1" },
            { label: "Air",   pct: 55, col: "#38bdf8" },
          ].map(e => (
            <div key={e.label} className="flex items-center gap-1.5 mb-1 last:mb-0">
              <span className="text-[6px] text-stone-400 w-7 shrink-0">{e.label}</span>
              <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${e.pct}%`, backgroundColor: e.col, opacity: 0.85 }} />
              </div>
              <span className="text-[6px] text-stone-500 shrink-0">{e.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom nav ───────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-indigo-400/20 bg-[#07091f]/95 px-4 py-2 flex items-center justify-around">
        {[
          { icon: Heart,    label: "Discover",  active: false },
          { icon: Sparkles, label: "Matches",   active: false },
          { icon: Moon,     label: "Astrology", active: true  },
        ].map(({ icon: Icon, label, active }) => (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <Icon className={cn("h-3 w-3", active ? "text-indigo-400" : "text-stone-500")} />
            <span className={cn("text-[7px] tracking-wide", active ? "text-indigo-300" : "text-stone-500")}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Phone mockup with ContainerScroll-style tilt on scroll ───────────────────
function PhoneMockup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center 55%"],
  });
  // Smooth spring so the tilt feels fluid, not snappy
  const rawRotate = useTransform(scrollYProgress, [0, 1], [24, 0]);
  const rawScale  = useTransform(scrollYProgress, [0, 1], [0.86, 1]);
  const rotateX   = useSpring(rawRotate, { stiffness: 80, damping: 22 });
  const scale     = useSpring(rawScale,  { stiffness: 80, damping: 22 });

  return (
    <div ref={containerRef} className="flex justify-center" style={{ perspective: "1400px" }}>
      <motion.div
        style={{ rotateX, scale }}
        className="relative rounded-[2.4rem] border-[3px] border-stone-800 bg-stone-950 overflow-hidden w-[260px] h-[520px]"
        // layered shadow: subtle ambient + strong drop
        initial={{ boxShadow: "0 48px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)" }}
        whileInView={{ boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)" }}
        viewport={{ once: true }}
      >
        {/* Dynamic Island / notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-[22px] bg-stone-950 rounded-full z-20 border border-stone-700/40" />
        <AppPreview />
      </motion.div>
    </div>
  );
}

// ── Section nav links ─────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  { id: "how-it-works", label: "How It Works" },
  { id: "elements",     label: "Elements"     },
  { id: "astrology",    label: "Astrology"    },
  { id: "pricing-cta",  label: "Pricing"      },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const heroCTARef = useRef<HTMLDivElement>(null);
  const heroCTAInView = useInView(heroCTARef, { margin: "0px 0px -40px 0px" });

  return (
    <div className="min-h-screen bg-[#FAF8F4] overflow-x-hidden">

      {/* ── Fixed header ─────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.07] bg-[#07091f]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-20 items-center gap-10 px-8">

          {/* Logo — large bold */}
          <Link href="/" className="shrink-0">
            <span
              className="text-4xl font-semibold text-white tracking-[0.25em]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              starcross
            </span>
          </Link>

          {/* Section nav links — centre */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {NAV_SECTIONS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
                className="px-4 py-1.5 text-sm font-medium text-white/60 hover:text-white border-b-2 border-transparent hover:border-white/40 transition-all"
              >
                {label}
              </button>
            ))}
          </nav>

          {/* CTA buttons — right */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            {isLoggedIn ? (
              <Button size="sm" asChild className="bg-white text-stone-900 hover:bg-stone-100 rounded-full px-5">
                <Link href="/discover">Open app →</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="text-white/70 hover:text-white hover:bg-white/10 rounded-full px-5">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild className="bg-white text-stone-900 hover:bg-stone-100 rounded-full px-6 font-medium">
                  <Link href="/pricing">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero — fixed behind everything, content slides over it ──────── */}
      <section
        id="hero"
        className="fixed inset-0 flex flex-col items-center justify-center px-6 overflow-hidden z-0"
        style={{ background: "#07091f" }}
      >
        <StarField count={320} />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 65% 50% at 50% 42%, rgba(80,100,200,0.12) 0%, transparent 70%)" }}
        />

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

        <div className="relative z-10 text-center max-w-3xl w-full">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-stone-500 font-medium tracking-wide mb-3"
            style={{ fontSize: "clamp(1.1rem, 2.6vw, 1.5rem)" }}
          >
            Find someone
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="w-full overflow-hidden mb-10"
            style={{ height: "clamp(4rem, 9.5vw, 6.8rem)" }}
          >
            <div
              className="w-full h-full flex items-center justify-center font-serif font-semibold text-stone-100 tracking-tight"
              style={{ fontSize: "clamp(3rem, 8vw, 5.8rem)" }}
            >
              <AnimatedHero words={HERO_WORDS} prefix="" suffix="" />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.32 }}
            className="text-base sm:text-lg text-stone-400 max-w-lg mx-auto leading-relaxed mb-12"
          >
            StarCross maps your birth chart into a compatibility fingerprint, then finds the people who match it most deeply.
          </motion.p>

          <motion.div
            ref={heroCTARef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            {isLoggedIn ? (
              <Button size="lg" asChild className="bg-white text-stone-900 hover:bg-stone-100 px-10 rounded-full h-12 font-medium">
                <Link href="/discover">Go to Discover <ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild className="bg-white text-stone-900 hover:bg-stone-100 px-10 rounded-full h-12 font-medium">
                  <Link href="/pricing">Begin your journey <ArrowRight className="h-4 w-4 ml-2" /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-stone-700 text-stone-300 hover:bg-stone-800/50 rounded-full h-12 px-8">
                  <Link href="/login">Already a member</Link>
                </Button>
              </>
            )}
          </motion.div>
        </div>

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

      {/* Spacer — pushes content below the fixed hero */}
      <div className="h-screen" aria-hidden="true" />

      {/* ── All content below slides over the fixed hero ─────────────────── */}
      <div className="relative z-10">

      {/* ── App preview + How it works — side by side ────────────────────── */}
      <section id="app-preview" className="bg-[#FAF8F4] overflow-hidden shadow-[0_-24px_60px_rgba(0,0,0,0.5)] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* ── Left: phone mockup ─────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-8"
            >
              <div className="text-center">
                <span className="text-xs tracking-widest uppercase text-stone-400 block mb-3">The experience</span>
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-stone-900 leading-tight tracking-tight">
                  See why every match{" "}
                  <span className="italic text-stone-500">is written in the stars</span>
                </h2>
                <p className="text-stone-500 text-sm max-w-sm mx-auto mt-3 leading-relaxed">
                  Full synastry breakdown — planetary aspects, elemental harmony, and a compatibility score — for every person you meet.
                </p>
              </div>

              <PhoneMockup />
            </motion.div>

            {/* ── Right: how it works ────────────────────────────── */}
            <motion.div
              id="how-it-works"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col"
            >
              <div className="text-center mb-2">
                <span className="text-xs tracking-widest uppercase text-stone-400 block mb-3">The system</span>
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-stone-900 tracking-tight">
                  How StarCross works
                </h2>
                <p className="text-stone-500 text-sm max-w-xs mx-auto mt-3">
                  Click any node to explore each step.
                </p>
              </div>
              <RadialOrbitalTimeline timelineData={HOW_IT_WORKS} />
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      {/* ── Astrology teaser ─────────────────────────────────────────────── */}
      <section id="elements" className="py-32 px-6 bg-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs tracking-widest uppercase text-stone-400 block mb-4">
              The foundations
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-stone-900 tracking-tight">
              More than your Sun sign.
              <br />
              <span className="italic text-stone-500">Much more.</span>
            </h2>
            <p className="text-stone-500 text-base max-w-lg mx-auto mt-6 leading-relaxed">
              Most horoscopes only scratch the surface. StarCross reads your full elemental makeup, the four building blocks that shape how you love, communicate, and connect.
            </p>
          </motion.div>

          {/* 4 Elements grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
            {ELEMENTS.map((el, i) => (
              <motion.div
                key={el.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-2xl border p-6 flex flex-col gap-4"
                style={{ background: el.bg, borderColor: el.border }}
              >
                {/* Glyph + name */}
                <div className="flex items-center gap-2.5">
                  <span
                    className="text-2xl leading-none"
                    style={{ color: el.accent }}
                  >
                    {el.glyph}
                  </span>
                  <div>
                    <p
                      className="font-serif text-base font-semibold leading-tight"
                      style={{ color: el.textAccent }}
                    >
                      {el.name}
                    </p>
                    <p
                      className="text-[10px] uppercase tracking-[0.1em] mt-0.5"
                      style={{ color: el.accent }}
                    >
                      {el.tagline}
                    </p>
                  </div>
                </div>

                {/* Sign chips */}
                <div className="flex flex-wrap gap-1.5">
                  {el.signs.map((sign) => (
                    <span
                      key={sign}
                      className="inline-flex items-center gap-1 text-[10px] font-medium rounded-full px-2 py-0.5 border"
                      style={{
                        background: `${el.accent}18`,
                        color: el.textAccent,
                        borderColor: `${el.accent}40`,
                      }}
                    >
                      <ZodiacIcon sign={sign} size={12} />
                      {sign}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <p className="text-stone-500 text-xs leading-relaxed flex-1">
                  {el.description}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ── How the matching works (astrology education) ─────────────────── */}
      <section id="astrology" className="py-32 px-6 text-white relative overflow-hidden" style={{ background: "#07091f" }}>
        <StarField count={100} />
        <div className="max-w-5xl mx-auto relative z-10">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <span className="text-xs tracking-widest uppercase text-stone-500 block mb-5">
              The method
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-white tracking-tight leading-[1.08] max-w-xl">
              Astrology is not<br />
              <span className="text-stone-400 italic">Sun-sign matchmaking.</span>
            </h2>
            <div className="w-10 h-px bg-white/15 mt-7 mb-7" />
            <p className="text-stone-400 text-base leading-relaxed max-w-xl">
              A birth chart captures where every planet sat at the exact moment you were born.
              StarCross reads that chart, not just your Sun sign, and scores compatibility
              across the dimensions that actually predict whether two people connect.
            </p>
          </motion.div>

          {/* 4 pillars of astrology-based matching */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 mb-24">
            {[
              {
                n: "01",
                title: "The birth chart",
                body: "At the moment of birth, every planet occupied a specific degree of the zodiac. The natal chart records those positions. It doesn't determine fate, it describes the psychological landscape you came in with: the drives, needs, and patterns that show up repeatedly through your life.",
              },
              {
                n: "02",
                title: "Synastry",
                body: "Synastry is what happens when you overlay two people's charts. The question isn't just what signs they are, it's which of their planets make contact, and at what angle. A Sun-Moon conjunction creates instant emotional recognition. Saturn conjunct Venus creates a bond that feels meaningful but tests both people.",
              },
              {
                n: "03",
                title: "Venus and Mars",
                body: "Venus describes what you find beautiful, how you express affection, and what you need to feel loved. Mars describes how you pursue things and what activates you. Compatibility lives in how these planets interact between two charts, not just in Sun-sign pairing. Most apps ignore Venus and Mars entirely.",
              },
              {
                n: "04",
                title: "The houses",
                body: "The 12 houses divide the chart into areas of life. The 7th house governs long-term partnership. The 5th governs romance and play. The 8th governs intimacy and deep bonding. Planets falling in these houses between two people's charts describe where the relationship will be most alive.",
              },
            ].map(({ n, title, body }, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                className="flex gap-6"
              >
                <span className="font-serif text-stone-600 text-sm shrink-0 pt-0.5">{n}</span>
                <div>
                  <h3 className="font-serif text-white text-xl font-semibold mb-3">{title}</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">{body}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* How StarCross scores it */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="border-t border-white/8 pt-14"
          >
            <h3 className="font-serif text-2xl md:text-3xl font-semibold text-white mb-4">
              How StarCross reads the chart
            </h3>
            <p className="text-stone-400 text-sm leading-relaxed max-w-xl mb-12">
              Sun-sign matching is where most apps stop. StarCross starts there and goes further
              calculating a full natal chart and scoring compatibility across the dimensions
              that actually matter.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-14 gap-y-8 mb-12">
              {[
                {
                  n: "01",
                  title: "Full natal chart",
                  desc: "Sun, Moon, Rising, Venus, and Mars positions calculated from your exact birth data.",
                },
                {
                  n: "02",
                  title: "Elemental balance",
                  desc: "How your fire, earth, air, and water compositions interact, same-element comfort vs. cross-element spark.",
                },
                {
                  n: "03",
                  title: "Modal harmony",
                  desc: "Whether your Cardinal, Fixed, and Mutable energies complement each other or compete for the lead.",
                },
                {
                  n: "04",
                  title: "Composite score",
                  desc: "A weighted compatibility score from 0–100 that surfaces your most resonant matches first.",
                },
              ].map(({ n, title, desc }) => (
                <div key={n} className="flex gap-5">
                  <span className="font-serif text-stone-600 text-sm shrink-0 pt-0.5">{n}</span>
                  <div>
                    <p className="text-white text-sm font-semibold mb-1">{title}</p>
                    <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/astrology"
              className="inline-flex items-center gap-2 text-stone-400 hover:text-white text-sm transition-colors"
            >
              Read the full astrology guide
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>

        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section id="pricing-cta" className="py-36 px-6 text-white text-center relative overflow-hidden" style={{ background: "#07091f" }}>
        <StarField count={180} />
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
          <div className="flex items-center justify-center mb-2">
            <span
              className="text-3xl font-light text-stone-300 tracking-[0.32em]"
              style={{ fontFamily: "var(--font-cinzel)", textShadow: "0 0 40px rgba(120,140,255,0.3)" }}
            >
              starcross
            </span>
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
              <Link href="/pricing">
                Begin your journey <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      </div>{/* end sticky-cover wrapper */}

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 text-stone-500 text-center text-sm border-t border-stone-800/60" style={{ background: "#07091f" }}>
        <div className="flex items-center justify-center mb-4">
          <span
            className="text-xl font-light text-stone-400 tracking-[0.32em]"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            starcross
          </span>
        </div>
        <div className="flex justify-center gap-6 text-xs mb-4">
          <Link href="/privacy" className="text-stone-500 hover:text-stone-300 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="text-stone-500 hover:text-stone-300 transition-colors">Terms of Service</Link>
          <Link href="/cookies" className="text-stone-500 hover:text-stone-300 transition-colors">Cookie Policy</Link>
        </div>
        <p className="text-xs">&copy; {new Date().getFullYear()} StarCross. Written in the stars.</p>
      </footer>

      {/* ── Sticky floating CTA ──────────────────────────────────────────── */}
      <AnimatePresence>
        {!isLoggedIn && !heroCTAInView && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <Button
              size="lg"
              asChild
              className="pointer-events-auto bg-stone-900 text-white hover:bg-stone-800 rounded-full px-10 h-12 font-medium shadow-2xl shadow-black/40 border border-stone-700/50 backdrop-blur-sm"
            >
              <Link href="/pricing">
                Begin your journey <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes ring-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
