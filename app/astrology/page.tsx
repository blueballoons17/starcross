"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { NavBar } from "@/components/NavBar";
import { PageStars } from "@/components/PageStars";
import { cn } from "@/lib/utils";

// ─── Data ─────────────────────────────────────────────────────────────────────

const ZODIAC = [
  {
    sign: "Aries", glyph: "♈", element: "fire", modality: "Cardinal",
    dates: "Mar 21 – Apr 19", planet: "Mars",
    traits: ["Courageous", "Pioneering", "Assertive"],
    desc: "The first fire of the zodiac. Ruled by Mars, Aries charges forward with relentless drive — the eternal initiator, forever first to act where others still deliberate.",
  },
  {
    sign: "Taurus", glyph: "♉", element: "earth", modality: "Fixed",
    dates: "Apr 20 – May 20", planet: "Venus",
    traits: ["Patient", "Sensual", "Steadfast"],
    desc: "Ruled by Venus, Taurus seeks beauty, comfort, and enduring stability. They build slowly and well, with a deep appreciation for things that last — art, nature, loyalty.",
  },
  {
    sign: "Gemini", glyph: "♊", element: "air", modality: "Mutable",
    dates: "May 21 – Jun 20", planet: "Mercury",
    traits: ["Curious", "Witty", "Adaptable"],
    desc: "The cosmic communicators. Ruled by Mercury, Gemini dances between ideas and perspectives with dazzling fluency — forever weaving threads between people, concepts, and worlds.",
  },
  {
    sign: "Cancer", glyph: "♋", element: "water", modality: "Cardinal",
    dates: "Jun 21 – Jul 22", planet: "Moon",
    traits: ["Nurturing", "Intuitive", "Protective"],
    desc: "Guided by the Moon, Cancer feels the emotional undercurrents others miss entirely. Their profound empathy forges deep bonds rooted in genuine belonging and care.",
  },
  {
    sign: "Leo", glyph: "♌", element: "fire", modality: "Fixed",
    dates: "Jul 23 – Aug 22", planet: "Sun",
    traits: ["Charismatic", "Creative", "Generous"],
    desc: "Ruled by the Sun itself. Leo's warmth and lion-hearted courage illuminate every room — and their natural magnetism inspires those around them to shine just as brightly.",
  },
  {
    sign: "Virgo", glyph: "♍", element: "earth", modality: "Mutable",
    dates: "Aug 23 – Sep 22", planet: "Mercury",
    traits: ["Precise", "Devoted", "Analytical"],
    desc: "The cosmic artisans. Virgo brings extraordinary care to everything they touch, transforming raw material into excellence through discernment and unwavering dedication.",
  },
  {
    sign: "Libra", glyph: "♎", element: "air", modality: "Cardinal",
    dates: "Sep 23 – Oct 22", planet: "Venus",
    traits: ["Diplomatic", "Harmonious", "Aesthetic"],
    desc: "Ruled by Venus, Libra seeks balance and beauty in all things. Their graceful diplomacy and innate sense of fairness create harmony where there once was discord.",
  },
  {
    sign: "Scorpio", glyph: "♏", element: "water", modality: "Fixed",
    dates: "Oct 23 – Nov 21", planet: "Pluto",
    traits: ["Intense", "Perceptive", "Transformative"],
    desc: "Pluto's domain of death and rebirth pulses through Scorpio. Their unflinching gaze penetrates illusion; their capacity for transformation — of self and world — runs bottomless.",
  },
  {
    sign: "Sagittarius", glyph: "♐", element: "fire", modality: "Mutable",
    dates: "Nov 22 – Dec 21", planet: "Jupiter",
    traits: ["Adventurous", "Philosophical", "Free-spirited"],
    desc: "Jupiter's archer aims at the horizon of meaning. Sagittarius blends restless adventure with philosophical inquiry — forever expanding the map of what's possible.",
  },
  {
    sign: "Capricorn", glyph: "♑", element: "earth", modality: "Cardinal",
    dates: "Dec 22 – Jan 19", planet: "Saturn",
    traits: ["Ambitious", "Disciplined", "Strategic"],
    desc: "Saturn shapes Capricorn into the master builder of the zodiac. Patient and principled, they construct legacies — in career, character, and community — that endure through time.",
  },
  {
    sign: "Aquarius", glyph: "♒", element: "air", modality: "Fixed",
    dates: "Jan 20 – Feb 18", planet: "Uranus",
    traits: ["Visionary", "Humanitarian", "Original"],
    desc: "Uranus charges Aquarius with electric originality. The great innovators, they carry visions of a more enlightened future and work tirelessly to bring that future into being.",
  },
  {
    sign: "Pisces", glyph: "♓", element: "water", modality: "Mutable",
    dates: "Feb 19 – Mar 20", planet: "Neptune",
    traits: ["Empathetic", "Spiritual", "Intuitive"],
    desc: "Neptune dissolves all rigid boundaries. Pisces moves between the seen and unseen with fluid grace, carrying a boundless compassion that asks nothing in return.",
  },
] as const;

type ZodiacEntry = (typeof ZODIAC)[number];
type Element = "fire" | "earth" | "air" | "water";

const EL: Record<Element, { hex: string; name: string; quality: string }> = {
  fire:  { hex: "#f97316", name: "Fire",  quality: "Passion, drive, and vision" },
  earth: { hex: "#10b981", name: "Earth", quality: "Stability, form, and patience" },
  air:   { hex: "#38bdf8", name: "Air",   quality: "Intellect, exchange, and motion" },
  water: { hex: "#818cf8", name: "Water", quality: "Feeling, depth, and empathy" },
};

const PILLARS = [
  {
    title: "The Birth Chart",
    subtitle: "Your Natal Map",
    body: "A natal chart is a precise snapshot of the sky at the moment and location of your birth. Every planet's placement — from the Sun's sign to Saturn's house — encodes an energetic signature that shapes character, desire, and relational pattern.",
  },
  {
    title: "Sun, Moon and Rising",
    subtitle: "The Big Three",
    body: "The Sun reveals your core identity. The Moon governs your emotional interior and instinctive reactions. The Rising (Ascendant) is the mask you wear — your first impression on the world. These three form the primary lens through which everything else is read.",
  },
  {
    title: "Elements and Modalities",
    subtitle: "How You Process the World",
    body: "Fire, Earth, Air, and Water describe your fundamental mode of engagement. Cardinal, Fixed, and Mutable reveal whether you initiate, sustain, or adapt. Their interplay defines not just personality — but how two people's energies harmonise or clash.",
  },
  {
    title: "Timing and Transformation",
    subtitle: "Planetary Cycles",
    body: "Planets in motion form dynamic angles to your natal chart, triggering chapters of growth and change. Saturn returns every 29 years to demand maturity. Jupiter expands what it touches every 12. The cosmos keeps precise, impersonal time.",
  },
];

const STEPS = [
  { title: "Full natal chart",     desc: "We compute Sun, Moon, Rising, and key planetary positions from your birth data." },
  { title: "Elemental balance",    desc: "We measure how your elemental compositions complement or mirror each other." },
  { title: "Modal harmony",        desc: "Cardinal, Fixed, and Mutable energies are weighed for dynamic equilibrium." },
  { title: "Compatibility score",  desc: "A weighted score across all dimensions surfaces your most resonant matches." },
];

// ─── SVG Wheel ────────────────────────────────────────────────────────────────

const CX = 210, CY = 210, INNER = 82, WHEEL = 176, BAND = 196, GLYPH_R = 130;

const r2d = (r: number) => r;
function polar(r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}
function sector(r1: number, r2: number, a1: number, a2: number) {
  const p1 = polar(r1, a1), p2 = polar(r1, a2);
  const q1 = polar(r2, a1), q2 = polar(r2, a2);
  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `A ${r1} ${r1} 0 0 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${q2.x.toFixed(2)} ${q2.y.toFixed(2)}`,
    `A ${r2} ${r2} 0 0 0 ${q1.x.toFixed(2)} ${q1.y.toFixed(2)} Z`,
  ].join(" ");
}

function ZodiacWheel({
  activeIdx,
  userIdx,
  onHover,
}: {
  activeIdx: number | null;
  userIdx: number | null;
  onHover: (i: number | null) => void;
}) {
  return (
    <svg viewBox="0 0 420 420" className="w-full">
      {/* ambient glow */}
      <circle cx={CX} cy={CY} r={BAND + 22} fill="#4f46e5" fillOpacity="0.04" />

      {ZODIAC.map((z, i) => {
        const a1 = -90 + i * 30, a2 = a1 + 30, mid = a1 + 15;
        const hex = EL[z.element as Element].hex;
        const act = activeIdx === i;
        const usr = userIdx === i;
        const gp = polar(GLYPH_R, mid);
        return (
          <g key={z.sign} onMouseEnter={() => onHover(i)} onMouseLeave={() => onHover(null)} className="cursor-pointer">
            <path d={sector(INNER, WHEEL, a1, a2)}
              fill={hex} fillOpacity={act ? 0.38 : usr ? 0.2 : 0.08}
              stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"
              style={{ transition: "fill-opacity 0.15s" }} />
            <path d={sector(WHEEL, BAND, a1, a2)}
              fill={hex} fillOpacity={act ? 0.9 : usr ? 0.75 : 0.48}
              style={{ transition: "fill-opacity 0.15s" }} />
            {usr && (
              <path d={sector(BAND, BAND + 6, a1, a2)} fill="white" fillOpacity="0.3" />
            )}
            <text x={gp.x} y={gp.y} textAnchor="middle" dominantBaseline="central"
              fontSize={act ? "19" : "15"} fill="white"
              fillOpacity={act ? 1 : usr ? 0.9 : 0.55}
              style={{ transition: "all 0.15s", userSelect: "none", pointerEvents: "none" }}>
              {z.glyph}
            </text>
          </g>
        );
      })}

      {/* spoke dividers */}
      {ZODIAC.map((_, i) => {
        const a = -90 + i * 30;
        const p1 = polar(INNER, a), p2 = polar(BAND, a);
        return <line key={i} x1={p1.x.toFixed(1)} y1={p1.y.toFixed(1)} x2={p2.x.toFixed(1)} y2={p2.y.toFixed(1)} stroke="white" strokeOpacity="0.08" strokeWidth="0.5" />;
      })}

      {/* inner fill */}
      <circle cx={CX} cy={CY} r={INNER} fill="#080B18" />
      <circle cx={CX} cy={CY} r={INNER} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      <circle cx={CX} cy={CY} r={62} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      <circle cx={CX} cy={CY} r={42} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="2 5" />

      {/* centre symbol */}
      {activeIdx !== null ? (
        <text x={CX} y={CY} textAnchor="middle" dominantBaseline="central"
          fontSize="30" fill={EL[ZODIAC[activeIdx].element as Element].hex} fillOpacity="0.5"
          style={{ userSelect: "none", pointerEvents: "none", transition: "all 0.2s" }}>
          {ZODIAC[activeIdx].glyph}
        </text>
      ) : (
        <text x={CX} y={CY} textAnchor="middle" dominantBaseline="central"
          fontSize="22" fill="white" fillOpacity="0.1"
          style={{ userSelect: "none", pointerEvents: "none" }}>
          ✦
        </text>
      )}
    </svg>
  );
}

// ─── Sign detail (no box, pure typography) ────────────────────────────────────

function SignDetail({ activeIdx }: { activeIdx: number | null }) {
  const z = activeIdx !== null ? ZODIAC[activeIdx] : null;
  const elData = z ? EL[z.element as Element] : null;

  return (
    <div className="min-h-[200px] lg:min-h-[300px] flex flex-col justify-start pt-4 lg:pt-8">
      <AnimatePresence mode="wait">
        {z && elData ? (
          <motion.div key={z.sign}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Glyph + name */}
            <div className="flex items-baseline gap-3 mb-3">
              <span className="font-serif text-5xl leading-none" style={{ color: elData.hex }}>
                {z.glyph}
              </span>
              <h3 className="font-serif text-3xl font-semibold text-white leading-none">{z.sign}</h3>
            </div>

            {/* Meta line */}
            <p className="text-stone-500 text-sm mb-1">{z.dates}</p>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px w-6" style={{ background: elData.hex }} />
              <span className="text-sm" style={{ color: elData.hex }}>
                {z.element} · {z.modality} · {z.planet}
              </span>
            </div>

            {/* Description */}
            <p className="text-stone-400 text-sm leading-relaxed mb-5 max-w-sm">{z.desc}</p>

            {/* Traits — plain text, no chips */}
            <p className="text-stone-600 text-xs tracking-[0.18em] uppercase">
              {z.traits.join("  ·  ")}
            </p>
          </motion.div>
        ) : (
          <motion.div key="idle"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <p className="text-stone-600 text-sm">Hover a sign to explore its archetype</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Fade-in wrapper ──────────────────────────────────────────────────────────

function FadeIn({ children, delay = 0, className }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AstrologyPage() {
  const { status } = useSession();
  const router = useRouter();
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [userIdx, setUserIdx] = useState<number | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        const sun = d?.astrologyProfile?.sunSign as string | undefined;
        if (sun) {
          const i = ZODIAC.findIndex((z) => z.sign === sun);
          if (i !== -1) setUserIdx(i);
        }
      })
      .catch(() => null);
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-indigo-500/30 border-t-indigo-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageStars count={260} />
      <NavBar />

      <main className="pt-24 pb-32 px-6">
        <div className="max-w-5xl mx-auto">

          {/* ── HERO ────────────────────────────────────────────────────────── */}
          <section className="mb-28">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

              {/* Left: hero text */}
              <FadeIn>
                <p className="text-xs tracking-[0.22em] uppercase text-stone-500 mb-7">
                  Astrology
                </p>
                <h1 className="font-serif text-5xl md:text-6xl font-semibold text-white leading-[1.08] mb-7">
                  The sky at your<br />
                  first breath is<br />
                  <span className="text-stone-400">your blueprint.</span>
                </h1>
                <div className="w-10 h-px bg-white/15 mb-7" />
                <p className="text-stone-400 text-base leading-relaxed mb-8 max-w-md">
                  Astrology is a symbolic system, built over millennia, for understanding
                  human experience through celestial positions. It isn't prediction — it's
                  a precise language for self-knowledge and the dynamics between people.
                </p>
                <p className="text-stone-600 text-sm tracking-wide">
                  12 signs · 10 planets · 4 elements · 3 modalities
                </p>
              </FadeIn>

              {/* Right: zodiac wheel + sign detail */}
              <FadeIn delay={0.1}>
                <ZodiacWheel activeIdx={activeIdx} userIdx={userIdx} onHover={setActiveIdx} />
                {userIdx !== null && activeIdx === null && (
                  <p className="text-center text-xs text-stone-600 mt-3 tracking-wide">
                    Your Sun sign is marked on the wheel
                  </p>
                )}
                <SignDetail activeIdx={activeIdx} />
              </FadeIn>
            </div>
          </section>

          {/* ── PILLARS ──────────────────────────────────────────────────────── */}
          <section className="mb-28">
            <FadeIn>
              <p className="text-xs tracking-[0.22em] uppercase text-stone-500 mb-12">
                What the cosmos reveals
              </p>
            </FadeIn>

            <div>
              {PILLARS.map((p, i) => (
                <FadeIn key={p.title} delay={i * 0.06}>
                  <div className="border-t border-white/8 py-10 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
                    <div className="md:col-span-1">
                      <span className="font-serif text-stone-700 text-sm">0{i + 1}</span>
                    </div>
                    <div className="md:col-span-3">
                      <h3 className="font-serif text-white text-xl font-semibold leading-snug">{p.title}</h3>
                      <p className="text-stone-600 text-xs mt-1 tracking-wide uppercase">{p.subtitle}</p>
                    </div>
                    <div className="md:col-span-8">
                      <p className="text-stone-400 text-sm leading-relaxed">{p.body}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
              <div className="border-t border-white/8" />
            </div>
          </section>

          {/* ── ELEMENTS ────────────────────────────────────────────────────── */}
          <section className="mb-28">
            <FadeIn>
              <p className="text-xs tracking-[0.22em] uppercase text-stone-500 mb-12">
                The four elements
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                {(["fire", "earth", "air", "water"] as Element[]).map((el) => {
                  const { hex, name, quality } = EL[el];
                  const signs = ZODIAC.filter((z) => z.element === el);
                  return (
                    <div key={el}>
                      <div className="w-7 h-px mb-5" style={{ background: hex }} />
                      <p className="font-serif text-lg font-semibold text-white mb-1">{name}</p>
                      <p className="text-stone-600 text-xs mb-5 leading-snug">{quality}</p>
                      <div className="space-y-2">
                        {signs.map((z) => (
                          <p key={z.sign} className="text-stone-400 text-sm">
                            {z.glyph}&nbsp; {z.sign}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </FadeIn>
          </section>

          {/* ── HOW STARCROSS USES IT ────────────────────────────────────────── */}
          <FadeIn>
            <section className="border-t border-white/8 pt-16">
              <div className="max-w-2xl">
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-white mb-5 leading-tight">
                  How StarCross reads<br />the stars
                </h2>
                <p className="text-stone-400 text-sm leading-relaxed mb-12 max-w-lg">
                  We don't rely on personality quizzes or swipe history. Every match is
                  scored across multiple astrological dimensions — from elemental balance
                  to modal harmony — to surface genuine cosmic resonance.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-8 mb-12">
                  {STEPS.map((s, i) => (
                    <div key={s.title} className="flex gap-5">
                      <span className="font-serif text-stone-700 text-sm shrink-0 mt-0.5">0{i + 1}</span>
                      <div>
                        <p className="text-white text-sm font-semibold mb-1">{s.title}</p>
                        <p className="text-stone-500 text-sm leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-8 text-sm">
                  <Link href="/discover"
                    className="text-white font-semibold hover:text-stone-300 transition-colors">
                    Discover your matches →
                  </Link>
                  <Link href="/profile"
                    className="text-stone-500 hover:text-stone-300 transition-colors">
                    View your chart
                  </Link>
                </div>
              </div>
            </section>
          </FadeIn>

        </div>
      </main>
    </div>
  );
}
