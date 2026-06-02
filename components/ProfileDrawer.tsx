"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Sparkles, AlertTriangle, Lock } from "lucide-react";
import Link from "next/link";
import { getZodiacColor } from "@/lib/zodiac-colors";
import { ZodiacIcon } from "@/components/ui/zodiac-icon";
import { AstroGraph } from "@/components/AstroGraph";
import { UpgradeModal } from "@/components/UpgradeModal";
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
    photos?: string[] | null;
  };
  otherAstro: {
    sunSign: string;
    moonSign: string;
    risingSign: string;
  };
  currentAstro?: {
    sunSign: string;
    moonSign: string;
    risingSign: string;
  };
}

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
  match: ProfileDrawerMatch | null;
  isPremium?: boolean | null;
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

export function ProfileDrawer({ open, onClose, match, isPremium }: ProfileDrawerProps) {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  useEffect(() => { setPhotoIdx(0); }, [match?.id]);
  if (!match) return null;

  const allPhotos = [
    match.otherUser.avatarUrl,
    ...(match.otherUser.photos ?? []),
  ].filter((url): url is string => Boolean(url));

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
              {/* Photo carousel */}
              <div className="relative shrink-0 overflow-hidden" style={{ height: 300 }}>
                {allPhotos.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={allPhotos[photoIdx]}
                    alt={match.otherUser.name}
                    className="w-full h-full object-cover object-top select-none"
                    draggable={false}
                  />
                ) : (
                  <div
                    className={cn(
                      "w-full h-full flex items-center justify-center text-6xl font-bold",
                      sunColor.bg,
                      sunColor.text
                    )}
                  >
                    {getInitials(match.otherUser.name)}
                  </div>
                )}

                {/* Top fade for indicators/close button legibility */}
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-stone-950/60 to-transparent pointer-events-none" />
                {/* Bottom fade for name legibility */}
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-stone-950 via-stone-950/55 to-transparent pointer-events-none" />

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white/80 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Story-style photo progress bars */}
                {allPhotos.length > 1 && (
                  <div className="absolute top-3 left-4 right-14 flex gap-1.5 pointer-events-none">
                    {allPhotos.map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex-1 h-[2px] rounded-full transition-colors duration-200",
                          i === photoIdx ? "bg-white" : "bg-white/30"
                        )}
                      />
                    ))}
                  </div>
                )}

                {/* Tap zones: left third = previous, right two-thirds = next */}
                {allPhotos.length > 1 && (
                  <>
                    <button
                      onClick={() => setPhotoIdx((p) => Math.max(0, p - 1))}
                      className="absolute left-0 top-0 bottom-0 w-1/3"
                      aria-label="Previous photo"
                    />
                    <button
                      onClick={() => setPhotoIdx((p) => Math.min(allPhotos.length - 1, p + 1))}
                      className="absolute right-0 top-0 bottom-0 w-2/3"
                      aria-label="Next photo"
                    />
                  </>
                )}

                {/* Name / location overlay */}
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 pointer-events-none">
                  <h2 className="font-serif text-2xl font-semibold text-white leading-tight">
                    {match.otherUser.name}, {age}
                  </h2>
                  <p className="text-white/60 text-sm mt-0.5">
                    {match.otherUser.birthCity}, {match.otherUser.birthCountry}
                  </p>
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

              {/* Synastry graph: StarCross+ only */}
              {isPremium !== false && match.currentAstro && (
                <div className="mx-6 mb-2 rounded-2xl bg-[#f7f4ef] px-4 py-4">
                  <AstroGraph
                    selfName="You"
                    otherName={match.otherUser.name}
                    self={match.currentAstro}
                    other={match.otherAstro}
                  />
                </div>
              )}

              {/* Divider */}
              <div className="h-px bg-white/6 mx-6 mb-5 mt-4" />

              {/* Compatibility */}
              <div className="px-6 pb-5 flex items-start gap-4">
                <ScoreArc score={match.matchScore} />
                {isPremium !== false ? (
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
                ) : (
                  <div className="flex-1 pt-1">
                    <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-3">
                      Compatibility
                    </p>
                    <button
                      onClick={() => setUpgradeOpen(true)}
                      className="w-full rounded-xl border border-indigo-500/20 bg-indigo-500/8 px-4 py-4 text-left hover:bg-indigo-500/12 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="h-3 w-3 text-indigo-400 shrink-0" />
                        <span className="text-indigo-300 text-xs font-medium tracking-wide">
                          StarCross+
                        </span>
                      </div>
                      <p className="text-stone-500 text-xs leading-relaxed">
                        Unlock the full elemental breakdown, synastry chart, and what makes this connection tick.
                      </p>
                      <span className="mt-3 inline-block text-[10px] text-indigo-400 font-medium tracking-wide">
                        Upgrade to see →
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Explanation, always visible */}
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

              {/* Strengths: StarCross+ only */}
              {isPremium !== false && match.strengths.length > 0 && (
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

              {/* Friction: StarCross+ only */}
              {isPremium !== false && match.frictionPoints.length > 0 && (
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
              {isPremium !== false ? (
                <Link
                  href={`/messages/${match.id}`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-full py-3.5 transition-colors text-sm shadow-lg shadow-indigo-500/20"
                >
                  <MessageCircle className="h-4 w-4" />
                  Send a Message
                </Link>
              ) : (
                <button
                  onClick={() => setUpgradeOpen(true)}
                  className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-full py-3.5 transition-colors text-sm shadow-lg shadow-indigo-500/20"
                >
                  <Lock className="h-4 w-4" />
                  Unlock messaging: StarCross+
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature="synastry"
      />
    </AnimatePresence>
  );
}
