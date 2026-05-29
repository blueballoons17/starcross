"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { NavBar } from "@/components/NavBar";
import { PageStars } from "@/components/PageStars";
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";

// ─── Zodiac data ─────────────────────────────────────────────────────────────

const ZODIAC = [
  {
    sign: "Aries",       glyph: "♈", element: "fire",  modality: "Cardinal",
    dates: "Mar 21 – Apr 19", planet: "Mars",
    traits: ["Courageous", "Pioneering", "Assertive"],
    desc: "The first fire of the zodiac, Aries charges forward with relentless drive. Ruled by Mars, they bring fierce independence and infectious enthusiasm to everything they pursue — the eternal cosmic initiator.",
  },
  {
    sign: "Taurus",      glyph: "♉", element: "earth", modality: "Fixed",
    dates: "Apr 20 – May 20", planet: "Venus",
    traits: ["Patient", "Sensual", "Steadfast"],
    desc: "Anchored in the physical world, Taurus seeks beauty, comfort, and enduring stability. Ruled by Venus, they possess a deep appreciation for art, nature, and the lasting value of things built slowly and well.",
  },
  {
    sign: "Gemini",      glyph: "♊", element: "air",   modality: "Mutable",
    dates: "May 21 – Jun 20", planet: "Mercury",
    traits: ["Curious", "Witty", "Adaptable"],
    desc: "The cosmic communicators, Gemini dances between ideas and perspectives with dazzling fluency. Ruled by Mercury, their mercurial minds are forever weaving threads between people, concepts, and worlds.",
  },
  {
    sign: "Cancer",      glyph: "♋", element: "water", modality: "Cardinal",
    dates: "Jun 21 – Jul 22", planet: "Moon",
    traits: ["Nurturing", "Intuitive", "Empathetic"],
    desc: "Guided by the Moon, Cancer feels the emotional undercurrents others miss entirely. Their profound empathy and protective instincts forge deep, enduring bonds rooted in genuine belonging.",
  },
  {
    sign: "Leo",         glyph: "♌", element: "fire",  modality: "Fixed",
    dates: "Jul 23 – Aug 22", planet: "Sun",
    traits: ["Charismatic", "Creative", "Generous"],
    desc: "Ruled by the Sun itself, Leo radiates warmth and creative fire. Their natural magnetism and lion-hearted courage illuminate every room — and inspire those around them to shine just as brightly.",
  },
  {
    sign: "Virgo",       glyph: "♍", element: "earth", modality: "Mutable",
    dates: "Aug 23 – Sep 22", planet: "Mercury",
    traits: ["Precise", "Devoted", "Analytical"],
    desc: "The cosmic artisans, Virgo brings extraordinary care and discernment to everything they touch. Their keen perception and dedication to craft transform raw material into true excellence.",
  },
  {
    sign: "Libra",       glyph: "♎", element: "air",   modality: "Cardinal",
    dates: "Sep 23 – Oct 22", planet: "Venus",
    traits: ["Diplomatic", "Harmonious", "Aesthetic"],
    desc: "The sign of balance and beauty, Libra seeks harmony in all things. Ruled by Venus, their graceful diplomacy and innate sense of fairness create peace where there was discord.",
  },
  {
    sign: "Scorpio",     glyph: "♏", element: "water", modality: "Fixed",
    dates: "Oct 23 – Nov 21", planet: "Pluto",
    traits: ["Intense", "Perceptive", "Transformative"],
    desc: "Pluto's domain of death and rebirth pulses through Scorpio. Their unflinching gaze penetrates all illusion, and their capacity for transformation — of self and world — runs fathomlessly deep.",
  },
  {
    sign: "Sagittarius", glyph: "♐", element: "fire",  modality: "Mutable",
    dates: "Nov 22 – Dec 21", planet: "Jupiter",
    traits: ["Adventurous", "Philosophical", "Free-spirited"],
    desc: "Jupiter's archer aims at the horizon of meaning. Sagittarius blends restless adventure with philosophical inquiry — forever expanding the map of what's possible and what's true.",
  },
  {
    sign: "Capricorn",   glyph: "♑", element: "earth", modality: "Cardinal",
    dates: "Dec 22 – Jan 19", planet: "Saturn",
    traits: ["Ambitious", "Disciplined", "Strategic"],
    desc: "Saturn shapes Capricorn into the master builder of the zodiac. Patient, principled, and deeply strategic, they construct legacies — in career, character, and community — that endure through time.",
  },
  {
    sign: "Aquarius",    glyph: "♒", element: "air",   modality: "Fixed",
    dates: "Jan 20 – Feb 18", planet: "Uranus",
    traits: ["Visionary", "Humanitarian", "Original"],
    desc: "Uranus charges Aquarius with electric originality. The great innovators and reformers, they carry visions of a more enlightened future and work tirelessly to bring that future into being.",
  },
  {
    sign: "Pisces",      glyph: "♓", element: "water", modality: "Mutable",
    dates: "Feb 19 – Mar 20", planet: "Neptune",
    traits: ["Empathetic", "Spiritual", "Intuitive"],
    desc: "Neptune dissolves all rigid boundaries, making Pisces the most spiritually attuned sign. They move between the seen and unseen with fluid grace, carrying boundless compassion for all of existence.",
  },
] as const;

type ZodiacEntry = (typeof ZODIAC)[number];
type Element = "fire" | "earth" | "air" | "water";

const ELEMENT_COLORS: Record<Element, { hex: string; glow: string; bg: string; text: string; border: string }> = {
  fire:  { hex: "#f97316", glow: "#fb923c", bg: "bg-orange-500/15",  text: "text-orange-300",  border: "border-orange-500/30"  },
  earth: { hex: "#10b981", glow: "#34d399", bg: "bg-emerald-500/15", text: "text-emerald-300", border: "border-emerald-500/30" },
  air:   { hex: "#38bdf8", glow: "#7dd3fc", bg: "bg-sky-500/15",     text: "text-sky-300",     border: "border-sky-500/30"     },
  water: { hex: "#818cf8", glow: "#a5b4fc", bg: "bg-indigo-500/15",  text: "text-indigo-300",  border: "border-indigo-500/30"  },
};

// ─── SVG Zodiac Wheel ────────────────────────────────────────────────────────

const CX = 210, CY = 210;
const INNER_R = 82;
const WHEEL_R = 176;
const BAND_R  = 196;
const GLYPH_R = 130;

function toRad(deg: number) { return (deg * Math.PI) / 180; }
function polar(r: number, deg: number) {
  return { x: CX + r * Math.cos(toRad(deg)), y: CY + r * Math.sin(toRad(deg)) };
}
function arcPath(r1: number, r2: number, a1: number, a2: number) {
  const p1 = polar(r1, a1), p2 = polar(r1, a2);
  const q1 = polar(r2, a1), q2 = polar(r2, a2);
  const la = a2 - a1 > 180 ? 1 : 0;
  return [
    `M ${p1.x.toFixed(3)} ${p1.y.toFixed(3)}`,
    `A ${r1} ${r1} 0 ${la} 1 ${p2.x.toFixed(3)} ${p2.y.toFixed(3)}`,
    `L ${q2.x.toFixed(3)} ${q2.y.toFixed(3)}`,
    `A ${r2} ${r2} 0 ${la} 0 ${q1.x.toFixed(3)} ${q1.y.toFixed(3)}`,
    `Z`,
  ].join(" ");
}

function ZodiacWheel({
  activeIdx,
  userSignIdx,
  onHover,
}: {
  activeIdx: number | null;
  userSignIdx: number | null;
  onHover: (i: number | null) => void;
}) {
  return (
    <svg
      viewBox="0 0 420 420"
      className="w-full max-w-[420px] mx-auto"
      style={{ filter: "drop-shadow(0 0 40px rgba(99,102,241,0.15))" }}
    >
      {/* Soft outer glow */}
      <circle cx={CX} cy={CY} r={BAND_R + 18} fill="#4f46e5" fillOpacity="0.04" />
      <circle cx={CX} cy={CY} r={BAND_R + 5}  fill="none" stroke="#6366f1" strokeOpacity="0.07" strokeWidth="1" />

      {ZODIAC.map((z, i) => {
        const a1 = -90 + i * 30, a2 = a1 + 30, mid = a1 + 15;
        const col  = ELEMENT_COLORS[z.element as Element];
        const isAct  = activeIdx === i;
        const isUser = userSignIdx === i;
        const gp     = polar(GLYPH_R, mid);

        return (
          <g
            key={z.sign}
            onMouseEnter={() => onHover(i)}
            onMouseLeave={() => onHover(null)}
            className="cursor-pointer"
          >
            {/* Main sector */}
            <path
              d={arcPath(INNER_R, WHEEL_R, a1, a2)}
              fill={col.hex}
              fillOpacity={isAct ? 0.38 : isUser ? 0.22 : 0.09}
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="0.5"
              style={{ transition: "fill-opacity 0.15s" }}
            />
            {/* Element band */}
            <path
              d={arcPath(WHEEL_R, BAND_R, a1, a2)}
              fill={col.hex}
              fillOpacity={isAct ? 0.9 : isUser ? 0.75 : 0.5}
              stroke="rgba(0,0,0,0.15)"
              strokeWidth="0.3"
              style={{ transition: "fill-opacity 0.15s" }}
            />
            {/* User-sign ring highlight */}
            {isUser && (
              <path
                d={arcPath(BAND_R, BAND_R + 5, a1, a2)}
                fill="white"
                fillOpacity="0.35"
              />
            )}
            {/* Glyph */}
            <text
              x={gp.x} y={gp.y}
              textAnchor="middle" dominantBaseline="central"
              fontSize={isAct ? "19" : "15"}
              fill="white"
              fillOpacity={isAct ? 1 : isUser ? 0.9 : 0.6}
              style={{ transition: "font-size 0.15s, fill-opacity 0.15s", userSelect: "none", pointerEvents: "none" }}
            >
              {z.glyph}
            </text>
          </g>
        );
      })}

      {/* Divider spokes */}
      {ZODIAC.map((_, i) => {
        const a = -90 + i * 30;
        const p1 = polar(INNER_R, a), p2 = polar(BAND_R, a);
        return (
          <line key={i}
            x1={p1.x.toFixed(2)} y1={p1.y.toFixed(2)}
            x2={p2.x.toFixed(2)} y2={p2.y.toFixed(2)}
            stroke="white" strokeOpacity="0.1" strokeWidth="0.5"
          />
        );
      })}

      {/* Inner circle */}
      <circle cx={CX} cy={CY} r={INNER_R} fill="#080B18" />
      <circle cx={CX} cy={CY} r={INNER_R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <circle cx={CX} cy={CY} r={66} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      <circle cx={CX} cy={CY} r={48} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" strokeDasharray="3 6" />

      {/* Center glyph */}
      {activeIdx !== null ? (
        <text x={CX} y={CY} textAnchor="middle" dominantBaseline="central"
          fontSize="32" fill={ELEMENT_COLORS[ZODIAC[activeIdx].element as Element].hex}
          fillOpacity="0.55"
          style={{ userSelect: "none", pointerEvents: "none", transition: "all 0.2s" }}
        >
          {ZODIAC[activeIdx].glyph}
        </text>
      ) : (
        <text x={CX} y={CY} textAnchor="middle" dominantBaseline="central"
          fontSize="28" fill="white" fillOpacity="0.12"
          style={{ userSelect: "none", pointerEvents: "none" }}
        >
          ✦
        </text>
      )}
    </svg>
  );
}

// ─── Sign detail panel ────────────────────────────────────────────────────────

function SignPanel({ activeIdx }: { activeIdx: number | null }) {
  const z   = activeIdx !== null ? ZODIAC[activeIdx] : null;
  const col = z ? ELEMENT_COLORS[z.element as Element] : null;

  return (
    <div className="flex-1 min-h-[380px] flex items-center">
      <AnimatePresence mode="wait">
        {z && col ? (
          <motion.div
            key={z.sign}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="w-full space-y-5"
          >
            {/* Sign header */}
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border shrink-0",
                col.bg, col.border
              )}>
                {z.glyph}
              </div>
              <div>
                <h3 className="font-serif text-2xl font-semibold text-white">{z.sign}</h3>
                <p className="text-stone-400 text-sm mt-0.5">{z.dates}</p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: z.element.charAt(0).toUpperCase() + z.element.slice(1), cls: cn("border", col.bg, col.text, col.border) },
                { label: z.modality, cls: "bg-white/5 text-stone-400 border border-white/10" },
                { label: `Ruled by ${z.planet}`, cls: "bg-white/5 text-stone-400 border border-white/10" },
              ].map(({ label, cls }) => (
                <span key={label} className={cn("px-3 py-1 rounded-full text-xs font-medium", cls)}>
                  {label}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="text-stone-300 text-sm leading-relaxed">{z.desc}</p>

            {/* Traits */}
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-widest mb-2.5">Core Traits</p>
              <div className="flex flex-wrap gap-2">
                {z.traits.map((t) => (
                  <span key={t}
                    className="text-xs px-3 py-1 rounded-full bg-white/6 text-stone-300 border border-white/8"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full text-center py-16"
          >
            <div className="text-6xl mb-5 opacity-[0.07]">✦</div>
            <p className="text-stone-500 font-medium">Hover a sign to reveal its archetype</p>
            <p className="text-stone-600 text-sm mt-2">Each of the twelve signs holds a unique cosmic blueprint</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Cosmic stats strip ───────────────────────────────────────────────────────

const STATS = [
  { n: "12", label: "Archetypes" },
  { n: "10", label: "Planetary Bodies" },
  { n: "4",  label: "Elements" },
  { n: "12", label: "Houses" },
  { n: "3",  label: "Modalities" },
];

// ─── Pillar cards ─────────────────────────────────────────────────────────────

const PILLARS = [
  {
    glyph: "☉",
    title: "The Natal Chart",
    subtitle: "Your Cosmic Fingerprint",
    body: "A natal chart is a precise map of the sky at the exact moment and location of your birth. Every planet's placement — from the Sun's sign to Saturn's house — encodes a unique energetic signature that shapes your character, patterns, and path.",
    accent: "amber",
  },
  {
    glyph: "☽",
    title: "The Big Three",
    subtitle: "Sun · Moon · Rising",
    body: "The Sun reveals your core identity. The Moon governs your emotional interior and instinctive reactions. The Rising (Ascendant) shapes first impressions. Together these three form the primary lens through which your entire chart is interpreted.",
    accent: "indigo",
  },
  {
    glyph: "△",
    title: "Elements & Modalities",
    subtitle: "How You Process Energy",
    body: "Fire, Earth, Air, and Water describe your fundamental mode of engagement — through passion, stability, intellect, or feeling. Cardinal, Fixed, and Mutable qualities reveal whether you initiate, sustain, or adapt. Their interplay defines your energy style.",
    accent: "sky",
  },
  {
    glyph: "⟳",
    title: "Planetary Cycles",
    subtitle: "Celestial Timing",
    body: "Planets in motion form dynamic angles to your natal positions, triggering chapters of growth and transformation. Saturn returns every ~29 years demanding maturity. Jupiter expands what it touches. The cosmos holds precise cyclical time.",
    accent: "purple",
  },
];

const PILLAR_ACCENT: Record<string, string> = {
  amber:  "from-amber-500/20 border-amber-500/20 text-amber-300",
  indigo: "from-indigo-500/20 border-indigo-500/20 text-indigo-300",
  sky:    "from-sky-500/20 border-sky-500/20 text-sky-300",
  purple: "from-violet-500/20 border-violet-500/20 text-violet-300",
};

// ─── Fade-in wrapper ──────────────────────────────────────────────────────────

function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AstrologyPage() {
  const { status } = useSession();
  const router     = useRouter();
  const [activeIdx,   setActiveIdx]   = useState<number | null>(null);
  const [userSignIdx, setUserSignIdx] = useState<number | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Load user's sun sign to highlight on wheel
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        const sun = d?.astrologyProfile?.sunSign as string | undefined;
        if (sun) {
          const idx = ZODIAC.findIndex((z) => z.sign === sun);
          if (idx !== -1) setUserSignIdx(idx);
        }
      })
      .catch(() => null);
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/40 border-t-indigo-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageStars count={280} />
      <NavBar />

      <main className="pt-20 pb-24 px-4">
        <div className="max-w-5xl mx-auto space-y-24">

          {/* ── Hero ────────────────────────────────────────────────────────── */}
          <FadeIn>
            <div className="relative rounded-3xl overflow-hidden border border-white/8 bg-black/60 backdrop-blur-sm">
              <Spotlight className="-top-40 left-0 md:left-40 md:-top-20" fill="rgba(139,92,246,0.4)" />

              <div className="flex flex-col md:flex-row min-h-[440px]">
                {/* Text */}
                <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col justify-center">
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 mb-5">
                    <span className="w-5 h-px bg-indigo-400" />
                    Celestial Intelligence
                  </span>
                  <h1 className="font-serif text-4xl md:text-5xl font-semibold text-white leading-tight mb-5">
                    The Language<br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                      of the Cosmos
                    </span>
                  </h1>
                  <p className="text-stone-400 text-base leading-relaxed max-w-md mb-8">
                    For millennia, humans have mapped the heavens to understand themselves.
                    Your birth chart is a snapshot of the sky at your first breath — a symbolic
                    blueprint revealing your psychological landscape, relational patterns, and
                    evolutionary purpose.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { v: "12", l: "Signs" },
                      { v: "4",  l: "Elements" },
                      { v: "10", l: "Planets" },
                    ].map(({ v, l }) => (
                      <div key={l} className="flex items-baseline gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/8">
                        <span className="font-serif text-xl font-semibold text-white">{v}</span>
                        <span className="text-xs text-stone-500">{l}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3D Scene */}
                <div className="flex-1 relative min-h-[280px] md:min-h-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent z-10 pointer-events-none" />
                  <SplineScene
                    scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          </FadeIn>

          {/* ── Stats strip ─────────────────────────────────────────────────── */}
          <FadeIn>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {STATS.map(({ n, label }) => (
                <div key={label}
                  className="flex flex-col items-center py-5 rounded-2xl bg-white/4 border border-white/6 backdrop-blur-sm"
                >
                  <span className="font-serif text-3xl font-semibold text-white">{n}</span>
                  <span className="text-stone-500 text-xs mt-1">{label}</span>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* ── Zodiac Wheel ─────────────────────────────────────────────────── */}
          <section>
            <FadeIn className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">
                The Twelve Archetypes
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-white mt-3">
                Every Soul Has a Sign
              </h2>
              <p className="text-stone-400 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
                Each zodiac sign represents an eternal human archetype — a distinct way of
                experiencing, expressing, and navigating existence. Hover over any sign to
                explore its cosmic nature.
              </p>
              {userSignIdx !== null && (
                <p className="text-xs text-indigo-400 mt-3 flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                  Your Sun sign is highlighted on the wheel
                </p>
              )}
            </FadeIn>

            <FadeIn>
              <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                {/* Wheel */}
                <div className="w-full lg:w-auto lg:flex-shrink-0 lg:w-[420px]">
                  <ZodiacWheel
                    activeIdx={activeIdx}
                    userSignIdx={userSignIdx}
                    onHover={setActiveIdx}
                  />
                </div>

                {/* Sign panel */}
                <div className="w-full lg:flex-1 min-h-[360px] rounded-2xl bg-white/3 border border-white/8 backdrop-blur-sm p-8">
                  <SignPanel activeIdx={activeIdx} />
                </div>
              </div>
            </FadeIn>
          </section>

          {/* ── Element groups ────────────────────────────────────────────────── */}
          <FadeIn>
            <div className="rounded-2xl bg-white/3 border border-white/8 p-6 md:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500 mb-6 text-center">
                The Four Elements
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(["fire", "earth", "air", "water"] as Element[]).map((el) => {
                  const col   = ELEMENT_COLORS[el];
                  const signs = ZODIAC.filter((z) => z.element === el);
                  const labels: Record<Element, { title: string; quality: string }> = {
                    fire:  { title: "Fire",  quality: "Passion · Drive · Vision"    },
                    earth: { title: "Earth", quality: "Stability · Form · Patience" },
                    air:   { title: "Air",   quality: "Intellect · Motion · Exchange" },
                    water: { title: "Water", quality: "Feeling · Depth · Empathy"   },
                  };
                  return (
                    <div key={el} className={cn("rounded-xl p-4 border", col.bg, col.border)}>
                      <p className={cn("font-serif font-semibold text-base mb-0.5", col.text)}>
                        {labels[el].title}
                      </p>
                      <p className="text-stone-500 text-xs mb-3 leading-snug">{labels[el].quality}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {signs.map((z) => (
                          <span key={z.sign} className={cn("text-xs px-2 py-0.5 rounded-full border", col.bg, col.text, col.border)}>
                            {z.glyph} {z.sign}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeIn>

          {/* ── Pillars ──────────────────────────────────────────────────────── */}
          <section>
            <FadeIn className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">
                What the Stars Reveal
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-white mt-3">
                Four Pillars of Astrological Insight
              </h2>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PILLARS.map(({ glyph, title, subtitle, body, accent }, i) => {
                const cls = PILLAR_ACCENT[accent];
                return (
                  <FadeIn key={title} delay={i * 0.08}>
                    <div className={cn(
                      "h-full rounded-2xl border bg-gradient-to-br to-transparent p-6 backdrop-blur-sm",
                      cls
                    )}>
                      <div className="text-3xl mb-4 opacity-60">{glyph}</div>
                      <h3 className="font-serif text-white font-semibold text-lg mb-0.5">{title}</h3>
                      <p className="text-stone-500 text-xs uppercase tracking-wider mb-3">{subtitle}</p>
                      <p className="text-stone-400 text-sm leading-relaxed">{body}</p>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </section>

          {/* ── How StarCross Uses It ────────────────────────────────────────── */}
          <FadeIn>
            <div className="relative rounded-3xl overflow-hidden border border-indigo-500/20 bg-gradient-to-br from-indigo-950/60 via-black/60 to-purple-950/40 backdrop-blur-sm p-8 md:p-12">
              {/* Background constellation dots */}
              <div className="absolute inset-0 opacity-[0.03]" aria-hidden>
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i}
                    className="absolute w-0.5 h-0.5 rounded-full bg-white"
                    style={{ left: `${(i * 37 + 11) % 97}%`, top: `${(i * 53 + 17) % 91}%` }}
                  />
                ))}
              </div>

              <div className="relative z-10 max-w-2xl mx-auto text-center">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">
                  How StarCross Works
                </span>
                <h2 className="font-serif text-3xl font-semibold text-white mt-3 mb-4">
                  Astrology Powers Every Match
                </h2>
                <p className="text-stone-400 text-sm leading-relaxed mb-10">
                  StarCross doesn't rely on personality quizzes or swipe algorithms. We calculate
                  your full natal chart from your birth data, then score compatibility across
                  multiple astrological dimensions to surface connections with genuine cosmic resonance.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 text-left">
                  {[
                    { step: "01", title: "Full Natal Chart",     desc: "We compute your Sun, Moon, Rising, and key planetary positions." },
                    { step: "02", title: "Elemental Balance",    desc: "We measure how your elemental compositions complement each other." },
                    { step: "03", title: "Modal Harmony",        desc: "Cardinal, Fixed, and Mutable energies are weighed for dynamic balance." },
                    { step: "04", title: "Cosmic Score",         desc: "A weighted compatibility score surfaces your most resonant matches." },
                  ].map(({ step, title, desc }) => (
                    <div key={step} className="flex gap-4 p-4 rounded-xl bg-white/4 border border-white/6">
                      <span className="font-serif text-indigo-400/60 text-sm font-semibold shrink-0 mt-0.5">{step}</span>
                      <div>
                        <p className="text-white text-sm font-semibold mb-0.5">{title}</p>
                        <p className="text-stone-500 text-xs leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/discover"
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors"
                  >
                    Discover Your Matches
                  </Link>
                  <Link
                    href="/profile"
                    className="px-6 py-3 rounded-xl bg-white/6 hover:bg-white/10 border border-white/10 text-stone-300 text-sm font-medium transition-colors"
                  >
                    View Your Chart
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>

        </div>
      </main>
    </div>
  );
}
