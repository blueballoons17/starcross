"use client";

import React, { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { Heart, X, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getZodiacColor, ZODIAC_SYMBOLS } from "@/lib/zodiac-colors";
import { cn } from "@/lib/utils";

interface Candidate {
  id: string;
  profile: {
    name: string;
    birthDate: string;
    avatarUrl?: string | null;
    bio?: string | null;
    gender?: string | null;
    birthCity: string;
    birthCountry: string;
  };
  astrologyProfile: {
    sunSign: string;
    moonSign: string;
    risingSign: string;
    traits: {
      emotionalStyle: string;
      communicationStyle: string;
      relationshipNeeds: string;
    };
  };
  matchScore: number;
}

interface SwipeDeckProps {
  candidates: Candidate[];
  onLike: (id: string) => Promise<void>;
  onPass: (id: string) => Promise<void>;
}

function getAge(birthDateStr: string): number {
  const birth = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getScoreColor(score: number) {
  if (score >= 70) return "from-amber-500 to-yellow-400";
  if (score >= 50) return "from-violet-600 to-indigo-500";
  return "from-slate-500 to-slate-400";
}

function ProfileCard({
  candidate,
  isTop,
  onLike,
  onPass,
}: {
  candidate: Candidate;
  isTop: boolean;
  onLike: () => void;
  onPass: () => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, -20], [1, 0]);
  const cardOpacity = useTransform(x, [-300, -200, 0, 200, 300], [0, 1, 1, 1, 0]);

  const age = getAge(candidate.profile.birthDate);
  const astro = candidate.astrologyProfile;
  const sunColor = getZodiacColor(astro.sunSign);

  // Truncate bio/trait to short blurb
  const blurb = candidate.profile.bio
    ? candidate.profile.bio.slice(0, 100) + (candidate.profile.bio.length > 100 ? "…" : "")
    : astro.traits.emotionalStyle.split(".")[0] + ".";

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (info.offset.x > 100) {
      onLike();
    } else if (info.offset.x < -100) {
      onPass();
    }
  }

  if (!isTop) {
    return (
      <div className="absolute inset-0 rounded-3xl bg-white/5 border border-white/10 scale-95 opacity-60 pointer-events-none" />
    );
  }

  return (
    <motion.div
      style={{ x, rotate, opacity: cardOpacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
    >
      <div className="relative h-full rounded-3xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 shadow-2xl select-none">
        {/* Avatar area */}
        <div className="relative h-3/5 bg-gradient-to-br from-violet-950 via-indigo-950 to-slate-950 flex items-center justify-center overflow-hidden">
          {candidate.profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={candidate.profile.avatarUrl}
              alt={candidate.profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className={cn(
                "w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-2xl",
                "bg-gradient-to-br from-violet-600 to-indigo-700"
              )}
            >
              {getInitials(candidate.profile.name)}
            </div>
          )}

          {/* Match score badge */}
          <div className="absolute top-4 right-4">
            <div
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold text-white shadow-lg",
                "bg-gradient-to-r",
                getScoreColor(candidate.matchScore)
              )}
            >
              <Star className="h-3.5 w-3.5 fill-current" />
              {candidate.matchScore}%
            </div>
          </div>

          {/* Like/Pass overlays */}
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center pointer-events-none"
          >
            <div className="border-4 border-emerald-400 text-emerald-400 rounded-xl px-4 py-2 rotate-[-15deg] text-3xl font-black tracking-widest">
              LIKE
            </div>
          </motion.div>

          <motion.div
            style={{ opacity: passOpacity }}
            className="absolute inset-0 bg-red-500/20 flex items-center justify-center pointer-events-none"
          >
            <div className="border-4 border-red-400 text-red-400 rounded-xl px-4 py-2 rotate-[15deg] text-3xl font-black tracking-widest">
              PASS
            </div>
          </motion.div>
        </div>

        {/* Info area */}
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {candidate.profile.name}, {age}
              </h2>
              <p className="text-slate-400 text-sm">
                {candidate.profile.birthCity}, {candidate.profile.birthCountry}
              </p>
            </div>
          </div>

          {/* Zodiac badges */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { sign: astro.sunSign, label: "Sun" },
              { sign: astro.moonSign, label: "Moon" },
              { sign: astro.risingSign, label: "Rising" },
            ].map(({ sign, label }) => {
              const colors = getZodiacColor(sign);
              return (
                <span
                  key={label}
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border",
                    colors.bg, colors.text, colors.border
                  )}
                >
                  <span>{ZODIAC_SYMBOLS[sign]}</span>
                  <span>{label}: {sign}</span>
                </span>
              );
            })}
          </div>

          {/* Bio blurb */}
          <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">{blurb}</p>
        </div>

        {/* Action buttons */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6">
          <button
            onClick={onPass}
            className="w-14 h-14 rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:border-red-500/30 transition-all shadow-lg"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            onClick={onLike}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-900/50"
          >
            <Heart className="h-6 w-6 fill-current" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function SwipeDeck({ candidates, onLike, onPass }: SwipeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const remaining = candidates.slice(currentIndex);

  async function handleLike() {
    if (swiping || currentIndex >= candidates.length) return;
    setSwiping(true);
    const candidate = candidates[currentIndex];
    await onLike(candidate.id);
    setCurrentIndex((i) => i + 1);
    setSwiping(false);
  }

  async function handlePass() {
    if (swiping || currentIndex >= candidates.length) return;
    setSwiping(true);
    const candidate = candidates[currentIndex];
    await onPass(candidate.id);
    setCurrentIndex((i) => i + 1);
    setSwiping(false);
  }

  if (remaining.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-20">
        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <Star className="h-10 w-10 text-violet-400/50" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {"You've seen everyone for now"}
          </h3>
          <p className="text-slate-400 text-sm max-w-xs">
            Check back soon as new members join the constellation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-sm mx-auto" style={{ height: "560px" }}>
      <AnimatePresence mode="popLayout">
        {remaining.slice(0, 3).map((candidate, stackIndex) => (
          <motion.div
            key={candidate.id}
            className="absolute inset-0"
            style={{ zIndex: remaining.length - stackIndex }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
              scale: stackIndex === 0 ? 1 : 0.95 - stackIndex * 0.02,
              opacity: stackIndex === 0 ? 1 : 0.7 - stackIndex * 0.15,
              y: stackIndex * 8,
            }}
            exit={{ x: 300, opacity: 0, transition: { duration: 0.3 } }}
          >
            <ProfileCard
              candidate={candidate}
              isTop={stackIndex === 0}
              onLike={handleLike}
              onPass={handlePass}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
