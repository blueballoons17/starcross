"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Sparkles, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { getZodiacColor } from "@/lib/zodiac-colors";
import { ZodiacIcon } from "@/components/ui/zodiac-icon";
import { cn } from "@/lib/utils";

export interface ProfileDrawerMatch {
  id: string;
  matchScore: number;
  breakdown: {
    elemental: number;
    emotional: number;
    communication: number;
    stability: number;
  };
  explanation: string;
  strengths: string[];
  frictionPoints: string[];
  otherUser: {
    name: string;
    birthDate: string;
    birthCity: string;
    birthCountry: string;
    avatarUrl?: string | null;
  };
  otherAstro: {
    sunSign: string;
    moonSign: string;
    risingSign: string;
  };
}

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
  match: ProfileDrawerMatch | null;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAge(birthDateStr: string): number {
  const birth = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function ScoreArc({ score }: { score: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const arcColor =
    score >= 80 ? "#fbbf24" : score >= 65 ? "#a78bfa" : "#6b7280";
  return (
    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
      <svg width="96" height="96" className="-rotate-90">
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="5"
        />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke={arcColor}
          strokeWidth="5"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0">
        <span className="text-2xl font-bold text-white leading-none">{score}</span>
        <span className="text-[10px] text-stone-400 tracking-wide">% match</span>
      </div>
    </div>
  );
}

function BreakdownBar({
  label,
  value,
  arcColor,
}: {
  label: string;
  value: number;
  arcColor: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-stone-500">{label}</span>
        <span className="text-stone-300 font-medium">{value}%</span>
      </div>
      <div className="h-1 rounded-full bg-white/8 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: arcColor }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </div>
  );
}

export function ProfileDrawer({ open, onClose, match }: ProfileDrawerProps) {
  if (!match) return null;

  const sunColor = getZodiacColor(match.otherAstro.sunSign);
  const moonColor = getZodiacColor(match.otherAstro.moonSign);
  const risingColor = getZodiacColor(match.otherAstro.risingSign);
  const age = getAge(match.otherUser.birthDate);
  const arcColor =
    match.matchScore >= 80
      ? "#fbbf24"
      : match.matchScore >= 65
      ? "#a78bfa"
      : "#6b7280";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-stone-950/65 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-sm flex flex-col bg-stone-950 border-l border-white/8 shadow-2xl overflow-hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Header with gradient glow */}
              <div
                className="relative px-6 pt-10 pb-6 shrink-0"
                style={{
                  background: `radial-gradient(ellipse 130% 90% at 50% 0%, ${arcColor}1a 0%, transparent 65%)`,
                }}
              >
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/12 text-stone-400 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Avatar */}
                <div className="flex flex-col items-center gap-4">
                  {match.otherUser.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={match.otherUser.avatarUrl}
                      alt={match.otherUser.name}
                      className="w-20 h-20 rounded-full object-cover ring-2 ring-white/20 shadow-xl"
                    />
                  ) : (
                    <div
                      className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ring-2 ring-white/20 shadow-xl",
                        sunColor.bg,
                        sunColor.text
                      )}
                    >
                      {getInitials(match.otherUser.name)}
                    </div>
                  )}

                  <div className="text-center">
                    <h2 className="font-serif text-2xl font-semibold text-white">
                      {match.otherUser.name}, {age}
                    </h2>
                    <p className="text-stone-400 text-sm mt-0.5">
                      {match.otherUser.birthCity}, {match.otherUser.birthCountry}
                    </p>
                  </div>
                </div>
              </div>

              {/* Signs trinity */}
              <div className="px-6 pb-5">
                <div className="flex flex-wrap justify-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border",
                      sunColor.bg,
                      sunColor.text,
                      sunColor.border
                    )}
                  >
                    <ZodiacIcon
                      sign={match.otherAstro.sunSign}
                      size={13}
                      className="bg-transparent border-0"
                    />
                    <span className="opacity-55 text-[9px] uppercase tracking-wider">☉</span>
                    {match.otherAstro.sunSign}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border",
                      moonColor.bg,
                      moonColor.text,
                      moonColor.border
                    )}
                  >
                    <ZodiacIcon
                      sign={match.otherAstro.moonSign}
                      size={13}
                      className="bg-transparent border-0"
                    />
                    <span className="opacity-55 text-[9px] uppercase tracking-wider">☽</span>
                    {match.otherAstro.moonSign}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border",
                      risingColor.bg,
                      risingColor.text,
                      risingColor.border
                    )}
                  >
                    <ZodiacIcon
                      sign={match.otherAstro.risingSign}
                      size={13}
                      className="bg-transparent border-0"
                    />
                    <span className="opacity-55 text-[9px] uppercase tracking-wider">↑</span>
                    {match.otherAstro.risingSign}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/6 mx-6 mb-5" />

              {/* Compatibility */}
              <div className="px-6 pb-5 flex items-start gap-4">
                <ScoreArc score={match.matchScore} />
                <div className="flex-1 space-y-2.5 pt-1">
                  <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-3">
                    Compatibility
                  </p>
                  <BreakdownBar
                    label="Elemental"
                    value={match.breakdown.elemental}
                    arcColor={arcColor}
                  />
                  <BreakdownBar
                    label="Emotional"
                    value={match.breakdown.emotional}
                    arcColor={arcColor}
                  />
                  <BreakdownBar
                    label="Communication"
                    value={match.breakdown.communication}
                    arcColor={arcColor}
                  />
                  <BreakdownBar
                    label="Stability"
                    value={match.breakdown.stability}
                    arcColor={arcColor}
                  />
                </div>
              </div>

              {/* Explanation */}
              {match.explanation && (
                <div className="px-6 pb-5">
                  <div className="h-px bg-white/6 mb-5" />
                  <p
                    className="text-stone-400 text-sm leading-relaxed pl-3"
                    style={{ borderLeft: `2px solid ${arcColor}55` }}
                  >
                    {match.explanation}
                  </p>
                </div>
              )}

              {/* Strengths */}
              {match.strengths.length > 0 && (
                <div className="px-6 pb-4">
                  <h4 className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <Sparkles className="h-3 w-3 text-emerald-400" />
                    Why This Works
                  </h4>
                  <div className="space-y-2">
                    {match.strengths.map((s, i) => (
                      <div
                        key={i}
                        className="flex gap-2.5 bg-emerald-500/8 rounded-xl px-3 py-2.5 border border-emerald-500/15"
                      >
                        <span className="text-emerald-400 shrink-0 text-xs mt-0.5">✦</span>
                        <p className="text-stone-300 text-xs leading-relaxed">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Friction */}
              {match.frictionPoints.length > 0 && (
                <div className="px-6 pb-8">
                  <h4 className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <AlertTriangle className="h-3 w-3 text-amber-400" />
                    Navigate With Awareness
                  </h4>
                  <div className="space-y-2">
                    {match.frictionPoints.map((f, i) => (
                      <div
                        key={i}
                        className="flex gap-2.5 bg-amber-500/8 rounded-xl px-3 py-2.5 border border-amber-500/15"
                      >
                        <span className="text-amber-400 shrink-0 text-xs mt-0.5">△</span>
                        <p className="text-stone-400 text-xs leading-relaxed">{f}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky CTA */}
            <div className="shrink-0 px-6 py-4 bg-stone-950/90 backdrop-blur-sm border-t border-white/8">
              <Link
                href={`/messages/${match.id}`}
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-full py-3.5 transition-colors text-sm shadow-lg shadow-indigo-500/20"
              >
                <MessageCircle className="h-4 w-4" />
                Send a Message
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
