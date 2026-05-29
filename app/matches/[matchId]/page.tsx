"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ZODIAC_PATHS } from "@/components/ui/zodiac-icon";

// ── Astrology data ─────────────────────────────────────────────────────────────

const SIGN_ELEMENT: Record<string, string> = {
  Aries: "fire",   Leo: "fire",    Sagittarius: "fire",
  Taurus: "earth", Virgo: "earth", Capricorn: "earth",
  Gemini: "air",   Libra: "air",   Aquarius: "air",
  Cancer: "water", Scorpio: "water", Pisces: "water",
};

const SIGN_MODALITY: Record<string, string> = {
  Aries: "Cardinal",  Cancer: "Cardinal",  Libra: "Cardinal",    Capricorn: "Cardinal",
  Taurus: "Fixed",    Leo: "Fixed",        Scorpio: "Fixed",     Aquarius: "Fixed",
  Gemini: "Mutable",  Virgo: "Mutable",    Sagittarius: "Mutable", Pisces: "Mutable",
};

const SIGN_PLANET: Record<string, string> = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
  Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Pluto",
  Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Uranus", Pisces: "Neptune",
};

// Light-safe element colors (dark enough on cream background)
const EL_HEX: Record<string, string> = {
  fire:  "#b45309",  // amber-700
  earth: "#166534",  // green-800
  air:   "#075985",  // sky-800
  water: "#5b21b6",  // violet-800
};

type AspectKind = "conjunction" | "trine" | "sextile" | "square" | "opposition" | "neutral";

function aspectKind(a: string, b: string): AspectKind {
  if (!a || !b || a === "Unknown" || b === "Unknown") return "neutral";
  if (a === b) return "conjunction";
  const elA = SIGN_ELEMENT[a], elB = SIGN_ELEMENT[b];
  const modA = SIGN_MODALITY[a], modB = SIGN_MODALITY[b];
  if (!elA || !elB) return "neutral";
  if ((elA === "fire" && elB === "water") || (elA === "water" && elB === "fire")) return "opposition";
  if ((elA === "earth" && elB === "air")  || (elA === "air"   && elB === "earth")) return "opposition";
  if (elA === elB) return "trine";
  if ((elA === "fire" && elB === "air")   || (elA === "air"   && elB === "fire"))   return "sextile";
  if ((elA === "earth" && elB === "water") || (elA === "water" && elB === "earth")) return "sextile";
  if (modA === modB) return "square";
  return "neutral";
}

const ASPECT: Record<AspectKind, {
  color: string; dash?: string; label: string;
  weight: number; desc: string; feel: string;
}> = {
  conjunction: { color: "#6d28d9", label: "Conjunction", weight: 2,   desc: "These energies merge into one. The most direct contact two charts can make — fused, intense, impossible to ignore.", feel: "Intense and immediate" },
  trine:       { color: "#15803d", label: "Trine",       weight: 1.5, desc: "Same element, same frequency. Understanding flows without effort. This is the aspect of ease — the connection that feels like coming home.", feel: "Natural and accepting" },
  sextile:     { color: "#0369a1", dash: "6 3",  label: "Sextile",   weight: 1,   desc: "Complementary elements in conversation. Supportive without being dramatic. Things move in the same direction, with room to breathe.", feel: "Easy, low friction" },
  square:      { color: "#b45309", dash: "3 4",  label: "Square",    weight: 1,   desc: "Friction that demands resolution. The most memorable connections often have squares — something to work through together that keeps both people growing.", feel: "Activating and dynamic" },
  opposition:  { color: "#be123c", dash: "2 4",  label: "Opposition", weight: 1,  desc: "Magnetic polarity. You are drawn to what the other person holds, the thing you carry differently or suppress. At best, it creates balance.", feel: "Magnetic, polarising" },
  neutral:     { color: "#9ca3af", dash: "2 6",  label: "",          weight: 0.5, desc: "", feel: "" },
};

// ── SVG layout ─────────────────────────────────────────────────────────────────

const W = 700, H = 400;
const SELF_HUB  = { x: 158, y: 200 };
const OTHER_HUB = { x: 542, y: 200 };
const CIRCLE_R  = 148;   // the territory rings

// Planet node positions — fanned around each hub
const SELF_PLANETS  = [
  { planet: "Sun",    x: 58,  y: 72  },
  { planet: "Moon",   x: 28,  y: 205 },
  { planet: "Rising", x: 58,  y: 336 },
];
const OTHER_PLANETS = [
  { planet: "Sun",    x: 642, y: 72  },
  { planet: "Moon",   x: 672, y: 205 },
  { planet: "Rising", x: 642, y: 336 },
];

// Bezier control points for primary arcs (Sun↔Sun, Moon↔Moon, Rising↔Rising)
const PRIMARY_CTRL: Record<string, { cx: number; cy: number }> = {
  Sun:    { cx: 350, cy: 22  },   // arcs high above
  Moon:   { cx: 350, cy: 205 },   // straight through center
  Rising: { cx: 350, cy: 378 },   // arcs below
};

// Control points for secondary cross-aspect arcs
const CROSS_CTRL: Record<string, { cx: number; cy: number }> = {
  "Sun-Moon":    { cx: 350, cy: 112 },
  "Moon-Sun":    { cx: 350, cy: 100 },
  "Sun-Rising":  { cx: 350, cy: 190 },
  "Rising-Sun":  { cx: 350, cy: 180 },
  "Moon-Rising": { cx: 350, cy: 275 },
  "Rising-Moon": { cx: 350, cy: 265 },
};

// ── Chart types ────────────────────────────────────────────────────────────────

interface ChartData { sunSign: string; moonSign: string; risingSign: string }

interface MatchDetail {
  id: string;
  matchScore: number;
  breakdown: { elemental: number; emotional: number; communication: number; stability: number };
  explanation: string;
  strengths: string[];
  frictionPoints: string[];
  otherUser: { name: string; birthDate: string; birthCity: string; birthCountry: string; avatarUrl?: string | null };
  otherAstro: ChartData;
  currentAstro: ChartData | null;
}

// ── Synastry chart component ───────────────────────────────────────────────────

interface NodeDef { id: string; label: string; sign: string; x: number; y: number; person: "self" | "other"; type: "hub" | "planet"; planet?: string; floatD: number }
interface EdgeDef { id: string; fromX: number; fromY: number; toX: number; toY: number; cx: number; cy: number; kind: AspectKind; isPrimary: boolean; planetLabel: string; fromId: string; toId: string }

function buildNodes(selfName: string, otherName: string, self: ChartData, other: ChartData): NodeDef[] {
  const selfSigns  = { Sun: self.sunSign,  Moon: self.moonSign,  Rising: self.risingSign };
  const otherSigns = { Sun: other.sunSign, Moon: other.moonSign, Rising: other.risingSign };

  return [
    { id: "sh", label: selfName.split(" ")[0].slice(0,6),  sign: self.sunSign,  ...SELF_HUB,  person: "self",  type: "hub",    floatD: 0   },
    { id: "oh", label: otherName.split(" ")[0].slice(0,6), sign: other.sunSign, ...OTHER_HUB, person: "other", type: "hub",    floatD: 0.5 },
    ...SELF_PLANETS.map(  ({ planet, x, y }, i) => ({ id: `s-${planet.toLowerCase()}`, label: planet, sign: selfSigns [planet as keyof typeof selfSigns],  x, y, person: "self"  as const, type: "planet" as const, planet, floatD: i * 0.3       })),
    ...OTHER_PLANETS.map( ({ planet, x, y }, i) => ({ id: `o-${planet.toLowerCase()}`, label: planet, sign: otherSigns[planet as keyof typeof otherSigns], x, y, person: "other" as const, type: "planet" as const, planet, floatD: i * 0.3 + 0.4 })),
  ];
}

function buildEdges(nodes: NodeDef[], self: ChartData, other: ChartData): EdgeDef[] {
  const nm = Object.fromEntries(nodes.map(n => [n.id, n]));
  const selfSigns  = { Sun: self.sunSign,  Moon: self.moonSign,  Rising: self.risingSign };
  const otherSigns = { Sun: other.sunSign, Moon: other.moonSign, Rising: other.risingSign };
  const edges: EdgeDef[] = [];

  // Primary cross-aspects: same planet
  (["Sun", "Moon", "Rising"] as const).forEach(p => {
    const a = nm[`s-${p.toLowerCase()}`], b = nm[`o-${p.toLowerCase()}`];
    if (!a || !b) return;
    const ctrl = PRIMARY_CTRL[p];
    edges.push({ id: `cross-${p}`, fromX: a.x, fromY: a.y, toX: b.x, toY: b.y, ...ctrl, kind: aspectKind(selfSigns[p], otherSigns[p]), isPrimary: true, planetLabel: p, fromId: a.id, toId: b.id });
  });

  // Secondary cross-aspects
  const pairs: [keyof typeof selfSigns, keyof typeof otherSigns][] = [
    ["Sun","Moon"],["Moon","Sun"],["Sun","Rising"],["Rising","Sun"],["Moon","Rising"],["Rising","Moon"],
  ];
  pairs.forEach(([a, b]) => {
    const k = aspectKind(selfSigns[a], otherSigns[b]);
    if (k === "neutral") return;
    const ctrl = CROSS_CTRL[`${a}-${b}`] ?? { cx: 350, cy: 200 };
    const na = nm[`s-${a.toLowerCase()}`], nb = nm[`o-${b.toLowerCase()}`];
    if (!na || !nb) return;
    edges.push({ id: `cross-${a}-${b}`, fromX: na.x, fromY: na.y, toX: nb.x, toY: nb.y, ...ctrl, kind: k, isPrimary: false, planetLabel: `${a} — ${b}`, fromId: na.id, toId: nb.id });
  });

  return edges;
}

function ZodiacGlyphInSvg({ sign, cx, cy, r, color, opacity = 1 }: { sign: string; cx: number; cy: number; r: number; color: string; opacity?: number }) {
  if (!ZODIAC_PATHS[sign]) return null;
  const s = (r * 1.1) / 24;
  return (
    <g
      transform={`translate(${cx - r * 1.1 / 2}, ${cy - r * 1.1 / 2}) scale(${s})`}
      fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
      strokeWidth={1.8 / s}
      style={{ color, pointerEvents: "none", opacity }}
    >
      {ZODIAC_PATHS[sign]}
    </g>
  );
}

function SynastryChart({ selfName, otherName, self, other }: { selfName: string; otherName: string; self: ChartData; other: ChartData }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [activeAspect, setActiveAspect] = useState<EdgeDef | null>(null);

  const nodes = buildNodes(selfName, otherName, self, other);
  const edges = buildEdges(nodes, self, other);
  const nm    = Object.fromEntries(nodes.map(n => [n.id, n]));

  const connectedIds = new Set<string>();
  const activeEdgeIds = new Set<string>();
  if (hovered) {
    edges.forEach(e => {
      if (e.fromId === hovered || e.toId === hovered) {
        activeEdgeIds.add(e.id);
        connectedIds.add(e.fromId);
        connectedIds.add(e.toId);
      }
    });
  }
  const anyHovered = hovered !== null;

  return (
    <div className="w-full relative" onMouseLeave={() => { setHovered(null); setActiveAspect(null); }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: "auto", overflow: "visible" }}
      >
        {/* ── Territory circles ── */}
        <circle cx={SELF_HUB.x}  cy={SELF_HUB.y}  r={CIRCLE_R} fill="none" stroke="#d4cfc9" strokeWidth="0.6" strokeDasharray="4 6" />
        <circle cx={OTHER_HUB.x} cy={OTHER_HUB.y} r={CIRCLE_R} fill="none" stroke="#d4cfc9" strokeWidth="0.6" strokeDasharray="4 6" />

        {/* ── Center meridian ── */}
        <line x1={350} y1={30} x2={350} y2={H - 30} stroke="#e5e2dc" strokeWidth="0.5" />
        <circle cx={350} cy={H / 2} r={3} fill="#e5e2dc" />

        {/* ── Spoke edges (hub → planet) ── */}
        {(["Sun","Moon","Rising"] as const).map(p => {
          const sp = SELF_PLANETS.find(x => x.planet === p)!;
          const op = OTHER_PLANETS.find(x => x.planet === p)!;
          const sDim = anyHovered && !connectedIds.has(`s-${p.toLowerCase()}`) && hovered !== "sh";
          const oDim = anyHovered && !connectedIds.has(`o-${p.toLowerCase()}`) && hovered !== "oh";
          return (
            <g key={`spoke-${p}`}>
              <line x1={SELF_HUB.x}  y1={SELF_HUB.y}  x2={sp.x} y2={sp.y} stroke="#ccc7c0" strokeWidth="0.7" strokeDasharray="2 4" opacity={sDim ? 0.2 : 0.7} style={{ transition: "opacity 0.2s" }} />
              <line x1={OTHER_HUB.x} y1={OTHER_HUB.y} x2={op.x} y2={op.y} stroke="#ccc7c0" strokeWidth="0.7" strokeDasharray="2 4" opacity={oDim ? 0.2 : 0.7} style={{ transition: "opacity 0.2s" }} />
            </g>
          );
        })}

        {/* ── Aspect arcs ── */}
        {edges.map(e => {
          const meta   = ASPECT[e.kind];
          const isAct  = activeEdgeIds.has(e.id);
          const isDim  = anyHovered && !isAct;
          const path   = `M ${e.fromX} ${e.fromY} Q ${e.cx} ${e.cy} ${e.toX} ${e.toY}`;
          return (
            <path
              key={e.id} d={path}
              fill="none"
              stroke={meta.color}
              strokeWidth={isAct ? (e.isPrimary ? 2.2 : 1.6) : e.isPrimary ? 1.3 : 0.7}
              strokeDasharray={meta.dash}
              strokeOpacity={isDim ? 0.05 : isAct ? 0.9 : e.isPrimary ? 0.45 : 0.22}
              strokeLinecap="round"
              style={{ transition: "stroke-opacity 0.18s, stroke-width 0.15s", cursor: "pointer" }}
              onMouseEnter={() => { setActiveAspect(e); }}
              onMouseLeave={() => { setActiveAspect(null); }}
            />
          );
        })}

        {/* ── Planet + hub nodes ── */}
        {nodes.map(n => {
          const isAct  = hovered === n.id;
          const isCon  = connectedIds.has(n.id);
          const isDim  = anyHovered && !isAct && !isCon;
          const el     = SIGN_ELEMENT[n.sign] ?? "air";
          const elHex  = EL_HEX[el];
          const r      = n.type === "hub" ? 24 : 15;

          return (
            <motion.g
              key={n.id}
              animate={{ y: [0, -(2 + n.floatD), 0] }}
              transition={{ duration: 3.5 + n.floatD * 0.8, repeat: Infinity, ease: "easeInOut", delay: n.floatD * 0.6 }}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHovered(n.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Drop shadow on hover */}
              {isAct && (
                <circle cx={n.x + 1} cy={n.y + 2} r={r + 1} fill="rgba(0,0,0,0.07)" />
              )}

              {/* Node body */}
              <circle
                cx={n.x} cy={n.y} r={r}
                fill="#ffffff"
                stroke={isAct || isCon ? elHex : "#d6d1cb"}
                strokeWidth={isAct ? 2 : 1}
                opacity={isDim ? 0.3 : 1}
                style={{ transition: "stroke 0.18s, opacity 0.18s" }}
              />

              {/* Hub inner ring */}
              {n.type === "hub" && (
                <circle cx={n.x} cy={n.y} r={r - 6} fill="none" stroke={isDim ? "#ede9e4" : "#e5e1db"} strokeWidth="0.5" />
              )}

              {/* Zodiac glyph for planet nodes */}
              {n.type === "planet" && n.sign && (
                <ZodiacGlyphInSvg sign={n.sign} cx={n.x} cy={n.y} r={r * 0.85} color={isDim ? "#ccc8c2" : elHex} opacity={isDim ? 0.4 : 0.85} />
              )}

              {/* Hub initials */}
              {n.type === "hub" && (
                <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="central"
                  fill={isDim ? "#ccc8c2" : "#44403c"}
                  fontSize="9" fontWeight="600"
                  fontFamily="ui-serif, Georgia, serif"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {n.label}
                </text>
              )}

              {/* Sign label — above planet nodes */}
              {n.type === "planet" && (
                <text x={n.x} y={n.y - r - 5}
                  textAnchor="middle"
                  fill={isDim ? "#d6d1cb" : "#9c9086"}
                  fontSize="6.5" fontFamily="ui-sans-serif, system-ui, sans-serif"
                  letterSpacing="0.04em"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {n.sign}
                </text>
              )}

              {/* Planet label — side of node */}
              {n.type === "planet" && (
                <text
                  x={n.person === "self" ? n.x + r + 4 : n.x - r - 4}
                  y={n.y + 1}
                  textAnchor={n.person === "self" ? "start" : "end"}
                  dominantBaseline="central"
                  fill={isDim ? "#d6d1cb" : "#78716c"}
                  fontSize="6.5" fontFamily="ui-sans-serif, system-ui, sans-serif"
                  letterSpacing="0.1em"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {n.label.toUpperCase()}
                </text>
              )}
            </motion.g>
          );
        })}

        {/* ── Person labels below hubs ── */}
        <text x={SELF_HUB.x}  y={H - 12} textAnchor="middle" fill="#78716c" fontSize="8" fontFamily="ui-sans-serif" letterSpacing="0.12em">YOU</text>
        <text x={OTHER_HUB.x} y={H - 12} textAnchor="middle" fill="#78716c" fontSize="8" fontFamily="ui-sans-serif" letterSpacing="0.12em">{(nm["oh"]?.label ?? "").toUpperCase()}</text>
      </svg>

      {/* Aspect tooltip */}
      <AnimatePresence>
        {activeAspect && ASPECT[activeAspect.kind].desc && (
          <motion.div
            key={activeAspect.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 bottom-2 flex justify-center pointer-events-none"
          >
            <div className="inline-flex items-center gap-2 bg-white border border-stone-200 rounded-full px-4 py-1.5 shadow-sm">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: ASPECT[activeAspect.kind].color }} />
              <span className="text-xs text-stone-600 font-medium">{activeAspect.planetLabel}</span>
              <span className="text-stone-300 text-xs">·</span>
              <span className="text-xs text-stone-500">{ASPECT[activeAspect.kind].label}</span>
              <span className="text-stone-300 text-xs">·</span>
              <span className="text-xs text-stone-400 italic">{ASPECT[activeAspect.kind].feel}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover hint */}
      {!hovered && !activeAspect && (
        <p className="text-center text-[10px] text-stone-400 mt-1 tracking-wide">
          Hover nodes and lines to explore connections
        </p>
      )}
    </div>
  );
}

// ── Aspect legend ──────────────────────────────────────────────────────────────

function AspectLegend() {
  return (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6">
      {(["conjunction","trine","sextile","square","opposition"] as AspectKind[]).map(k => (
        <div key={k} className="flex items-center gap-2">
          <svg width="18" height="4">
            <line x1="0" y1="2" x2="18" y2="2" stroke={ASPECT[k].color} strokeWidth="1.5" strokeDasharray={ASPECT[k].dash} />
          </svg>
          <span className="text-[10px] text-stone-500 tracking-wide">{ASPECT[k].label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Primary aspect cards ───────────────────────────────────────────────────────

function AspectCards({ self, other }: { self: ChartData; other: ChartData }) {
  const selfSigns  = { Sun: self.sunSign,  Moon: self.moonSign,  Rising: self.risingSign  };
  const otherSigns = { Sun: other.sunSign, Moon: other.moonSign, Rising: other.risingSign };
  const planets    = ["Sun", "Moon", "Rising"] as const;
  const [open, setOpen] = useState<string | null>("Sun");

  return (
    <div className="border-t border-stone-200">
      {planets.map(p => {
        const k      = aspectKind(selfSigns[p], otherSigns[p]);
        const meta   = ASPECT[k];
        const elA    = SIGN_ELEMENT[selfSigns[p]];
        const elB    = SIGN_ELEMENT[otherSigns[p]];
        const isOpen = open === p;

        if (k === "neutral" || !meta.desc) return null;

        return (
          <div key={p} className="border-b border-stone-100">
            <button
              className="w-full text-left py-5 flex items-center gap-5 group"
              onClick={() => setOpen(isOpen ? null : p)}
            >
              {/* Aspect color swatch */}
              <div className="w-2 self-stretch rounded-full shrink-0" style={{ background: meta.color, opacity: 0.5 }} />

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-stone-900 font-serif text-base font-semibold">
                    Your {p}
                  </span>
                  <span className="text-stone-400 text-sm">in</span>
                  <span className="text-sm font-medium" style={{ color: EL_HEX[elA] ?? "#78716c" }}>{selfSigns[p]}</span>
                  <span className="text-stone-300 text-sm">×</span>
                  <span className="text-stone-400 text-sm">their {p} in</span>
                  <span className="text-sm font-medium" style={{ color: EL_HEX[elB] ?? "#78716c" }}>{otherSigns[p]}</span>
                </div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="text-stone-500 text-sm leading-relaxed mt-3 max-w-xl pr-4">{meta.desc}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="shrink-0 flex items-center gap-2 pr-1">
                <span className="text-[10px] tracking-[0.12em] uppercase font-medium" style={{ color: meta.color }}>{meta.label}</span>
                <span className="text-stone-300 text-sm transition-transform" style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)", display: "inline-block" }}>+</span>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ── Big Three summary ──────────────────────────────────────────────────────────

function SignSummary({ name, chart, side }: { name: string; chart: ChartData; side: "self" | "other" }) {
  const planets = [
    { label: "Sun",    sign: chart.sunSign,    desc: "Core identity" },
    { label: "Moon",   sign: chart.moonSign,   desc: "Emotional world" },
    { label: "Rising", sign: chart.risingSign, desc: "First impression" },
  ];

  return (
    <div className={side === "other" ? "text-right md:text-left" : ""}>
      <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-5">{name}</p>
      <div className="space-y-5">
        {planets.map(({ label, sign, desc }) => {
          const el    = SIGN_ELEMENT[sign] ?? "air";
          const elHex = EL_HEX[el];
          const planet= SIGN_PLANET[sign] ?? "";
          const mod   = SIGN_MODALITY[sign] ?? "";
          return (
            <div key={label}>
              <div className="flex items-center gap-2 mb-1" style={{ flexDirection: side === "other" ? "row-reverse" : "row" }}>
                <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke={elHex} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {ZODIAC_PATHS[sign]}
                </svg>
                <span className="text-stone-800 text-sm font-semibold">{sign}</span>
                <span className="text-stone-400 text-xs">{label}</span>
              </div>
              <p className="text-stone-400 text-[10px] tracking-wide">{mod} · {el} · {planet}</p>
              <p className="text-stone-500 text-xs mt-1">{desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Utility ────────────────────────────────────────────────────────────────────

function getAge(dateStr: string) {
  const birth = new Date(dateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() - birth.getMonth() < 0 || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function MatchSynastryPage() {
  const { status } = useSession();
  const router     = useRouter();
  const params     = useParams<{ matchId: string }>();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !params.matchId) return;
    fetch(`/api/matches/${params.matchId}`)
      .then(r => r.json())
      .then(d => { if (!d.error) setMatch(d); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status, params.matchId]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#f7f4ef] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-stone-300 border-t-stone-600 animate-spin" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-[#f7f4ef] flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-500 text-sm">Match not found.</p>
          <Link href="/matches" className="text-stone-700 text-sm underline mt-2 inline-block">Back to matches</Link>
        </div>
      </div>
    );
  }

  const selfChart  = match.currentAstro ?? { sunSign: "Unknown", moonSign: "Unknown", risingSign: "Unknown" };
  const otherChart = match.otherAstro;
  const age        = getAge(match.otherUser.birthDate);
  const hasAstro   = match.currentAstro !== null;

  return (
    <div className="min-h-screen bg-[#f7f4ef]" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>

      {/* ── Top navigation ── */}
      <header className="sticky top-0 z-20 bg-[#f7f4ef]/90 backdrop-blur-sm border-b border-stone-200/60">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/matches" className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" />
            <span>Matches</span>
          </Link>
          <p className="font-serif text-stone-700 text-sm tracking-wide">
            {match.otherUser.name.split(" ")[0]} × You
          </p>
          <Link
            href={`/messages/${match.id}`}
            className="flex items-center gap-1.5 text-sm text-stone-700 hover:text-stone-900 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Message</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 pb-20">

        {/* ── Header: two people + score ── */}
        <section className="flex items-start justify-between gap-6 mb-12">
          {/* Their info */}
          <div className="flex items-center gap-3">
            {match.otherUser.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={match.otherUser.avatarUrl} alt={match.otherUser.name}
                className="w-12 h-12 rounded-full object-cover ring-1 ring-stone-200" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 text-sm font-bold">
                {match.otherUser.name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-serif text-stone-800 text-base font-semibold">{match.otherUser.name}, {age}</p>
              <p className="text-stone-400 text-xs mt-0.5">{match.otherUser.birthCity}</p>
            </div>
          </div>

          {/* Score */}
          <div className="text-center shrink-0">
            <p className="font-serif text-stone-800 text-4xl font-light leading-none">{match.matchScore}</p>
            <p className="text-[9px] text-stone-400 tracking-[0.2em] uppercase mt-1">% compatibility</p>
          </div>

          {/* You */}
          <div className="flex items-center gap-3 flex-row-reverse">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 text-sm font-bold ring-1 ring-stone-200">
              You
            </div>
            <div className="text-right">
              <p className="font-serif text-stone-800 text-base font-semibold">You</p>
              <p className="text-stone-400 text-xs mt-0.5">{hasAstro ? selfChart.sunSign : "Add your chart"}</p>
            </div>
          </div>
        </section>

        {/* ── The synastry graph ── */}
        <section className="mb-4">
          {hasAstro ? (
            <SynastryChart
              selfName="You"
              otherName={match.otherUser.name}
              self={selfChart}
              other={otherChart}
            />
          ) : (
            <div className="border border-dashed border-stone-300 rounded-xl py-16 text-center">
              <p className="text-stone-500 text-sm mb-3">Add your birth chart to see the synastry web</p>
              <Link href="/onboarding" className="text-stone-700 text-sm font-medium underline">Set up your chart</Link>
            </div>
          )}
          {hasAstro && <AspectLegend />}
        </section>

        {/* ── Divider ── */}
        <div className="border-t border-stone-200 my-12" />

        {/* ── Primary aspect readings ── */}
        {hasAstro && (
          <section className="mb-14">
            <p className="text-[10px] tracking-[0.22em] uppercase text-stone-400 mb-6">Primary connections</p>
            <AspectCards self={selfChart} other={otherChart} />
          </section>
        )}

        {/* ── Big Three: side by side ── */}
        <section className="mb-14">
          <p className="text-[10px] tracking-[0.22em] uppercase text-stone-400 mb-8">The big three</p>
          <div className="grid grid-cols-2 gap-10 md:gap-20">
            <SignSummary name="You" chart={selfChart} side="self" />
            <SignSummary name={match.otherUser.name.split(" ")[0]} chart={otherChart} side="other" />
          </div>
        </section>

        {/* ── Compatibility breakdown ── */}
        <section className="mb-14 border-t border-stone-200 pt-10">
          <p className="text-[10px] tracking-[0.22em] uppercase text-stone-400 mb-8">Compatibility breakdown</p>
          <div className="grid grid-cols-2 gap-x-10 gap-y-5 max-w-sm">
            {([
              ["Elemental",     match.breakdown.elemental],
              ["Emotional",     match.breakdown.emotional],
              ["Communication", match.breakdown.communication],
              ["Stability",     match.breakdown.stability],
            ] as [string, number][]).map(([label, val]) => (
              <div key={label}>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-xs text-stone-500">{label}</span>
                  <span className="text-xs font-medium text-stone-700">{val}%</span>
                </div>
                <div className="h-0.5 rounded-full bg-stone-200 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-stone-700"
                    initial={{ width: 0 }}
                    animate={{ width: `${val}%` }}
                    transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── What works / navigate with awareness ── */}
        {(match.strengths.length > 0 || match.frictionPoints.length > 0) && (
          <section className="mb-14 grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-stone-200 pt-10">
            {match.strengths.length > 0 && (
              <div>
                <p className="text-[10px] tracking-[0.22em] uppercase text-stone-400 mb-5">Why this works</p>
                <div className="space-y-3">
                  {match.strengths.map((s, i) => (
                    <p key={i} className="text-stone-600 text-sm leading-relaxed pl-3 border-l border-stone-300">{s}</p>
                  ))}
                </div>
              </div>
            )}
            {match.frictionPoints.length > 0 && (
              <div>
                <p className="text-[10px] tracking-[0.22em] uppercase text-stone-400 mb-5">Navigate with awareness</p>
                <div className="space-y-3">
                  {match.frictionPoints.map((f, i) => (
                    <p key={i} className="text-stone-500 text-sm leading-relaxed pl-3 border-l border-stone-200">{f}</p>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── CTA ── */}
        <div className="border-t border-stone-200 pt-10 flex items-center gap-6">
          <Link
            href={`/messages/${match.id}`}
            className="inline-flex items-center gap-2 bg-stone-900 text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-stone-700 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Send a message
          </Link>
          <Link href="/matches" className="text-stone-400 text-sm hover:text-stone-600 transition-colors">
            Back to matches
          </Link>
        </div>

      </main>
    </div>
  );
}
