"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ZODIAC_PATHS } from "@/components/ui/zodiac-icon";

// ─── Astrology data ────────────────────────────────────────────────────────────

const SIGN_ELEMENT: Record<string, string> = {
  Aries: "fire",   Leo: "fire",    Sagittarius: "fire",
  Taurus: "earth", Virgo: "earth", Capricorn: "earth",
  Gemini: "air",   Libra: "air",   Aquarius: "air",
  Cancer: "water", Scorpio: "water", Pisces: "water",
};
const SIGN_MODALITY: Record<string, string> = {
  Aries: "Cardinal", Cancer: "Cardinal", Libra: "Cardinal",    Capricorn: "Cardinal",
  Taurus: "Fixed",   Leo: "Fixed",       Scorpio: "Fixed",     Aquarius: "Fixed",
  Gemini: "Mutable", Virgo: "Mutable",   Sagittarius: "Mutable", Pisces: "Mutable",
};
const SIGN_PLANET: Record<string, string> = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
  Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Pluto",
  Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Uranus", Pisces: "Neptune",
};
// Muted element colors — readable on cream/white
const EL: Record<string, { hex: string; name: string }> = {
  fire:  { hex: "#b45309", name: "Fire"  },
  earth: { hex: "#166534", name: "Earth" },
  air:   { hex: "#075985", name: "Air"   },
  water: { hex: "#5b21b6", name: "Water" },
};

// Placement descriptions — per sign × per planet
const SIGN_DESC: Record<string, { sun: string; moon: string; rising: string }> = {
  Aries:       { sun: "Identity is tied to action and initiative. Needs to be moving toward something — the first move, the open door.", moon: "Processes emotion by doing, not sitting with it. Needs independence; direct confrontation is easier than slow-burn tension.", rising: "Comes across as immediate and energetic. First impressions are forward-moving, sometimes intense." },
  Taurus:      { sun: "Identity is grounded in what they build and keep. Stability is a prerequisite, not a comfort. Patient in ways most people aren't.", moon: "Needs physical comfort and emotional constancy. Sudden shifts in affection or routine are destabilising. Shows love through presence.", rising: "Presents as calm, unhurried, trustworthy. People sense they won't be pushed around. Groundedness either reassures or frustrates." },
  Gemini:      { sun: "Sense of self is built in language. Needs to talk things through to know what to think. Boredom is a genuine threat.", moon: "Needs to think out loud. Talking through a feeling matters more than resolving it. Does better with partners who hold things lightly.", rising: "Comes across as quick, curious, easy to talk to. First impression is friendly and sharp, though sometimes hard to pin down." },
  Cancer:      { sun: "Home and belonging are at the center of identity. Feels things deeply and retains them long. Protective instinct is strong.", moon: "This is the Moon's home sign. Emotional world is rich and long-memoried. Needs to feel cared for to fully open up.", rising: "Reads as warm and guarded at first. People sense that closeness takes time, and that once earned, it means something." },
  Leo:         { sun: "Needs to matter — to be seen and appreciated for what they actually bring. When given room to lead, becomes genuinely generous.", moon: "Needs warmth and recognition. Hurt more easily by indifference than by criticism. Gives a lot and needs it acknowledged.", rising: "Enters a room and people notice. First impression is warm, theatrical, sometimes magnetic. People remember meeting them." },
  Virgo:       { sun: "Identity is built around usefulness and discernment. Notices what others miss and cares about doing things right.", moon: "Processes by analysing. Needs order and quiet to feel settled. Shows love through practical, specific acts of care.", rising: "Comes across as composed, observant, precise with words. People sense they're being noticed. First impression is competent, occasionally reserved." },
  Libra:       { sun: "Relationships are natural habitat. Identity is shaped in relation to others — balance and fairness are non-negotiable.", moon: "Needs harmony. Conflict is uncomfortable enough to be avoided past the point of usefulness. Needs a partner who can name what's wrong.", rising: "Comes across as graceful and easy to like. People feel comfortable quickly. First impression is polished and personable." },
  Scorpio:     { sun: "Depth is the standard. Surface-level connection doesn't register. Identity is built through transformation and what's survived.", moon: "Feels everything fully and forgets nothing. Trust takes time to build and a moment to break. Needs real intimacy, not approximate.", rising: "Comes across as intense and self-contained. People sense more going on beneath. First impression is magnetic and hard to penetrate." },
  Sagittarius: { sun: "Identity is organised around freedom and meaning. Needs to believe the life being lived matters and that more is always possible.", moon: "Needs space and levity. Heavy demands drain quickly. Processes feelings through movement and the long view.", rising: "Comes across as open, enthusiastic, unjudging. First impression is warm and a little wild — someone who just got back from somewhere interesting." },
  Capricorn:   { sun: "Sense of self is earned through work and responsibility. Takes obligations seriously and expects the same in return.", moon: "Self-contained and slow to show it. What's needed in a relationship is someone who makes it safe not to hold it together.", rising: "Comes across as competent, steady, a little serious. People assume they have their life handled. First impression is trustworthy, occasionally distant." },
  Aquarius:    { sun: "Identity is individual, sometimes as a matter of principle. Needs intellectual freedom above everything else.", moon: "More comfortable with ideas than feelings. Cares deeply but processes it through understanding. Needs a partner who reads space as neutrality, not withdrawal.", rising: "Comes across as unusual and hard to categorise. First impression is interesting and a bit electric — operating from a different set of values." },
  Pisces:      { sun: "Boundaries between self and world are naturally porous. Identity is fluid, which makes for extraordinary empathy.", moon: "Needs softness, creativity, and transcendence. Harsh environments deplete quickly. Needs a partner who reads sensitivity as perception, not weakness.", rising: "Comes across as gentle, somewhat dreamlike, easy to confide in. First impression is open and a little otherworldly." },
};

// Aspect metadata
type AspectKind = "conjunction" | "trine" | "sextile" | "square" | "opposition" | "neutral";

function aspectKind(a: string, b: string): AspectKind {
  if (!a || !b || a === "Unknown" || b === "Unknown") return "neutral";
  if (a === b) return "conjunction";
  const eA = SIGN_ELEMENT[a], eB = SIGN_ELEMENT[b];
  const mA = SIGN_MODALITY[a], mB = SIGN_MODALITY[b];
  if (!eA || !eB) return "neutral";
  if ((eA === "fire" && eB === "water") || (eA === "water" && eB === "fire")) return "opposition";
  if ((eA === "earth" && eB === "air")  || (eA === "air"   && eB === "earth")) return "opposition";
  if (eA === eB) return "trine";
  if ((eA === "fire" && eB === "air")    || (eA === "air"   && eB === "fire"))  return "sextile";
  if ((eA === "earth" && eB === "water") || (eA === "water" && eB === "earth")) return "sextile";
  if (mA === mB) return "square";
  return "neutral";
}

const ASPECT: Record<AspectKind, { color: string; dash?: string; label: string; desc: string; feel: string; weight: number }> = {
  conjunction: { color: "#6d28d9", label: "Conjunction", weight: 2,   desc: "These energies merge into one. The most direct contact two charts can make — fused, intense, impossible to ignore.", feel: "Intense and immediate" },
  trine:       { color: "#15803d", label: "Trine",       weight: 1.5, desc: "Same element, same frequency. Understanding flows without effort. This is the aspect of ease — the connection that feels like coming home.", feel: "Natural and accepting" },
  sextile:     { color: "#0369a1", dash: "6 3", label: "Sextile",    weight: 1, desc: "Complementary elements in conversation. Supportive without being dramatic. Things move in the same direction with room to breathe.", feel: "Easy, low friction" },
  square:      { color: "#b45309", dash: "3 4", label: "Square",     weight: 1, desc: "Friction that demands resolution. The most memorable connections often have squares — something to work through that keeps both people growing.", feel: "Activating and dynamic" },
  opposition:  { color: "#be123c", dash: "2 4", label: "Opposition", weight: 1, desc: "Magnetic polarity. You are drawn to what the other person holds — the thing you carry differently or suppress. At best, it creates balance.", feel: "Magnetic, polarising" },
  neutral:     { color: "#9ca3af", dash: "2 6", label: "", weight: 0.5, desc: "", feel: "" },
};

// ─── SVG layout ────────────────────────────────────────────────────────────────

const W = 640, H = 380;
const SELF_HUB  = { x: 140, y: 190 };
const OTHER_HUB = { x: 500, y: 190 };
const CIRCLE_R  = 135;

const SELF_PLANETS  = [
  { planet: "Sun",    x: 60,  y: 68  },
  { planet: "Moon",   x: 26,  y: 192 },
  { planet: "Rising", x: 60,  y: 316 },
];
const OTHER_PLANETS = [
  { planet: "Sun",    x: 580, y: 68  },
  { planet: "Moon",   x: 614, y: 192 },
  { planet: "Rising", x: 580, y: 316 },
];

const PRIMARY_CTRL: Record<string, { cx: number; cy: number }> = {
  Sun:    { cx: 320, cy: 16  },
  Moon:   { cx: 320, cy: 192 },
  Rising: { cx: 320, cy: 368 },
};
const CROSS_CTRL: Record<string, { cx: number; cy: number }> = {
  "Sun-Moon":    { cx: 320, cy: 108 },
  "Moon-Sun":    { cx: 320, cy: 98  },
  "Sun-Rising":  { cx: 320, cy: 182 },
  "Rising-Sun":  { cx: 320, cy: 172 },
  "Moon-Rising": { cx: 320, cy: 264 },
  "Rising-Moon": { cx: 320, cy: 256 },
};

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ChartData { sunSign: string; moonSign: string; risingSign: string }

interface MatchDetail {
  id: string; matchScore: number;
  breakdown: { elemental: number; emotional: number; communication: number; stability: number };
  explanation: string; strengths: string[]; frictionPoints: string[];
  otherUser: { name: string; birthDate: string; birthCity: string; birthCountry: string; avatarUrl?: string | null };
  otherAstro: ChartData;
  currentAstro: ChartData | null;
}

interface NodeDef {
  id: string; label: string; sign: string; x: number; y: number;
  person: "self" | "other"; type: "hub" | "planet"; planet?: string; floatD: number;
}
interface EdgeDef {
  id: string; fromX: number; fromY: number; toX: number; toY: number; cx: number; cy: number;
  kind: AspectKind; isPrimary: boolean; planetLabel: string; selfPlanet: string; otherPlanet: string;
  selfSign: string; otherSign: string; fromId: string; toId: string;
}

// ─── Build graph data ──────────────────────────────────────────────────────────

function buildGraph(selfName: string, otherName: string, self: ChartData, other: ChartData) {
  const ss = { Sun: self.sunSign,  Moon: self.moonSign,  Rising: self.risingSign  };
  const os = { Sun: other.sunSign, Moon: other.moonSign, Rising: other.risingSign };

  const nodes: NodeDef[] = [
    { id: "sh", label: selfName.split(" ")[0].slice(0,5),  sign: self.sunSign,  ...SELF_HUB,  person: "self",  type: "hub",    floatD: 0   },
    { id: "oh", label: otherName.split(" ")[0].slice(0,5), sign: other.sunSign, ...OTHER_HUB, person: "other", type: "hub",    floatD: 0.5 },
    ...SELF_PLANETS.map( ({ planet, x, y }, i) => ({ id: `s-${planet.toLowerCase()}`, label: planet, sign: ss[planet as keyof typeof ss],  x, y, person: "self"  as const, type: "planet" as const, planet, floatD: i * 0.3       })),
    ...OTHER_PLANETS.map(({ planet, x, y }, i) => ({ id: `o-${planet.toLowerCase()}`, label: planet, sign: os[planet as keyof typeof os], x, y, person: "other" as const, type: "planet" as const, planet, floatD: i * 0.3 + 0.4 })),
  ];

  const nm = Object.fromEntries(nodes.map(n => [n.id, n]));
  const edges: EdgeDef[] = [];

  // Primary same-planet arcs
  (["Sun", "Moon", "Rising"] as const).forEach(p => {
    const a = nm[`s-${p.toLowerCase()}`], b = nm[`o-${p.toLowerCase()}`];
    if (!a || !b) return;
    edges.push({ id: `cross-${p}`, fromX: a.x, fromY: a.y, toX: b.x, toY: b.y, ...PRIMARY_CTRL[p], kind: aspectKind(ss[p], os[p]), isPrimary: true, planetLabel: p, selfPlanet: p, otherPlanet: p, selfSign: ss[p], otherSign: os[p], fromId: a.id, toId: b.id });
  });

  // Secondary cross-planet arcs
  const pairs: [keyof typeof ss, keyof typeof os][] = [["Sun","Moon"],["Moon","Sun"],["Sun","Rising"],["Rising","Sun"],["Moon","Rising"],["Rising","Moon"]];
  pairs.forEach(([a, b]) => {
    const k = aspectKind(ss[a], os[b]);
    if (k === "neutral") return;
    const ctrl = CROSS_CTRL[`${a}-${b}`] ?? { cx: 320, cy: 192 };
    const na = nm[`s-${a.toLowerCase()}`], nb = nm[`o-${b.toLowerCase()}`];
    if (!na || !nb) return;
    edges.push({ id: `cross-${a}-${b}`, fromX: na.x, fromY: na.y, toX: nb.x, toY: nb.y, ...ctrl, kind: k, isPrimary: false, planetLabel: `${a} — ${b}`, selfPlanet: a, otherPlanet: b, selfSign: ss[a], otherSign: os[b], fromId: na.id, toId: nb.id });
  });

  return { nodes, edges, nm };
}

// ─── Glyph renderer ───────────────────────────────────────────────────────────

function Glyph({ sign, cx, cy, r, color, opacity = 1 }: { sign: string; cx: number; cy: number; r: number; color: string; opacity?: number }) {
  if (!ZODIAC_PATHS[sign]) return null;
  const s = (r * 1.1) / 24;
  return (
    <g transform={`translate(${cx - r * 1.1 / 2}, ${cy - r * 1.1 / 2}) scale(${s})`}
      fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
      strokeWidth={1.8 / s} style={{ color, pointerEvents: "none", opacity }}>
      {ZODIAC_PATHS[sign]}
    </g>
  );
}

// ─── SVG Chart (controlled hover state) ───────────────────────────────────────

interface SynastryChartProps {
  selfName: string; otherName: string; self: ChartData; other: ChartData;
  hoveredNodeId: string | null; hoveredEdgeId: string | null;
  onHoverNode: (id: string | null, node: NodeDef | null) => void;
  onHoverEdge: (id: string | null, edge: EdgeDef | null) => void;
}

function SynastryChart({ selfName, otherName, self, other, hoveredNodeId, hoveredEdgeId, onHoverNode, onHoverEdge }: SynastryChartProps) {
  const { nodes, edges, nm } = buildGraph(selfName, otherName, self, other);

  const connectedIds = new Set<string>();
  const activeEdgeIds = new Set<string>();
  if (hoveredNodeId) {
    edges.forEach(e => {
      if (e.fromId === hoveredNodeId || e.toId === hoveredNodeId) {
        activeEdgeIds.add(e.id);
        connectedIds.add(e.fromId);
        connectedIds.add(e.toId);
      }
    });
  }
  if (hoveredEdgeId) {
    const e = edges.find(x => x.id === hoveredEdgeId);
    if (e) { connectedIds.add(e.fromId); connectedIds.add(e.toId); activeEdgeIds.add(e.id); }
  }
  const anyH = hoveredNodeId !== null || hoveredEdgeId !== null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: "auto", overflow: "visible" }}>
      {/* Territory rings */}
      <circle cx={SELF_HUB.x}  cy={SELF_HUB.y}  r={CIRCLE_R} fill="none" stroke="#d8d4ce" strokeWidth="0.5" strokeDasharray="4 7" />
      <circle cx={OTHER_HUB.x} cy={OTHER_HUB.y} r={CIRCLE_R} fill="none" stroke="#d8d4ce" strokeWidth="0.5" strokeDasharray="4 7" />
      {/* Center meridian */}
      <line x1={320} y1={28} x2={320} y2={H - 28} stroke="#e8e4de" strokeWidth="0.5" />
      <circle cx={320} cy={H / 2} r={2.5} fill="#ddd9d2" />

      {/* Spoke edges */}
      {(["Sun","Moon","Rising"] as const).map(p => {
        const sp = SELF_PLANETS.find(x => x.planet === p)!;
        const op = OTHER_PLANETS.find(x => x.planet === p)!;
        const sDim = anyH && !connectedIds.has(`s-${p.toLowerCase()}`) && hoveredNodeId !== "sh";
        const oDim = anyH && !connectedIds.has(`o-${p.toLowerCase()}`) && hoveredNodeId !== "oh";
        return (
          <g key={p}>
            <line x1={SELF_HUB.x}  y1={SELF_HUB.y}  x2={sp.x} y2={sp.y} stroke="#ccc8c0" strokeWidth="0.6" strokeDasharray="2 5" opacity={sDim ? 0.15 : 0.65} style={{ transition: "opacity 0.18s" }} />
            <line x1={OTHER_HUB.x} y1={OTHER_HUB.y} x2={op.x} y2={op.y} stroke="#ccc8c0" strokeWidth="0.6" strokeDasharray="2 5" opacity={oDim ? 0.15 : 0.65} style={{ transition: "opacity 0.18s" }} />
          </g>
        );
      })}

      {/* Aspect arcs */}
      {edges.map(e => {
        const meta  = ASPECT[e.kind];
        const isAct = activeEdgeIds.has(e.id);
        const isDim = anyH && !isAct;
        return (
          <path key={e.id}
            d={`M ${e.fromX} ${e.fromY} Q ${e.cx} ${e.cy} ${e.toX} ${e.toY}`}
            fill="none"
            stroke={meta.color}
            strokeWidth={isAct ? (e.isPrimary ? 2 : 1.5) : e.isPrimary ? 1.2 : 0.65}
            strokeDasharray={meta.dash}
            strokeOpacity={isDim ? 0.05 : isAct ? 0.88 : e.isPrimary ? 0.42 : 0.2}
            strokeLinecap="round"
            style={{ transition: "stroke-opacity 0.18s, stroke-width 0.15s", cursor: "pointer" }}
            onMouseEnter={() => onHoverEdge(e.id, e)}
            onMouseLeave={() => onHoverEdge(null, null)}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map(n => {
        const isAct = hoveredNodeId === n.id;
        const isCon = connectedIds.has(n.id);
        const isDim = anyH && !isAct && !isCon;
        const el    = SIGN_ELEMENT[n.sign] ?? "air";
        const hex   = EL[el]?.hex ?? "#075985";
        const r     = n.type === "hub" ? 22 : 14;

        return (
          <motion.g key={n.id}
            animate={{ y: [0, -(2 + n.floatD), 0] }}
            transition={{ duration: 3.5 + n.floatD * 0.8, repeat: Infinity, ease: "easeInOut", delay: n.floatD * 0.6 }}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => onHoverNode(n.id, n)}
            onMouseLeave={() => onHoverNode(null, null)}
          >
            {/* Hover shadow */}
            {isAct && <circle cx={n.x + 1} cy={n.y + 2} r={r + 1} fill="rgba(0,0,0,0.06)" />}

            <circle cx={n.x} cy={n.y} r={r}
              fill="#ffffff"
              stroke={isAct || isCon ? hex : "#d4cfc8"}
              strokeWidth={isAct ? 1.8 : 1}
              opacity={isDim ? 0.25 : 1}
              style={{ transition: "stroke 0.18s, opacity 0.18s" }}
            />
            {n.type === "hub" && <circle cx={n.x} cy={n.y} r={r - 5} fill="none" stroke={isDim ? "#ede9e3" : "#e8e3dc"} strokeWidth="0.5" />}

            {n.type === "planet" && n.sign && (
              <Glyph sign={n.sign} cx={n.x} cy={n.y} r={r * 0.85} color={isDim ? "#ccc8c0" : hex} opacity={isDim ? 0.35 : 0.82} />
            )}
            {n.type === "hub" && (
              <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="central"
                fill={isDim ? "#ccc8c0" : "#44403c"} fontSize="8" fontWeight="600"
                fontFamily="ui-serif, Georgia, serif" style={{ pointerEvents: "none", userSelect: "none" }}>
                {n.label}
              </text>
            )}
            {/* Sign above */}
            {n.type === "planet" && (
              <text x={n.x} y={n.y - r - 5} textAnchor="middle"
                fill={isDim ? "#d8d3cc" : "#a09890"} fontSize="6"
                fontFamily="ui-sans-serif, system-ui" letterSpacing="0.04em"
                style={{ pointerEvents: "none", userSelect: "none" }}>
                {n.sign}
              </text>
            )}
            {/* Planet name aside */}
            {n.type === "planet" && (
              <text
                x={n.person === "self" ? n.x + r + 4 : n.x - r - 4} y={n.y + 1}
                textAnchor={n.person === "self" ? "start" : "end"} dominantBaseline="central"
                fill={isDim ? "#d8d3cc" : "#78716c"} fontSize="6"
                fontFamily="ui-sans-serif, system-ui" letterSpacing="0.1em"
                style={{ pointerEvents: "none", userSelect: "none" }}>
                {n.label.toUpperCase()}
              </text>
            )}
          </motion.g>
        );
      })}

      {/* Person labels */}
      <text x={SELF_HUB.x}  y={H - 10} textAnchor="middle" fill="#a09890" fontSize="7.5" fontFamily="ui-sans-serif" letterSpacing="0.14em">YOU</text>
      <text x={OTHER_HUB.x} y={H - 10} textAnchor="middle" fill="#a09890" fontSize="7.5" fontFamily="ui-sans-serif" letterSpacing="0.14em">
        {selfName === "You" ? nm["oh"]?.label?.toUpperCase() : nm["oh"]?.label?.toUpperCase()}
      </text>
    </svg>
  );
}

// ─── Detail panel (reactive) ───────────────────────────────────────────────────

function DetailPanel({ hoveredNode, hoveredEdge, match, self, other }: {
  hoveredNode: NodeDef | null; hoveredEdge: EdgeDef | null;
  match: MatchDetail; self: ChartData; other: ChartData;
}) {
  const ss = { Sun: self.sunSign,  Moon: self.moonSign,  Rising: self.risingSign  };
  const os = { Sun: other.sunSign, Moon: other.moonSign, Rising: other.risingSign };

  // Primary aspects summary
  const primaries = (["Sun","Moon","Rising"] as const).map(p => ({
    planet: p, kind: aspectKind(ss[p], os[p]),
    selfSign: ss[p], otherSign: os[p],
  }));

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* Dynamic top section */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        <AnimatePresence mode="wait">

          {/* ── Node hovered ── */}
          {hoveredNode && hoveredNode.type === "planet" && hoveredNode.planet && (
            <motion.div key={`node-${hoveredNode.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.22,1,0.36,1] }}
            >
              {/* Large glyph */}
              <div className="flex items-center gap-3 mb-4">
                {ZODIAC_PATHS[hoveredNode.sign] && (() => {
                  const el = SIGN_ELEMENT[hoveredNode.sign] ?? "air";
                  const hex = EL[el]?.hex ?? "#075985";
                  return (
                    <svg viewBox="0 0 24 24" width={36} height={36} fill="none"
                      stroke={hex} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      {ZODIAC_PATHS[hoveredNode.sign]}
                    </svg>
                  );
                })()}
                <div>
                  <p className="text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-0.5">
                    {hoveredNode.person === "self" ? "Your" : `${match.otherUser.name.split(" ")[0]}'s`} {hoveredNode.planet}
                  </p>
                  <p className="font-serif text-stone-800 text-xl font-semibold leading-none">{hoveredNode.sign}</p>
                </div>
              </div>

              {/* Element + modality pill row */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(() => {
                  const el  = SIGN_ELEMENT[hoveredNode.sign] ?? "air";
                  const hex = EL[el]?.hex ?? "#075985";
                  return (
                    <>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border" style={{ color: hex, borderColor: hex + "40", background: hex + "0d" }}>{EL[el]?.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-stone-200 text-stone-500">{SIGN_MODALITY[hoveredNode.sign]}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-stone-200 text-stone-500">{SIGN_PLANET[hoveredNode.sign]}</span>
                    </>
                  );
                })()}
              </div>

              {/* Description */}
              {(() => {
                const desc = SIGN_DESC[hoveredNode.sign];
                if (!desc) return null;
                const planet = hoveredNode.planet as "sun" | "moon" | "rising";
                const text = desc[planet.toLowerCase() as "sun" | "moon" | "rising"];
                return <p className="text-stone-500 text-sm leading-relaxed">{text}</p>;
              })()}
            </motion.div>
          )}

          {/* ── Hub node hovered ── */}
          {hoveredNode && hoveredNode.type === "hub" && (
            <motion.div key={`hub-${hoveredNode.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              <p className="text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-3">
                {hoveredNode.person === "self" ? "Your chart" : `${match.otherUser.name.split(" ")[0]}'s chart`}
              </p>
              <div className="space-y-3">
                {(["Sun","Moon","Rising"] as const).map(p => {
                  const sign = hoveredNode.person === "self" ? ss[p] : os[p];
                  const el = SIGN_ELEMENT[sign] ?? "air";
                  const hex = EL[el]?.hex ?? "#075985";
                  return (
                    <div key={p} className="flex items-center gap-2.5">
                      <svg viewBox="0 0 24 24" width={18} height={18} fill="none"
                        stroke={hex} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        {ZODIAC_PATHS[sign]}
                      </svg>
                      <span className="text-stone-500 text-xs">{p}</span>
                      <span className="text-stone-800 text-sm font-medium">{sign}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── Edge hovered ── */}
          {hoveredEdge && !hoveredNode && ASPECT[hoveredEdge.kind].desc && (
            <motion.div key={`edge-${hoveredEdge.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              {/* Aspect header */}
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: ASPECT[hoveredEdge.kind].color }} />
                <div>
                  <p className="text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-0.5">Aspect</p>
                  <p className="font-serif text-stone-800 text-xl font-semibold leading-none">{ASPECT[hoveredEdge.kind].label}</p>
                </div>
              </div>

              {/* Planet pair */}
              <div className="flex items-center gap-2 mb-4 text-sm">
                <div>
                  <span className="text-stone-400 text-xs">Your {hoveredEdge.selfPlanet} · </span>
                  {(() => {
                    const el = SIGN_ELEMENT[hoveredEdge.selfSign] ?? "air";
                    return <span className="font-medium" style={{ color: EL[el]?.hex }}>{hoveredEdge.selfSign}</span>;
                  })()}
                </div>
                <span className="text-stone-300">×</span>
                <div>
                  <span className="text-stone-400 text-xs">their {hoveredEdge.otherPlanet} · </span>
                  {(() => {
                    const el = SIGN_ELEMENT[hoveredEdge.otherSign] ?? "air";
                    return <span className="font-medium" style={{ color: EL[el]?.hex }}>{hoveredEdge.otherSign}</span>;
                  })()}
                </div>
              </div>

              <p className="text-stone-500 text-sm leading-relaxed mb-3">{ASPECT[hoveredEdge.kind].desc}</p>
              <p className="text-stone-400 text-xs italic">{ASPECT[hoveredEdge.kind].feel}</p>
            </motion.div>
          )}

          {/* ── Default: nothing hovered ── */}
          {!hoveredNode && !hoveredEdge && (
            <motion.div key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Score */}
              <div className="mb-6">
                <p className="font-serif text-stone-800 text-5xl font-light leading-none">{match.matchScore}</p>
                <p className="text-[9px] tracking-[0.2em] uppercase text-stone-400 mt-1">% compatibility</p>
              </div>

              {/* Name */}
              <p className="font-serif text-stone-700 text-lg mb-1">{match.otherUser.name.split(" ")[0]} × You</p>
              <p className="text-stone-400 text-xs mb-5">{match.otherUser.birthCity}</p>

              {/* Explanation */}
              {match.explanation && (
                <p className="text-stone-500 text-sm leading-relaxed mb-5 pl-3 border-l border-stone-200">{match.explanation}</p>
              )}

              <p className="text-[10px] text-stone-400 tracking-wide">
                Hover any node or line in the chart to explore what connects you.
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Static bottom: primary aspect summary ── */}
      <div className="shrink-0 border-t border-stone-150 bg-[#faf8f5]">
        <div className="px-5 py-4">
          <p className="text-[8px] tracking-[0.2em] uppercase text-stone-400 mb-3">Primary connections</p>
          <div className="space-y-2">
            {primaries.filter(p => p.kind !== "neutral").map(({ planet, kind, selfSign, otherSign }) => (
              <div key={planet} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ASPECT[kind].color }} />
                <span className="text-[10px] text-stone-500 flex-1 truncate">
                  <span style={{ color: EL[SIGN_ELEMENT[selfSign]]?.hex }}>{selfSign}</span>
                  <span className="text-stone-300 mx-1">×</span>
                  <span style={{ color: EL[SIGN_ELEMENT[otherSign]]?.hex }}>{otherSign}</span>
                </span>
                <span className="text-[9px] tracking-wide shrink-0" style={{ color: ASPECT[kind].color }}>
                  {planet} · {ASPECT[kind].label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Message CTA */}
        <div className="px-5 pb-5">
          <Link href={`/messages/${match.id}`}
            className="flex items-center justify-center gap-2 w-full bg-stone-900 hover:bg-stone-700 text-white text-xs font-medium py-2.5 rounded-full transition-colors">
            <MessageCircle className="h-3.5 w-3.5" />
            Send a message
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Aspect legend ─────────────────────────────────────────────────────────────

function AspectLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {(["conjunction","trine","sextile","square","opposition"] as AspectKind[]).map(k => (
        <div key={k} className="flex items-center gap-1.5">
          <svg width="14" height="3"><line x1="0" y1="1.5" x2="14" y2="1.5" stroke={ASPECT[k].color} strokeWidth="1.5" strokeDasharray={ASPECT[k].dash} /></svg>
          <span className="text-[9px] text-stone-400 tracking-wide">{ASPECT[k].label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

function getAge(d: string) {
  const b = new Date(d), t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  if (t.getMonth() - b.getMonth() < 0 || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
  return a;
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function MatchSynastryPage() {
  const { status } = useSession();
  const router     = useRouter();
  const params     = useParams<{ matchId: string }>();

  const [match,   setMatch]   = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<NodeDef | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<EdgeDef | null>(null);

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

  const handleHoverNode = useCallback((id: string | null, node: NodeDef | null) => {
    setHoveredNode(node);
    if (node) setHoveredEdge(null);
  }, []);
  const handleHoverEdge = useCallback((id: string | null, edge: EdgeDef | null) => {
    setHoveredEdge(edge);
    if (edge) setHoveredNode(null);
  }, []);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#f7f4ef] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-stone-300 border-t-stone-600 animate-spin" />
      </div>
    );
  }
  if (!match) {
    return (
      <div className="min-h-screen bg-[#f7f4ef] flex items-center justify-center">
        <p className="text-stone-500 text-sm">Match not found. <Link href="/matches" className="underline">Back</Link></p>
      </div>
    );
  }

  const selfChart  = match.currentAstro ?? { sunSign: "Unknown", moonSign: "Unknown", risingSign: "Unknown" };
  const otherChart = match.otherAstro;
  const age        = getAge(match.otherUser.birthDate);
  const hasAstro   = match.currentAstro !== null;

  return (
    <div className="h-screen bg-[#f7f4ef] flex flex-col overflow-hidden" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <header className="shrink-0 bg-[#f7f4ef]/95 backdrop-blur-sm border-b border-stone-200/70 z-10">
        <div className="px-6 h-13 flex items-center justify-between gap-4" style={{ height: 52 }}>
          <Link href="/matches" className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" />
            <span>Matches</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-stone-600">
            {match.otherUser.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={match.otherUser.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-[9px] font-bold text-stone-500">
                {match.otherUser.name.split(" ").map(n => n[0]).join("").slice(0,2)}
              </div>
            )}
            <span className="font-serif font-medium">{match.otherUser.name.split(" ")[0]}, {age}</span>
            <span className="text-stone-300">·</span>
            <span className="text-stone-400">{match.otherUser.birthCity}</span>
          </div>
          <div className="w-24" /> {/* spacer */}
        </div>
      </header>

      {/* ── Two-column body ── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Left: graph */}
        <div className="flex-1 flex flex-col justify-center px-6 py-4 overflow-hidden min-w-0">
          {hasAstro ? (
            <>
              <SynastryChart
                selfName="You"
                otherName={match.otherUser.name}
                self={selfChart}
                other={otherChart}
                hoveredNodeId={hoveredNode?.id ?? null}
                hoveredEdgeId={hoveredEdge?.id ?? null}
                onHoverNode={handleHoverNode}
                onHoverEdge={handleHoverEdge}
              />
              <div className="mt-3 pl-1">
                <AspectLegend />
              </div>
            </>
          ) : (
            <div className="border border-dashed border-stone-300 rounded-xl py-16 text-center max-w-lg mx-auto">
              <p className="text-stone-500 text-sm mb-3">Add your birth chart to see the synastry web</p>
              <Link href="/onboarding" className="text-stone-700 text-sm font-medium underline">Set up your chart</Link>
            </div>
          )}
        </div>

        {/* Right: detail panel */}
        <aside className="w-72 shrink-0 border-l border-stone-200 bg-white overflow-hidden flex flex-col">
          <DetailPanel
            hoveredNode={hoveredNode}
            hoveredEdge={hoveredEdge}
            match={match}
            self={selfChart}
            other={otherChart}
          />
        </aside>

      </div>
    </div>
  );
}
