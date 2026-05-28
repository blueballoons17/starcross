"use client";

import React, { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { Heart, X, Star } from "lucide-react";
import { getZodiacColor } from "@/lib/zodiac-colors";
import { ZodiacIcon } from "@/components/ui/zodiac-icon";
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
    interests?: string | null;
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

function getScoreBadgeClass(score: number) {
  if (score >= 70) return "bg-amber-50 text-amber-700 border border-amber-200";
  if (score >= 50) return "bg-stone-100 text-stone-700 border border-stone-200";
  return "bg-stone-50 text-stone-500 border border-stone-200";
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

  // Truncate bio/trait to a readable blurb
  const blurb = candidate.profile.bio
    ? candidate.profile.bio.slice(0, 160) + (candidate.profile.bio.length > 160 ? "…" : "")
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
      <div className="absolute inset-0 rounded-3xl bg-stone-50 border border-stone-100 scale-95 opacity-60 pointer-events-none" />
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
      <div className="relative h-full rounded-3xl overflow-hidden bg-white border border-stone-100 shadow-xl shadow-stone-200/80 select-none">
        {/* Avatar area — tinted with the person's sun-sign colour */}
        <div className={cn(
          "relative h-[55%] flex items-center justify-center overflow-hidden",
          candidate.profile.avatarUrl ? "" : sunColor.bg
        )}>
          {candidate.profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={candidate.profile.avatarUrl}
              alt={candidate.profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                {getInitials(candidate.profile.name)}
              </div>
              {/* Big zodiac icon as decoration */}
              <div className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
                sunColor.bg, sunColor.text, sunColor.border
              )}>
                <ZodiacIcon sign={astro.sunSign} size={14} className="bg-transparent border-0" />
                {astro.sunSign}
              </div>
            </div>
          )}

          {/* Match score badge */}
          <div className="absolute top-4 right-4">
            <div className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm",
              getScoreBadgeClass(candidate.matchScore)
            )}>
              <Star className="h-3.5 w-3.5 fill-current" />
              {candidate.matchScore}%
            </div>
          </div>

          {/* Like overlay */}
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute inset-0 bg-emerald-400/10 flex items-center justify-center pointer-events-none"
          >
            <div className="border-4 border-emerald-500 text-emerald-600 rounded-xl px-4 py-2 rotate-[-15deg] text-3xl font-black tracking-widest">
              LIKE
            </div>
          </motion.div>

          {/* Pass overlay */}
          <motion.div
            style={{ opacity: passOpacity }}
            className="absolute inset-0 bg-red-400/10 flex items-center justify-center pointer-events-none"
          >
            <div className="border-4 border-red-400 text-red-500 rounded-xl px-4 py-2 rotate-[15deg] text-3xl font-black tracking-widest">
              PASS
            </div>
          </motion.div>
        </div>

        {/* Info area — pb-24 leaves room for absolute-positioned action buttons */}
        <div className="p-5 pb-24 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                {candidate.profile.name}, {age}
              </h2>
              <p className="text-stone-400 text-sm">
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
                  <ZodiacIcon sign={sign} size={15} className="bg-transparent border-0" />
                  <span>{label}: {sign}</span>
                </span>
              );
            })}
          </div>

          {/* Bio blurb */}
          <p className="text-stone-500 text-sm leading-relaxed line-clamp-3">{blurb}</p>

          {/* Interests */}
          {candidate.profile.interests && (() => {
            try {
              const tags: string[] = JSON.parse(candidate.profile.interests);
              if (tags.length > 0) {
                return (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.slice(0, 6).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-xs border border-stone-200">
                        {tag}
                      </span>
                    ))}
                    {tags.length > 6 && (
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-400 text-xs border border-stone-200">
                        +{tags.length - 6}
                      </span>
                    )}
                  </div>
                );
              }
            } catch { /* ignore parse errors */ }
            return null;
          })()}
        </div>

        {/* Action buttons — floated at card bottom, above the info padding gap */}
        <div className="absolute bottom-5 left-0 right-0 flex justify-center items-center gap-6">
          <button
            onClick={onPass}
            className="w-14 h-14 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 hover:border-red-200 hover:text-red-400 transition-all shadow-sm"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            onClick={onLike}
            className="w-14 h-14 rounded-full bg-stone-900 flex items-center justify-center text-white hover:bg-stone-800 transition-all shadow-md"
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
        <div className="w-20 h-20 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center">
          <Star className="h-10 w-10 text-stone-300" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-stone-900 mb-2">
            {"You've seen everyone for now"}
          </h3>
          <p className="text-stone-500 text-sm max-w-xs">
            Check back soon as new members join the constellation.
          </p>
        </div>
      </div>
    );
  }

  const totalCards = candidates.length;
  const seen = currentIndex;
  const progressPct = totalCards > 0 ? (seen / totalCards) * 100 : 0;

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-stone-400 mb-1.5">
          <span>{remaining.length} profile{remaining.length !== 1 ? "s" : ""} left</span>
          <span>{seen} seen</span>
        </div>
        <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-stone-700 to-stone-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="relative w-full" style={{ height: "580px" }}>
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
    </div>
  );
}
