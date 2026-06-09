"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, ArrowUp, MessageSquare } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { PageStars } from "@/components/PageStars";
import { AppFooter } from "@/components/ui/legal-page-layout";
import { ZODIAC_PATHS } from "@/components/ui/zodiac-icon";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Element = "fire" | "earth" | "air" | "water";

interface UserChart {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  elementScores?: { fire: number; earth: number; air: number; water: number };
  traits?: {
    emotionalStyle: string;
    communicationStyle: string;
    relationshipNeeds: string;
  };
}

// ─── Placement-specific sign descriptions ─────────────────────────────────────

const SIGN_PLACEMENTS: Record<string, { sun: string; moon: string; rising: string }> = {
  Aries: {
    sun: "You identify with action. Your sense of self is tied to initiative, the first move, the open door, the thing started before anyone else got there. You need to feel like you're moving toward something.",
    moon: "Emotionally, you process by doing, not sitting with it. Slow-burn conflict wears you down faster than direct confrontation. You need space, independence, and a partner who doesn't take your directness personally.",
    rising: "You come across as immediate and self-assured. People feel your energy before you say much. First impressions are energetic, forward, sometimes a little intense.",
  },
  Taurus: {
    sun: "Your identity is grounded in what you build, what you keep, and what you return to. Stability isn't complacency for you, it's a prerequisite for everything else. You're patient in ways most people aren't.",
    moon: "You need physical comfort and emotional constancy. Sudden changes in affection or plan destabilize you more than you let on. What you give takes time to develop, and you expect the same in return.",
    rising: "You present as calm, unhurried, and trustworthy. People sense early that you won't be pushed around or rushed. There's a groundedness that either reassures people or frustrates them, depending on who they are.",
  },
  Gemini: {
    sun: "Your sense of self is built in language. You need to talk things through to know what you think, and you need people who can keep up. Boredom is a genuine threat. Variety isn't restlessness, it's how you stay alive.",
    moon: "Emotionally, you need to think out loud. Talking through a feeling often matters more than resolving it. You're uncomfortable with heavy emotional demands and do better with partners who can hold things lightly.",
    rising: "You come across as quick, curious, and easy to talk to. You put people at ease fast. The first impression is friendly and sharp, though people sometimes wonder if you're fully present.",
  },
  Cancer: {
    sun: "Home, lineage, and belonging are at the center of who you are. You feel things deeply and retain them longer than most. Your protective instinct is strong, and you're most yourself in spaces you've made safe.",
    moon: "This is the Moon's home sign. Your emotional world is rich, long-memoried, and sometimes hard to explain to people who don't share your sensitivity. You need to feel cared for to fully open up.",
    rising: "You read as warm and somewhat guarded at first. People sense that getting close takes time, and that once they're in, it means something real. You can come across as shy, but it's more like careful.",
  },
  Leo: {
    sun: "You need to matter, to be seen, recognized, and appreciated for what you actually bring. That's not vanity; it's honesty. When you're given room to lead, you become genuinely generous with it.",
    moon: "Emotionally, you need warmth and recognition. You're hurt more easily by indifference than by criticism. You give a lot in relationships and need that energy acknowledged, even in small ways.",
    rising: "You enter a room and people notice. Presence comes naturally. The first impression is warm, a little theatrical, sometimes magnetic. People remember meeting you.",
  },
  Virgo: {
    sun: "Your identity is built around usefulness and discernment. You notice what others miss and care about doing things right. This precision sometimes reads as criticism, but it comes from a standard you hold yourself to first.",
    moon: "Emotionally, you process by analyzing. Sitting with an unresolved feeling without trying to understand it is uncomfortable. You need order and quiet to feel settled, and you show love through practical acts.",
    rising: "You come across as composed, observant, and careful with your words. People sense that you're paying attention to everything. The first impression is competent and measured, occasionally a little reserved.",
  },
  Libra: {
    sun: "Relationships are your natural habitat. Your identity is shaped in relation to others, not because you lack self, but because you genuinely understand that the self exists in context. Balance and fairness are non-negotiable values.",
    moon: "Emotionally, you need harmony and dislike making demands. Conflict makes you uncomfortable enough that you'll avoid it past the point of usefulness. You need a partner who can articulate what's wrong so you don't have to guess.",
    rising: "You come across as graceful, easy to like, and naturally diplomatic. People feel comfortable around you quickly. The first impression is polished and personable, sometimes hard to read beneath the surface.",
  },
  Scorpio: {
    sun: "Depth is the standard you hold everything to. Surface-level connection doesn't interest you. Your sense of self is built around transformation, what you've survived, what you've changed, what you know that others don't.",
    moon: "Emotionally, you feel everything fully and forget nothing. Trust takes a long time to build and a moment to break. You need a level of intimacy that most people aren't ready for, and you know it.",
    rising: "You come across as intense and self-contained. People sense there's more going on beneath the surface. The first impression is magnetic but hard to penetrate, which is more or less the point.",
  },
  Sagittarius: {
    sun: "Your identity is organized around freedom and meaning. You need to believe the life you're living matters and that there's always a bigger picture. Constraint, physical, intellectual, or emotional, is genuinely difficult for you.",
    moon: "Emotionally, you need space and levity. Heavy, demanding relationships drain you quickly. You process feelings through movement and perspective: travel, philosophy, the long view. You need a partner who doesn't clip your wings.",
    rising: "You come across as open, enthusiastic, and easy to approach. People feel immediately that you're not judging them. The first impression is warm and a little wild, like someone who just got back from somewhere interesting.",
  },
  Capricorn: {
    sun: "Your sense of self is earned through work and responsibility. You don't need approval, but you do need to know that what you're building matters. You take obligations seriously and expect the same from people in your life.",
    moon: "Emotionally, you're self-contained and often slow to show it. You were probably taught to keep it together, and you're good at it. What you need in a relationship is someone who makes you feel safe enough not to.",
    rising: "You come across as competent, steady, and a little serious. People assume you have your life handled, which is often true and sometimes lonely. The first impression is trustworthy, occasionally a bit distant.",
  },
  Aquarius: {
    sun: "Your identity is individual, sometimes to the point of principle. You think for yourself first and care about the collective second, but the collective still matters to you more than it does to most. You need intellectual freedom above everything.",
    moon: "Emotionally, you're more comfortable with ideas than feelings. You care deeply, but you process care through understanding, not warmth. You need a partner who respects your need for space and doesn't read detachment as rejection.",
    rising: "You come across as unusual and hard to categorize. People sense you're operating from a slightly different set of values. The first impression is interesting and a bit electric, occasionally a little remote.",
  },
  Pisces: {
    sun: "Boundaries between self and world are naturally porous for you. You absorb the emotional atmosphere of every room you walk into. Your identity is fluid, which makes you extraordinarily empathetic and occasionally hard to locate.",
    moon: "Emotionally, you need softness, creativity, and some degree of transcendence. Harsh, demanding environments deplete you quickly. You need a partner who understands sensitivity as a form of perception, not weakness.",
    rising: "You come across as gentle, somewhat dreamlike, and easy to confide in. People feel they can tell you things. The first impression is open and a little otherworldly, people often find you memorable without knowing why.",
  },
};

// ─── Mercury in each sign ──────────────────────────────────────────────────────

const MERCURY_SIGNS: Record<string, string> = {
  Aries:       "Direct, fast, and unvarnished. Cuts to the point and moves on. In conversation, you'll always know where you stand, sometimes before you're ready to.",
  Taurus:      "Deliberate and thorough. Thinks before speaking, and means what it says. Holds its positions firmly but rarely rushes to form them. Reliable in its word.",
  Gemini:      "Quick, versatile, and naturally at home in conversation. Ideas come fast, sometimes faster than they're finished. Gets restless when the exchange slows down.",
  Cancer:      "Communicates through feeling as much as words. Picks up on tone and mood before content. Has a long memory for what was said and how it landed.",
  Leo:         "Expressive, animated, and hard to ignore. Natural storyteller. Wants to be genuinely heard, dismissal registers as something personal.",
  Virgo:       "Precise, analytical, and attentive to detail. Notices what others miss and says so. Can read as critical, but holds itself to the same standard first.",
  Libra:       "Measured, diplomatic, and genuinely fair-minded. Weighs all sides before speaking, sometimes past the point of usefulness. Skilled at conversation; less skilled at the hard truth.",
  Scorpio:     "Probing, perceptive, and rarely showing its full hand. Doesn't do small talk. Excellent at reading what isn't being said. Prefers depth over pleasantry.",
  Sagittarius: "Expansive, direct, and philosophical. Says what it means and expects the same in return. Thinks in large frames; can lose patience with granular detail.",
  Capricorn:   "Measured, practical, and economical with words. Chooses language deliberately. Can seem aloof in casual exchange but is precise and reliable when it matters.",
  Aquarius:    "Unconventional, idea-driven, and often ahead of the conversation. Thinks in systems. Can go abstract when others want the concrete. Excellent at seeing patterns no one else noticed.",
  Pisces:      "Impressionistic and emotionally attuned. Communicates through feeling, metaphor, and implication. Can be difficult to pin down literally, but you always know the emotional truth of what they mean.",
};

// ─── Modalities ───────────────────────────────────────────────────────────────

const MODALITIES = [
  {
    name: "Cardinal",
    signs: ["Aries", "Cancer", "Libra", "Capricorn"],
    tagline: "Initiation",
    desc: "Cardinal signs begin things. They start relationships, conversations, and change. In synastry, two cardinal signs can create a dynamic where both want to lead, which produces either exciting momentum or constant redirection. The tension is generative if both partners can take turns.",
    inLove: "Cardinal signs move fast. They're the ones who define the relationship, make the first move, and push for the next step before the other person is ready. What they struggle with is sustaining what they start once the novelty settles.",
  },
  {
    name: "Fixed",
    signs: ["Taurus", "Leo", "Scorpio", "Aquarius"],
    tagline: "Sustaining",
    desc: "Fixed signs hold position. They sustain what was started, in work, in love, in belief. In synastry, two fixed signs build relationships of extraordinary depth and durability. They also have the potential for extraordinary standoffs, since neither yields easily.",
    inLove: "Fixed signs are the most loyal placement in the zodiac. When they commit, they mean it completely. They're also the hardest to convince once they've made up their mind, about a person, a relationship, or whether it's worth fighting for.",
  },
  {
    name: "Mutable",
    signs: ["Gemini", "Virgo", "Sagittarius", "Pisces"],
    tagline: "Adaptation",
    desc: "Mutable signs adapt. They're the transition points between seasons, and they carry that flexibility into relationships. In synastry, a mutable partner absorbs and responds to whatever the other person brings, which makes them naturally accommodating, sometimes at the cost of their own needs.",
    inLove: "Mutable signs are the most flexible in relationships, and the hardest to pin down. They adjust to their partner and read the emotional landscape. The risk is losing themselves in the process, or avoiding necessary conflict through permanent accommodation.",
  },
];

// ─── Zodiac signs ─────────────────────────────────────────────────────────────

const ZODIAC = [
  { sign: "Aries",       element: "fire",  modality: "Cardinal", dates: "Mar 21 – Apr 19", planet: "Mars"    },
  { sign: "Taurus",      element: "earth", modality: "Fixed",    dates: "Apr 20 – May 20", planet: "Venus"   },
  { sign: "Gemini",      element: "air",   modality: "Mutable",  dates: "May 21 – Jun 20", planet: "Mercury" },
  { sign: "Cancer",      element: "water", modality: "Cardinal", dates: "Jun 21 – Jul 22", planet: "Moon"    },
  { sign: "Leo",         element: "fire",  modality: "Fixed",    dates: "Jul 23 – Aug 22", planet: "Sun"     },
  { sign: "Virgo",       element: "earth", modality: "Mutable",  dates: "Aug 23 – Sep 22", planet: "Mercury" },
  { sign: "Libra",       element: "air",   modality: "Cardinal", dates: "Sep 23 – Oct 22", planet: "Venus"   },
  { sign: "Scorpio",     element: "water", modality: "Fixed",    dates: "Oct 23 – Nov 21", planet: "Pluto"   },
  { sign: "Sagittarius", element: "fire",  modality: "Mutable",  dates: "Nov 22 – Dec 21", planet: "Jupiter" },
  { sign: "Capricorn",   element: "earth", modality: "Cardinal", dates: "Dec 22 – Jan 19", planet: "Saturn"  },
  { sign: "Aquarius",    element: "air",   modality: "Fixed",    dates: "Jan 20 – Feb 18", planet: "Uranus"  },
  { sign: "Pisces",      element: "water", modality: "Mutable",  dates: "Feb 19 – Mar 20", planet: "Neptune" },
] as const;

type ZodiacEntry = (typeof ZODIAC)[number];

const EL: Record<Element, { hex: string; name: string; quality: string }> = {
  fire:  { hex: "#f97316", name: "Fire",  quality: "Passion, drive, and will"        },
  earth: { hex: "#10b981", name: "Earth", quality: "Form, patience, and reliability" },
  air:   { hex: "#38bdf8", name: "Air",   quality: "Thought, exchange, and motion"   },
  water: { hex: "#818cf8", name: "Water", quality: "Feeling, depth, and memory"      },
};

// ─── Aspects ──────────────────────────────────────────────────────────────────

const ASPECTS = [
  {
    name: "Conjunction", angle: "0°", symbol: "☌", kind: "variable",
    short: "Fusion of energies",
    desc: "Two planets occupy the same position. Their energies don't complement each other, they become one thing. In synastry, a conjunction is the most direct contact two charts can make. Whether that's comfortable depends entirely on which planets are involved. Sun conjunct Sun creates immediate mutual recognition. Saturn conjunct Venus can mean the relationship feels meaningful but restricted.",
    feel: "Intense, immediate, sometimes too much",
  },
  {
    name: "Sextile", angle: "60°", symbol: "⚹", kind: "soft",
    short: "Cooperative flow",
    desc: "Planets 60 degrees apart work well together and require little conscious effort. Sextiles between charts show where two people's drives run in a compatible direction. They're supportive without being dramatic. A Venus sextile Mercury means conversation and affection move in the same current.",
    feel: "Easy, supportive, low friction",
  },
  {
    name: "Square", angle: "90°", symbol: "□", kind: "hard",
    short: "Productive tension",
    desc: "Squares generate friction that demands resolution. They're not obstacles so much as the thing that keeps a relationship dynamic. The most memorable connections often have squares in their synastry: something to work through, something that doesn't resolve itself passively. Mars square Moon is a classic, strong attraction, but clashing emotional rhythms.",
    feel: "Challenging, activating, growth-oriented",
  },
  {
    name: "Trine", angle: "120°", symbol: "△", kind: "soft",
    short: "Natural harmony",
    desc: "The most effortless aspect. Planets in trine share the same element, so they operate from a similar foundation. In synastry, trines describe where two people simply understand each other without having to explain. Moon trine Moon between two charts means emotional styles are immediately familiar. Trines are gifts, but they don't produce growth on their own.",
    feel: "Harmonious, accepting, genuinely easy",
  },
  {
    name: "Opposition", angle: "180°", symbol: "☍", kind: "hard",
    short: "Magnetic polarity",
    desc: "Oppositions place two planets at opposite poles of the chart. In synastry, this is the aspect of attraction to your complement. You're drawn to something in them that you either lack or suppress in yourself. Sun opposite Moon is the classic relationship opposition: different fundamental natures that, at best, create balance. At worst, irreconcilable distance.",
    feel: "Magnetic, polarising, deeply complementary",
  },
];

// ─── SVG Wheel ────────────────────────────────────────────────────────────────

const CX = 210, CY = 210, INNER = 82, WHEEL = 176, BAND = 196, GLYPH_R = 130;

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
  activeIdx, userIdx, onHover,
}: { activeIdx: number | null; userIdx: number | null; onHover: (i: number | null) => void }) {
  return (
    <svg viewBox="0 0 420 420" className="w-full">
      <circle cx={CX} cy={CY} r={BAND + 22} fill="#4f46e5" fillOpacity="0.04" />

      {ZODIAC.map((z, i) => {
        const a1 = -90 + i * 30, a2 = a1 + 30, mid = a1 + 15;
        const hex = EL[z.element as Element].hex;
        const act = activeIdx === i, usr = userIdx === i;
        const gp = polar(GLYPH_R, mid);
        const iconS = 0.78;
        const iconOff = 12 * iconS;
        return (
          <g key={z.sign} onMouseEnter={() => onHover(i)} onMouseLeave={() => onHover(null)} className="cursor-pointer">
            <path d={sector(INNER, WHEEL, a1, a2)} fill={hex}
              fillOpacity={act ? 0.38 : usr ? 0.2 : 0.08}
              stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"
              style={{ transition: "fill-opacity 0.15s" }} />
            <path d={sector(WHEEL, BAND, a1, a2)} fill={hex}
              fillOpacity={act ? 0.9 : usr ? 0.75 : 0.48}
              style={{ transition: "fill-opacity 0.15s" }} />
            {usr && <path d={sector(BAND, BAND + 6, a1, a2)} fill="white" fillOpacity="0.3" />}
            <g
              transform={`translate(${(gp.x - iconOff).toFixed(2)}, ${(gp.y - iconOff).toFixed(2)}) scale(${iconS})`}
              fill="none"
              stroke="white"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={act ? 2.0 : 1.6}
              opacity={act ? 1 : usr ? 0.92 : 0.55}
              style={{ transition: "opacity 0.15s, stroke-width 0.15s", pointerEvents: "none" }}
            >
              {ZODIAC_PATHS[z.sign]}
            </g>
          </g>
        );
      })}

      {ZODIAC.map((_, i) => {
        const a = -90 + i * 30, p1 = polar(INNER, a), p2 = polar(BAND, a);
        return <line key={i} x1={p1.x.toFixed(1)} y1={p1.y.toFixed(1)}
          x2={p2.x.toFixed(1)} y2={p2.y.toFixed(1)}
          stroke="white" strokeOpacity="0.08" strokeWidth="0.5" />;
      })}

      <circle cx={CX} cy={CY} r={INNER} fill="#080B18" />
      <circle cx={CX} cy={CY} r={INNER} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <circle cx={CX} cy={CY} r={62} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      <circle cx={CX} cy={CY} r={42} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="2 5" />

      {activeIdx !== null ? (
        <g
          transform={`translate(${CX - 12}, ${CY - 12})`}
          fill="none"
          stroke={EL[ZODIAC[activeIdx].element as Element].hex}
          strokeOpacity="0.6"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pointerEvents: "none", transition: "stroke 0.2s" }}
        >
          {ZODIAC_PATHS[ZODIAC[activeIdx].sign]}
        </g>
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

// ─── Sign detail panel, tabbed (Sun / Moon / Rising / Mercury) ───────────────

type PlacementTab = "sun" | "moon" | "rising" | "mercury";

const PLACEMENT_TABS: { key: PlacementTab; label: string; title: string }[] = [
  { key: "sun",     label: "Sun",     title: "Core identity"    },
  { key: "moon",    label: "Moon",    title: "Emotional world"  },
  { key: "rising",  label: "Rising",  title: "First impression" },
  { key: "mercury", label: "Mercury", title: "How they communicate" },
];

function SignDetail({ activeIdx }: { activeIdx: number | null }) {
  const [tab, setTab] = useState<PlacementTab>("sun");
  const z = activeIdx !== null ? ZODIAC[activeIdx] : null;
  const el = z ? EL[z.element as Element] : null;
  const placement = z ? SIGN_PLACEMENTS[z.sign] : null;

  const bodyText = z && placement
    ? tab === "mercury"
      ? MERCURY_SIGNS[z.sign]
      : placement[tab]
    : null;

  return (
    <div className="min-h-[230px] pt-6">
      <AnimatePresence mode="wait">
        {z && el && placement ? (
          <motion.div key={z.sign}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 mb-2">
              <svg viewBox="0 0 24 24" width={40} height={40} fill="none"
                stroke={el.hex} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink: 0 }}>
                {ZODIAC_PATHS[z.sign]}
              </svg>
              <h3 className="font-serif text-2xl font-semibold text-white leading-none">{z.sign}</h3>
            </div>
            <p className="text-stone-500 text-xs mb-1">{z.dates}</p>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px w-5" style={{ background: el.hex }} />
              <span className="text-xs" style={{ color: el.hex }}>{z.element} · {z.modality} · {z.planet}</span>
            </div>

            {/* Placement tabs */}
            <div className="flex flex-wrap gap-1 mb-4">
              {PLACEMENT_TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs transition-colors",
                    tab === key
                      ? "bg-white/10 text-white"
                      : "text-stone-600 hover:text-stone-400"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={tab}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <p className="text-stone-500 text-[10px] tracking-[0.14em] uppercase mb-2">
                  {PLACEMENT_TABS.find(t => t.key === tab)?.title}
                </p>
                <p className="text-stone-300 text-sm leading-relaxed max-w-sm">{bodyText}</p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-stone-500 text-sm">Hover a sign to read its character</p>
            <p className="text-stone-600 text-xs mt-2">Sun · Moon · Rising · Mercury for all 12 signs</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Personal chart section ────────────────────────────────────────────────────

function PersonalChart({ chart }: { chart: UserChart }) {
  const sun     = ZODIAC.find((z) => z.sign === chart.sunSign);
  const moon    = ZODIAC.find((z) => z.sign === chart.moonSign);
  const rising  = ZODIAC.find((z) => z.sign === chart.risingSign);
  const placements = [
    { label: "Sun", Icon: Sun, sign: sun, desc: SIGN_PLACEMENTS[chart.sunSign]?.sun, title: "Core identity" },
    { label: "Moon", Icon: Moon, sign: moon, desc: SIGN_PLACEMENTS[chart.moonSign]?.moon, title: "Emotional world" },
    { label: "Rising", Icon: ArrowUp, sign: rising, desc: SIGN_PLACEMENTS[chart.risingSign]?.rising, title: "First impression" },
  ];

  return (
    <section className="mb-24">
      <p className="text-xs tracking-[0.22em] uppercase text-stone-500 mb-10">Your big three</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
        {placements.map(({ label, Icon, sign, desc, title }) => {
          if (!sign) return null;
          const elColor = EL[sign.element as Element].hex;
          return (
            <div key={label}>
              <div className="flex items-center gap-2 mb-4">
                <Icon className="h-3.5 w-3.5 text-stone-500" />
                <span className="text-xs tracking-[0.15em] uppercase text-stone-500">{label} in {sign.sign}</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <svg viewBox="0 0 24 24" width={40} height={40} fill="none"
                  stroke={elColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  style={{ flexShrink: 0 }}>
                  {ZODIAC_PATHS[sign.sign]}
                </svg>
                <div className="h-px flex-1" style={{ background: elColor, opacity: 0.3 }} />
              </div>
              <p className="text-xs text-stone-500 mb-3">{title}</p>
              <p className="text-stone-300 text-sm leading-relaxed">{desc}</p>
            </div>
          );
        })}
      </div>

      {/* Mercury row */}
      <div className="mt-10 pt-10 border-t border-white/8">
        <p className="text-xs tracking-[0.22em] uppercase text-stone-500 mb-6">Mercury placements, how you communicate</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[chart.sunSign, chart.moonSign, chart.risingSign].map((signName, i) => {
            const labels = ["Sun sign", "Moon sign", "Rising sign"];
            const mercText = MERCURY_SIGNS[signName];
            if (!mercText) return null;
            const sign = ZODIAC.find(z => z.sign === signName);
            if (!sign) return null;
            const elColor = EL[sign.element as Element].hex;
            return (
              <div key={signName + i}>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-3 w-3 text-stone-600" />
                  <span className="text-xs tracking-[0.13em] uppercase text-stone-500">
                    {signName} <span className="text-stone-700">({labels[i]})</span>
                  </span>
                </div>
                <div className="w-4 h-px mb-3" style={{ background: elColor, opacity: 0.5 }} />
                <p className="text-stone-400 text-sm leading-relaxed">{mercText}</p>
              </div>
            );
          })}
        </div>
      </div>

      {chart.traits && (
        <div className="mt-10 pt-10 border-t border-white/8">
          <p className="text-xs tracking-[0.22em] uppercase text-stone-500 mb-8">How your chart reads in relationships</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: "Emotionally", text: chart.traits.emotionalStyle },
              { label: "In conversation", text: chart.traits.communicationStyle },
              { label: "What you need", text: chart.traits.relationshipNeeds },
            ].map(({ label, text }) => (
              <div key={label}>
                <p className="text-stone-500 text-xs tracking-wide uppercase mb-2">{label}</p>
                <p className="text-stone-300 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Aspects explorer ──────────────────────────────────────────────────────────

function AspectsExplorer() {
  const [active, setActive] = useState<number>(3);

  return (
    <div>
      {ASPECTS.map((a, i) => {
        const open = active === i;
        return (
          <div key={a.name} className="border-t border-white/8">
            <button
              className="w-full text-left py-6 flex items-start gap-6 group"
              onClick={() => setActive(open ? -1 : i)}
            >
              <span className="font-serif text-stone-500 text-sm w-8 shrink-0 pt-0.5">{a.angle}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-stone-200 text-lg">{a.symbol}</span>
                  <span className="font-serif text-white text-lg font-semibold">{a.name}</span>
                  <span className="text-stone-500 text-sm">{a.short}</span>
                </div>
                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="text-stone-300 text-sm leading-relaxed mt-3 max-w-2xl">{a.desc}</p>
                      <p className="text-stone-500 text-xs mt-3 tracking-wide">{a.feel}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span className={cn(
                "text-stone-600 text-sm shrink-0 pt-1 transition-transform",
                open && "rotate-45"
              )}>+</span>
            </button>
          </div>
        );
      })}
      <div className="border-t border-white/8" />
    </div>
  );
}

// ─── Modalities section ────────────────────────────────────────────────────────

function ModalitiesSection() {
  const [active, setActive] = useState<number>(0);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {MODALITIES.map((m, i) => {
        const isOpen = active === i;
        return (
          <button
            key={m.name}
            onClick={() => setActive(isOpen ? -1 : i)}
            className={cn(
              "text-left rounded-2xl border p-6 transition-colors",
              isOpen
                ? "border-white/20 bg-[#0d1124]"
                : "border-white/12 hover:border-white/20 bg-[#0a0d1e]"
            )}
          >
            <p className="text-xs tracking-[0.18em] uppercase text-stone-500 mb-1">{m.tagline}</p>
            <h3 className="font-serif text-white text-xl font-semibold mb-3">{m.name}</h3>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {m.signs.map(s => (
                <span key={s} className="text-xs text-stone-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/8">{s}</span>
              ))}
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <p className="text-stone-300 text-sm leading-relaxed mb-3">{m.desc}</p>
                  <p className="text-stone-500 text-xs leading-relaxed border-t border-white/8 pt-3">{m.inLove}</p>
                </motion.div>
              )}
            </AnimatePresence>
            {!isOpen && (
              <p className="text-stone-600 text-xs">Tap to expand</p>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Fade-in wrapper ───────────────────────────────────────────────────────────

function FadeIn({ children, delay = 0, className }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AstrologyPage() {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [userIdx,   setUserIdx]   = useState<number | null>(null);
  const [userChart, setUserChart] = useState<UserChart | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (!d?.astrologyProfile) return;
        const ap = d.astrologyProfile;
        const traits = typeof ap.traits === "string" ? JSON.parse(ap.traits) : ap.traits;
        const elementScores = typeof ap.elementScores === "string" ? JSON.parse(ap.elementScores) : ap.elementScores;
        const chart: UserChart = {
          sunSign:    ap.sunSign,
          moonSign:   ap.moonSign,
          risingSign: ap.risingSign,
          elementScores,
          traits,
        };
        setUserChart(chart);
        const idx = ZODIAC.findIndex((z) => z.sign === ap.sunSign);
        if (idx !== -1) setUserIdx(idx);
      })
      .catch(() => null);
  }, [status]);

  return (
    <div className="min-h-screen" style={{ background: "#07091f" }}>
      <PageStars count={260} />
      <NavBar />

      {/* Public header — shown only when not logged in */}
      {status !== "authenticated" && (
        <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/[0.07] bg-[#07091f]/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
            <Link href="/" className="text-white font-semibold tracking-[0.25em] text-sm" style={{ fontFamily: "var(--font-inter)" }}>
              kindred stars
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {[
                { href: "/#app-preview", label: "The Experience" },
                { href: "/astrology",    label: "Astrology" },
                { href: "/pricing",      label: "Pricing" },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className="px-4 py-1.5 text-sm text-white/60 hover:text-white transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors px-4 py-1.5">
                Sign in
              </Link>
              <Link href="/pricing" className="text-sm bg-white text-stone-900 hover:bg-stone-100 transition-colors rounded-full px-5 py-1.5 font-medium">
                Get started
              </Link>
            </div>
          </div>
        </header>
      )}

      <main className="relative z-[1] pt-24 pb-32 px-6">
        <div className="max-w-5xl mx-auto">

          {/* ── HERO ──────────────────────────────────────────────────────────── */}
          <section className="mb-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

              <FadeIn>
                <p className="text-xs tracking-[0.22em] uppercase text-stone-500 mb-7">Astrology</p>
                <h1 className="font-serif text-5xl md:text-6xl font-semibold text-white leading-[1.08] mb-6">
                  The sky at your<br />first breath is<br />
                  <span className="text-stone-400">your blueprint.</span>
                </h1>
                <div className="w-10 h-px bg-white/15 mb-6" />
                <p className="text-stone-300 text-base leading-relaxed mb-6 max-w-md">
                  Your birth chart is a record of where every planet sat at the exact moment you were born.
                  Not a personality quiz. Not a horoscope. A map of the tendencies, drives,
                  and emotional patterns you arrived with.
                </p>
                <p className="text-stone-300 text-base leading-relaxed mb-8 max-w-md">
                  Carl Jung called it synchronicity: the sky at birth doesn't cause your personality,
                  but it mirrors it with striking precision. Astrology is the language for reading that mirror.
                </p>
                <p className="text-stone-500 text-sm tracking-wide">
                  12 signs · 10 planets · 12 houses · 5 major aspects
                </p>
              </FadeIn>

              <FadeIn delay={0.1}>
                <ZodiacWheel activeIdx={activeIdx} userIdx={userIdx} onHover={setActiveIdx} />
                {userIdx !== null && activeIdx === null && (
                  <p className="text-center text-xs text-stone-600 mt-2">Your Sun sign is marked</p>
                )}
                <SignDetail activeIdx={activeIdx} />
              </FadeIn>
            </div>
          </section>

          {/* ── PERSONAL CHART ─────────────────────────────────────────────────── */}
          {isLoggedIn ? (
            userChart ? (
              <FadeIn>
                <PersonalChart chart={userChart} />
              </FadeIn>
            ) : (
              <FadeIn>
                <div className="border-t border-white/8 py-12 mb-24">
                  <p className="text-stone-500 text-sm mb-2">Your personal chart</p>
                  <p className="text-stone-400 text-sm max-w-sm">
                    Complete your profile to see your Big Three and how your chart reads in relationships.
                  </p>
                  <Link href="/onboarding" className="inline-block mt-4 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                    Set up your profile →
                  </Link>
                </div>
              </FadeIn>
            )
          ) : (
            <FadeIn>
              <div className="border border-white/8 rounded-2xl px-8 py-10 mb-24 text-center max-w-lg mx-auto">
                <p className="text-xs tracking-[0.18em] uppercase text-stone-500 mb-3">Your personal chart</p>
                <p className="font-serif text-white text-xl font-semibold mb-3">See your Big Three</p>
                <p className="text-stone-400 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
                  Create a free profile to see your Sun, Moon, and Rising sign interpretations, and how your chart reads in relationships.
                </p>
                <Link
                  href="/signup"
                  className="inline-block bg-white text-stone-900 rounded-full px-7 py-2.5 text-sm font-medium hover:bg-stone-100 transition-colors"
                >
                  Get started free
                </Link>
              </div>
            </FadeIn>
          )}

          {/* ── HOW ASTROLOGY WORKS ─────────────────────────────────────────────── */}
          <FadeIn>
            <section className="mb-24">
              <p className="text-xs tracking-[0.22em] uppercase text-stone-500 mb-10">How it actually works</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                {[
                  {
                    n: "01", title: "The birth chart",
                    body: "At the moment of birth, every planet occupied a specific degree of the zodiac. The natal chart records those positions. It doesn't determine fate. It describes the psychological landscape you came in with: the drives, needs, and patterns that show up repeatedly through your life.",
                  },
                  {
                    n: "02", title: "Synastry",
                    body: "Synastry is what happens when you overlay two people's charts. The question isn't just what signs they are. It's which of their planets make contact, and at what angle. A Sun-Moon conjunction between two people creates instant emotional recognition. Saturn conjunct Venus creates a bond that feels meaningful but tests both people.",
                  },
                  {
                    n: "03", title: "Venus and Mars",
                    body: "Your Sun sign is your identity. Venus describes what you find beautiful, how you express affection, and what you need to feel loved. Mars describes how you pursue things, how you handle desire, and what activates you physically. Compatibility lives in how these four planets interact between two charts, not just in Sun-sign pairing.",
                  },
                  {
                    n: "04", title: "The houses",
                    body: "The 12 houses divide the chart into areas of life: identity, money, communication, home, creativity, work, partnerships, intimacy, philosophy, career, community, and solitude. A planet in the 7th house (partnerships) shapes your relationship patterns directly. Planets in the 5th (romance) and 8th (intimacy) matter greatly in the context of connection.",
                  },
                ].map(({ n, title, body }) => (
                  <div key={n} className="flex gap-5">
                    <span className="font-serif text-stone-500 text-sm shrink-0 pt-0.5">{n}</span>
                    <div>
                      <h3 className="font-serif text-white text-xl font-semibold mb-2">{title}</h3>
                      <p className="text-stone-300 text-sm leading-relaxed">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          {/* ── THE FIVE ASPECTS ──────────────────────────────────────────────── */}
          <FadeIn>
            <section className="mb-24">
              <p className="text-xs tracking-[0.22em] uppercase text-stone-500 mb-4">The five aspects</p>
              <p className="text-stone-300 text-base leading-relaxed max-w-2xl mb-10">
                Aspects are the angles between planets in a chart or between two charts.
                They determine whether planetary energies work together, create friction, or pull in opposite directions.
                Understanding them is the difference between reading a sun sign and actually reading a chart.
              </p>
              <AspectsExplorer />
            </section>
          </FadeIn>

          {/* ── VENUS AND MARS ────────────────────────────────────────────────── */}
          <FadeIn>
            <section className="mb-24 border-t border-white/8 pt-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div>
                  <p className="text-xs tracking-[0.22em] uppercase text-stone-500 mb-5">Venus</p>
                  <p className="font-serif text-white text-2xl font-semibold mb-4 leading-snug">How you love and what you need to feel loved</p>
                  <p className="text-stone-300 text-sm leading-relaxed mb-4">
                    Venus in a fire sign (Aries, Leo, Sagittarius) needs excitement, directness, and someone who matches their enthusiasm. They show love through grand gestures and need to be someone's priority.
                  </p>
                  <p className="text-stone-300 text-sm leading-relaxed mb-4">
                    Venus in an earth sign (Taurus, Virgo, Capricorn) shows love through acts of service and consistency. They need reliability over romance, and they're suspicious of affection that isn't backed by action.
                  </p>
                  <p className="text-stone-300 text-sm leading-relaxed mb-4">
                    Venus in an air sign (Gemini, Libra, Aquarius) needs intellectual connection. Conversation is foreplay. They love through ideas, humor, and mental stimulation, and they need room to breathe.
                  </p>
                  <p className="text-stone-300 text-sm leading-relaxed">
                    Venus in a water sign (Cancer, Scorpio, Pisces) needs emotional fusion. They want to feel merged, understood, and safe. Love without emotional depth doesn't register as real.
                  </p>
                </div>
                <div>
                  <p className="text-xs tracking-[0.22em] uppercase text-stone-500 mb-5">Mars</p>
                  <p className="font-serif text-white text-2xl font-semibold mb-4 leading-snug">How you pursue and what activates you</p>
                  <p className="text-stone-300 text-sm leading-relaxed mb-4">
                    Mars is what drives you, what you want, and how you go after it. In synastry, Venus-Mars contacts between two charts produce the most direct chemistry. When your Venus falls in the same sign as someone's Mars, the attraction is immediate and mutual.
                  </p>
                  <p className="text-stone-300 text-sm leading-relaxed mb-4">
                    When Venus and Mars are in the same element across two charts, say, Venus in Scorpio and Mars in Cancer, both water signs, there's a shared emotional frequency that makes desire feel safe. When they're in conflicting elements, the attraction is often still there, but the rhythm requires more translation.
                  </p>
                  <p className="text-stone-300 text-sm leading-relaxed">
                    Most sun-sign compatibility guides ignore Venus and Mars entirely. That's why they're often wrong. Two people with incompatible Sun signs can have Venus trine Mars and feel like they've known each other for years.
                  </p>
                </div>
              </div>
            </section>
          </FadeIn>

          {/* ── MERCURY ───────────────────────────────────────────────────────── */}
          <FadeIn>
            <section className="mb-24 border-t border-white/8 pt-16">
              <p className="text-xs tracking-[0.22em] uppercase text-stone-500 mb-5">Mercury</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6 mb-10">
                <div>
                  <p className="font-serif text-white text-2xl font-semibold mb-4 leading-snug">
                    The planet most compatibility guides forget
                  </p>
                  <p className="text-stone-300 text-sm leading-relaxed mb-4">
                    Mercury governs how you think, how you speak, how you process information, and how you argue. In a relationship, Mercury compatibility often determines whether two people feel understood, even when they genuinely like each other.
                  </p>
                  <p className="text-stone-300 text-sm leading-relaxed">
                    Mercury is rarely more than one or two signs away from your Sun, but its placement shifts your communication style significantly. A Scorpio Sun with Mercury in Libra is a very different communicator than a Scorpio Sun with Mercury in Sagittarius.
                  </p>
                </div>
                <div>
                  <p className="text-stone-300 text-sm leading-relaxed mb-4">
                    Mercury in fire signs (Aries, Leo, Sagittarius) communicates with urgency and directness. They say what they mean, often before they've fully thought it through.
                  </p>
                  <p className="text-stone-300 text-sm leading-relaxed mb-4">
                    Mercury in earth signs (Taurus, Virgo, Capricorn) is careful and precise. They think before they speak and mean what they say, but they can also take a long time to say it.
                  </p>
                  <p className="text-stone-300 text-sm leading-relaxed mb-4">
                    Mercury in air signs (Gemini, Libra, Aquarius) is nimble and ideas-driven. They communicate through abstraction and enjoy debate for its own sake.
                  </p>
                  <p className="text-stone-300 text-sm leading-relaxed">
                    Mercury in water signs (Cancer, Scorpio, Pisces) communicates emotionally. They pick up on subtext, speak in feeling-tones, and remember everything that was said and how it landed.
                  </p>
                </div>
              </div>

              {/* Mercury sign grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {ZODIAC.map((z) => {
                  const elColor = EL[z.element as Element].hex;
                  return (
                    <div key={z.sign} className="bg-[#0d1124] border border-white/12 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg viewBox="0 0 24 24" width={16} height={16} fill="none"
                          stroke={elColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {ZODIAC_PATHS[z.sign]}
                        </svg>
                        <span className="text-stone-300 text-xs font-medium">Mercury in {z.sign}</span>
                      </div>
                      <p className="text-stone-300 text-xs leading-relaxed">{MERCURY_SIGNS[z.sign]}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          </FadeIn>

          {/* ── THE FOUR ELEMENTS ──────────────────────────────────────────────── */}
          <FadeIn>
            <section className="mb-24 border-t border-white/8 pt-16">
              <p className="text-xs tracking-[0.22em] uppercase text-stone-500 mb-10">The four elements</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                {(["fire", "earth", "air", "water"] as Element[]).map((el) => {
                  const { hex, name, quality } = EL[el];
                  const signs = ZODIAC.filter((z) => z.element === el);
                  return (
                    <div key={el}>
                      <div className="w-7 h-px mb-5" style={{ background: hex }} />
                      <p className="font-serif text-lg font-semibold text-white mb-1">{name}</p>
                      <p className="text-stone-500 text-xs mb-5 leading-snug">{quality}</p>
                      <div className="space-y-2">
                        {signs.map((z) => (
                          <div key={z.sign} className="flex items-center gap-2">
                            <svg viewBox="0 0 24 24" width={14} height={14} fill="none"
                              stroke={hex} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                              style={{ flexShrink: 0 }}>
                              {ZODIAC_PATHS[z.sign]}
                            </svg>
                            <span className="text-stone-300 text-sm">{z.sign}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </FadeIn>

          {/* ── MODALITIES ────────────────────────────────────────────────────── */}
          <FadeIn>
            <section className="mb-24 border-t border-white/8 pt-16">
              <p className="text-xs tracking-[0.22em] uppercase text-stone-500 mb-4">The three modalities</p>
              <p className="text-stone-300 text-base leading-relaxed max-w-2xl mb-10">
                Every sign belongs to one of three modalities, Cardinal, Fixed, or Mutable, which describe how a sign moves through the world. In synastry, modality compatibility shapes the pace of a relationship and how well two people navigate change together.
              </p>
              <ModalitiesSection />
            </section>
          </FadeIn>

          {/* ── THE 12 HOUSES ─────────────────────────────────────────────────── */}
          <FadeIn>
            <section className="mb-24 border-t border-white/8 pt-16">
              <p className="text-xs tracking-[0.22em] uppercase text-stone-500 mb-4">The 12 houses</p>
              <p className="text-stone-300 text-base leading-relaxed max-w-2xl mb-10">
                The houses divide the birth chart into 12 areas of life. Where planets fall in your chart, which house they occupy, describes where their energy is most active. In relationship astrology, certain houses carry more weight than others.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { n: "1st",  title: "Identity",       rel: false, body: "The self, the body, first impressions. Your Rising sign is the cusp of this house." },
                  { n: "2nd",  title: "Resources",      rel: false, body: "Money, possessions, self-worth. What you value and how you earn and spend." },
                  { n: "3rd",  title: "Communication",  rel: true,  body: "Thought, speech, and local connection. Planets here shape how you talk and listen." },
                  { n: "4th",  title: "Home",           rel: true,  body: "Roots, family, emotional foundation. The private self that partners eventually meet." },
                  { n: "5th",  title: "Romance",        rel: true,  body: "Creativity, pleasure, dating, and play. Planets here directly color your romantic life." },
                  { n: "6th",  title: "Daily life",     rel: false, body: "Work, routines, and health. How you function day to day, the texture of life with a partner." },
                  { n: "7th",  title: "Partnership",    rel: true,  body: "Marriage, long-term relationship, and open enemies. The single most important house for synastry." },
                  { n: "8th",  title: "Intimacy",       rel: true,  body: "Shared resources, sex, death, and transformation. Deep bonding and where two people merge." },
                  { n: "9th",  title: "Philosophy",     rel: false, body: "Beliefs, travel, higher education, and meaning-making. Shared worldview is often found here." },
                  { n: "10th", title: "Career",         rel: false, body: "Public standing, ambition, and reputation. What you're building in the world." },
                  { n: "11th", title: "Community",      rel: false, body: "Friends, networks, hopes, and ideals. How you relate to groups and shared goals." },
                  { n: "12th", title: "Solitude",       rel: true,  body: "Hidden matters, the unconscious, retreat. Secrets and what we bring to our deepest bonds." },
                ].map(({ n, title, rel, body }) => (
                  <div key={n} className={cn(
                    "rounded-xl border p-4",
                    rel ? "border-indigo-500/30 bg-[#0e1030]" : "border-white/12 bg-[#0d1124]"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-serif text-stone-500 text-xs w-7 shrink-0">{n}</span>
                      <span className="text-white text-sm font-semibold">{title}</span>
                      {rel && <span className="ml-auto text-[9px] tracking-[0.12em] uppercase text-indigo-400">Relationship</span>}
                    </div>
                    <p className="text-stone-300 text-xs leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          {/* ── HOW KINDRED STARS USES IT ──────────────────────────────────────────── */}
          <FadeIn>
            <section className="border-t border-white/8 pt-16">
              <div className="max-w-2xl">
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-white mb-5 leading-tight">
                  How Kindred Stars reads the chart
                </h2>
                <p className="text-stone-300 text-base leading-relaxed mb-10">
                  Sun-sign matching is where most apps stop. Kindred Stars starts there and goes further.
                  We calculate your full natal chart and score compatibility across the
                  dimensions that actually predict whether two people connect.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-14 gap-y-7 mb-12">
                  {[
                    { n: "01", title: "Full natal chart", desc: "Sun, Moon, Rising, Venus, and Mars positions calculated from your birth data." },
                    { n: "02", title: "Elemental balance", desc: "How your elemental compositions interact, same-element comfort vs. cross-element spark." },
                    { n: "03", title: "Modal harmony",     desc: "Whether your Cardinal, Fixed, and Mutable energies complement or compete." },
                    { n: "04", title: "Composite score",   desc: "A weighted compatibility score that surfaces your most resonant matches first." },
                  ].map(({ n, title, desc }) => (
                    <div key={n} className="flex gap-5">
                      <span className="font-serif text-stone-500 text-sm shrink-0 pt-0.5">{n}</span>
                      <div>
                        <p className="text-white text-sm font-semibold mb-1">{title}</p>
                        <p className="text-stone-400 text-sm leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-8 text-sm">
                  <Link href="/discover" className="text-white font-semibold hover:text-stone-300 transition-colors">
                    See your matches →
                  </Link>
                  <Link href="/profile" className="text-stone-400 hover:text-stone-300 transition-colors">
                    View your chart
                  </Link>
                </div>
              </div>
            </section>
          </FadeIn>

        </div>
      </main>
      <AppFooter />
    </div>
  );
}
