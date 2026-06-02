"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ZODIAC_PATHS } from "@/components/ui/zodiac-icon";

// ── Astrology lookup tables ────────────────────────────────────────────────────

const SIGN_ELEMENT: Record<string, string> = {
  Aries: "fire",    Leo: "fire",    Sagittarius: "fire",
  Taurus: "earth",  Virgo: "earth", Capricorn: "earth",
  Gemini: "air",    Libra: "air",   Aquarius: "air",
  Cancer: "water",  Scorpio: "water", Pisces: "water",
};

const SIGN_MODALITY: Record<string, string> = {
  Aries: "cardinal", Cancer: "cardinal",    Libra: "cardinal",   Capricorn: "cardinal",
  Taurus: "fixed",   Leo: "fixed",          Scorpio: "fixed",    Aquarius: "fixed",
  Gemini: "mutable", Virgo: "mutable",      Sagittarius: "mutable", Pisces: "mutable",
};

const EL_HEX: Record<string, string> = {
  fire: "#f97316", earth: "#10b981", air: "#38bdf8", water: "#818cf8",
};

type AspectKind = "conjunction" | "trine" | "sextile" | "square" | "opposition" | "neutral";

function aspectKind(signA: string, signB: string): AspectKind {
  if (!signA || !signB) return "neutral";
  if (signA === signB) return "conjunction";
  const elA = SIGN_ELEMENT[signA], elB = SIGN_ELEMENT[signB];
  const modA = SIGN_MODALITY[signA], modB = SIGN_MODALITY[signB];
  if (!elA || !elB) return "neutral";
  if ((elA === "fire" && elB === "water") || (elA === "water" && elB === "fire")) return "opposition";
  if ((elA === "earth" && elB === "air") || (elA === "air" && elB === "earth")) return "opposition";
  if (elA === elB) return "trine";
  if ((elA === "fire" && elB === "air") || (elA === "air" && elB === "fire")) return "sextile";
  if ((elA === "earth" && elB === "water") || (elA === "water" && elB === "earth")) return "sextile";
  if (modA === modB) return "square";
  return "neutral";
}

const ASPECT_META: Record<AspectKind, { color: string; dash?: string; label: string; desc: string; weight: number }> = {
  conjunction: { color: "#a78bfa", label: "Conjunction", desc: "Fused energy, intensely aligned",                 weight: 2 },
  trine:       { color: "#34d399", label: "Trine",       desc: "Natural harmony, flows effortlessly",             weight: 1.5 },
  sextile:     { color: "#38bdf8", dash: "5 3", label: "Sextile",   desc: "Cooperative flow, easy support",       weight: 1 },
  square:      { color: "#fb923c", dash: "3 4", label: "Square",    desc: "Productive tension, growth through friction", weight: 1 },
  opposition:  { color: "#f43f5e", dash: "2 4", label: "Opposition", desc: "Magnetic polarity, attracted to your complement", weight: 1 },
  neutral:     { color: "#374151", dash: "2 6", label: "",           desc: "",                                      weight: 0.5 },
};

// ── SVG layout constants ───────────────────────────────────────────────────────

const W = 360, H = 260;
const SELF_X = 76, OTHER_X = W - 76;
const MID_Y = H / 2;

// Planet offsets relative to hub, mirrored for each side
// For self (left side): offset goes left-ish; for other (right side): mirror on x
const PLANET_POS = [
  { planet: "Sun",    selfX: 18,  selfY: 62,  otherX: W - 18,  otherY: 62  },
  { planet: "Moon",   selfX: 8,   selfY: 135, otherX: W - 8,   otherY: 135 },
  { planet: "Rising", selfX: 18,  selfY: 210, otherX: W - 18,  otherY: 210 },
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChartData { sunSign: string; moonSign: string; risingSign: string }

interface AstroGraphProps {
  selfName: string;
  otherName: string;
  self: ChartData;
  other: ChartData;
}

interface NodeDef {
  id: string;
  label: string;
  sign: string;
  x: number;
  y: number;
  person: "self" | "other";
  type: "hub" | "planet";
  planet?: string;
  floatDelay: number;
  floatAmp: number;
}

interface EdgeDef {
  id: string;
  from: string;
  to: string;
  kind: AspectKind;
  isPrimary: boolean;   // same-planet cross (Sun↔Sun, Moon↔Moon, Rising↔Rising)
  isSpoke: boolean;     // hub → planet connector
  planetLabel: string;
}

// ── Graph builder ─────────────────────────────────────────────────────────────

function buildGraph(selfName: string, otherName: string, self: ChartData, other: ChartData) {
  const selfSigns  = { Sun: self.sunSign,  Moon: self.moonSign,  Rising: self.risingSign  };
  const otherSigns = { Sun: other.sunSign, Moon: other.moonSign, Rising: other.risingSign };

  const nodes: NodeDef[] = [
    // Hubs
    { id: "self-hub",  label: selfName.split(" ")[0].slice(0, 5),  sign: self.sunSign,  x: SELF_X,  y: MID_Y, person: "self",  type: "hub", floatDelay: 0,   floatAmp: 2.5 },
    { id: "other-hub", label: otherName.split(" ")[0].slice(0, 5), sign: other.sunSign, x: OTHER_X, y: MID_Y, person: "other", type: "hub", floatDelay: 0.6, floatAmp: 3   },
    // Self planets
    ...PLANET_POS.map(({ planet, selfX, selfY }, i) => ({
      id: `self-${planet.toLowerCase()}`,
      label: planet,
      sign: selfSigns[planet as keyof typeof selfSigns] ?? "",
      x: selfX, y: selfY,
      person: "self" as const, type: "planet" as const, planet,
      floatDelay: i * 0.25, floatAmp: 2 + i * 0.5,
    })),
    // Other planets
    ...PLANET_POS.map(({ planet, otherX, otherY }, i) => ({
      id: `other-${planet.toLowerCase()}`,
      label: planet,
      sign: otherSigns[planet as keyof typeof otherSigns] ?? "",
      x: otherX, y: otherY,
      person: "other" as const, type: "planet" as const, planet,
      floatDelay: i * 0.25 + 0.4, floatAmp: 2.5 + i * 0.4,
    })),
  ];

  const edges: EdgeDef[] = [];

  // Spoke edges: hub → planet
  (["Sun", "Moon", "Rising"] as const).forEach(p => {
    edges.push({ id: `sp-s-${p}`, from: "self-hub",  to: `self-${p.toLowerCase()}`,  kind: "neutral", isPrimary: false, isSpoke: true, planetLabel: "" });
    edges.push({ id: `sp-o-${p}`, from: "other-hub", to: `other-${p.toLowerCase()}`, kind: "neutral", isPrimary: false, isSpoke: true, planetLabel: "" });
  });

  // Primary cross aspects: same planet, between people
  (["Sun", "Moon", "Rising"] as const).forEach(p => {
    edges.push({
      id: `cross-${p}`,
      from: `self-${p.toLowerCase()}`,
      to: `other-${p.toLowerCase()}`,
      kind: aspectKind(selfSigns[p], otherSigns[p]),
      isPrimary: true,
      isSpoke: false,
      planetLabel: p,
    });
  });

  // Secondary cross aspects: cross-planet, if not neutral
  const crossPairs: [keyof typeof selfSigns, keyof typeof otherSigns][] = [
    ["Sun", "Moon"], ["Moon", "Sun"], ["Sun", "Rising"], ["Rising", "Moon"],
  ];
  crossPairs.forEach(([a, b]) => {
    const k = aspectKind(selfSigns[a], otherSigns[b]);
    if (k !== "neutral") {
      edges.push({
        id: `cross-${a}-${b}`,
        from: `self-${a.toLowerCase()}`,
        to: `other-${b.toLowerCase()}`,
        kind: k,
        isPrimary: false,
        isSpoke: false,
        planetLabel: `${a} / ${b}`,
      });
    }
  });

  return { nodes, edges };
}

// ── Zodiac glyph inside a node ─────────────────────────────────────────────────

function ZodiacGlyph({ sign, cx, cy, radius, color, dimmed }: {
  sign: string; cx: number; cy: number; radius: number; color: string; dimmed: boolean;
}) {
  const iconSize = radius * 1.15;
  const s = iconSize / 24;
  const tx = cx - iconSize / 2;
  const ty = cy - iconSize / 2;
  return (
    <g
      transform={`translate(${tx.toFixed(2)}, ${ty.toFixed(2)}) scale(${s.toFixed(3)})`}
      style={{ color, pointerEvents: "none" }}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.7 / s}
      opacity={dimmed ? 0.25 : 0.9}
    >
      {ZODIAC_PATHS[sign]}
    </g>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function AstroGraph({ selfName, otherName, self, other }: AstroGraphProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltipEdge, setTooltipEdge] = useState<EdgeDef | null>(null);

  const { nodes, edges } = buildGraph(selfName, otherName, self, other);
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  // Find edges connected to hovered node
  const activeEdgeIds = new Set<string>();
  const connectedNodeIds = new Set<string>();
  if (hoveredId) {
    edges.forEach(e => {
      if (e.from === hoveredId || e.to === hoveredId) {
        activeEdgeIds.add(e.id);
        connectedNodeIds.add(e.from);
        connectedNodeIds.add(e.to);
      }
    });
  }

  const someHovered = hoveredId !== null;

  // Tooltip text
  const tooltip = tooltipEdge
    ? ASPECT_META[tooltipEdge.kind].desc
      ? `${tooltipEdge.planetLabel}: ${ASPECT_META[tooltipEdge.kind].label}, ${ASPECT_META[tooltipEdge.kind].desc}`
      : null
    : null;

  return (
    <div className="w-full select-none">
      {/* Title bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="h-px flex-1 bg-stone-200" />
        <p className="text-[9px] tracking-[0.22em] uppercase text-stone-400">Synastry web</p>
        <div className="h-px flex-1 bg-stone-200" />
      </div>

      {/* SVG graph */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height: "auto", overflow: "visible" }}
        >
          <defs>
            <filter id="ag-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="ag-soft" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Animated dash offset for flowing edge effect */}
            <style>{`
              @keyframes ag-flow {
                from { stroke-dashoffset: 20; }
                to   { stroke-dashoffset: 0; }
              }
              .ag-edge-active { animation: ag-flow 1.2s linear infinite; }
            `}</style>
          </defs>

          {/* ── Edges ──────────────────────────────────────────────────── */}
          {edges.map(e => {
            const a = nodeMap[e.from], b = nodeMap[e.to];
            if (!a || !b) return null;
            const meta = ASPECT_META[e.kind];
            const isActive = activeEdgeIds.has(e.id);
            const isDimmed = someHovered && !isActive;

            if (e.isSpoke) {
              return (
                <line key={e.id}
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke="#ccc8c0"
                  strokeWidth="0.7"
                  strokeDasharray="2 5"
                  opacity={isDimmed ? 0.2 : 0.65}
                />
              );
            }

            return (
              <line
                key={e.id}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={meta.color}
                strokeWidth={
                  isActive ? (e.isPrimary ? 2.2 : 1.6) :
                  e.isPrimary ? 1.4 : 0.8
                }
                strokeDasharray={isActive ? meta.dash : meta.dash}
                strokeOpacity={
                  isDimmed ? 0.08 :
                  isActive ? 0.95 :
                  e.isPrimary ? 0.55 : 0.28
                }
                filter={isActive ? "url(#ag-glow)" : undefined}
                className={isActive ? "ag-edge-active" : undefined}
                style={{ transition: "stroke-opacity 0.2s, stroke-width 0.15s" }}
                onMouseEnter={() => !e.isSpoke && e.isPrimary && setTooltipEdge(e)}
                onMouseLeave={() => setTooltipEdge(null)}
              />
            );
          })}

          {/* ── Nodes ──────────────────────────────────────────────────── */}
          {nodes.map(n => {
            const isActive = hoveredId === n.id;
            const isConnected = connectedNodeIds.has(n.id);
            const isDimmed = someHovered && !isActive && !isConnected;
            const el = SIGN_ELEMENT[n.sign] ?? "air";
            const elHex = EL_HEX[el] ?? "#818cf8";
            const r = n.type === "hub" ? 21 : 13;
            const strokeColor = isActive || isConnected ? elHex : "#d4cfc8";

            return (
              <motion.g
                key={n.id}
                animate={{ y: [0, -n.floatAmp, 0] }}
                transition={{
                  duration: 3.2 + n.floatDelay,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: n.floatDelay * 0.7,
                }}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => { setHoveredId(n.id); setTooltipEdge(null); }}
                onMouseLeave={() => { setHoveredId(null); }}
              >
                {/* Halo ring when active */}
                {isActive && (
                  <motion.circle
                    cx={n.x} cy={n.y} r={r + 9}
                    fill={elHex} fillOpacity={0.07}
                    stroke={elHex} strokeOpacity={0.18} strokeWidth={0.8}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}

                {/* Node body */}
                <circle
                  cx={n.x} cy={n.y} r={r}
                  fill="#ffffff"
                  stroke={strokeColor}
                  strokeWidth={isActive ? 1.8 : 1}
                  opacity={isDimmed ? 0.3 : 1}
                  filter={isActive ? "url(#ag-soft)" : undefined}
                  style={{ transition: "stroke 0.2s, stroke-width 0.15s, opacity 0.2s" }}
                />

                {/* Inner ring on hub nodes */}
                {n.type === "hub" && (
                  <circle
                    cx={n.x} cy={n.y} r={r - 5}
                    fill="none"
                    stroke={isDimmed ? "#ede9e3" : "#e5e1db"}
                    strokeWidth="0.5"
                    style={{ transition: "stroke 0.2s" }}
                  />
                )}

                {/* Zodiac glyph for planet nodes */}
                {n.type === "planet" && n.sign && ZODIAC_PATHS[n.sign] && (
                  <ZodiacGlyph
                    sign={n.sign}
                    cx={n.x}
                    cy={n.y}
                    radius={r * 0.9}
                    color={isDimmed ? "#ccc8c0" : elHex}
                    dimmed={isDimmed}
                  />
                )}

                {/* Hub label (initials) */}
                {n.type === "hub" && (
                  <text
                    x={n.x} y={n.y + 1}
                    textAnchor="middle" dominantBaseline="central"
                    fill={isDimmed ? "#ccc8c0" : "#44403c"}
                    fontSize="9" fontWeight="600"
                    fontFamily="ui-serif, Georgia, serif"
                    style={{ pointerEvents: "none", userSelect: "none", transition: "fill 0.2s" }}
                  >
                    {n.label}
                  </text>
                )}

                {/* Sign label below planet node */}
                {n.type === "planet" && (
                  <text
                    x={n.x}
                    y={n.person === "self" ? n.y - r - 5 : n.y - r - 5}
                    textAnchor="middle"
                    fill={isDimmed ? "#d8d3cc" : "#a09890"}
                    fontSize="6.5"
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                    letterSpacing="0.04em"
                    style={{ pointerEvents: "none", userSelect: "none", transition: "fill 0.2s" }}
                  >
                    {n.sign}
                  </text>
                )}

                {/* Planet name label for self nodes (right of node) and other nodes (left) */}
                {n.type === "planet" && (
                  <text
                    x={n.person === "self" ? n.x + r + 4 : n.x - r - 4}
                    y={n.y + 1}
                    textAnchor={n.person === "self" ? "start" : "end"}
                    dominantBaseline="central"
                    fill={isDimmed ? "#d8d3cc" : "#78716c"}
                    fontSize="6.5"
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                    letterSpacing="0.08em"
                    style={{ pointerEvents: "none", userSelect: "none", transition: "fill 0.2s" }}
                  >
                    {n.label.toUpperCase()}
                  </text>
                )}
              </motion.g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-0 left-0 right-0 text-center pointer-events-none"
          >
            <span className="text-[10px] text-stone-400">{tooltip}</span>
          </motion.div>
        )}
      </div>

      {/* Hover hint */}
      {!hoveredId && !tooltip && (
        <p className="text-center text-[9px] text-stone-400 mt-1">
          Hover a node to see connections
        </p>
      )}

      {/* Aspect legend */}
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3">
        {(["conjunction", "trine", "sextile", "square", "opposition"] as AspectKind[]).map(k => (
          <div key={k} className="flex items-center gap-1.5">
            <svg width="14" height="4" style={{ overflow: "visible" }}>
              <line
                x1="0" y1="2" x2="14" y2="2"
                stroke={ASPECT_META[k].color}
                strokeWidth="1.5"
                strokeDasharray={ASPECT_META[k].dash}
              />
            </svg>
            <span className="text-[8px] text-stone-500 tracking-wide">
              {ASPECT_META[k].label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
