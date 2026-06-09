"use client";

import React, { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { Heart, X, Star, MapPin, ChevronDown } from "lucide-react";
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
  isSubscribed?: boolean;
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

// Full-screen profile detail modal
function ProfileDetailModal({
  candidate,
  open,
  onClose,
  onLike,
  onPass,
}: {
  candidate: Candidate;
  open: boolean;
  onClose: () => void;
  onLike: () => void;
  onPass: () => void;
}) {
  const age = getAge(candidate.profile.birthDate);
  const astro = candidate.astrologyProfile;
  const sunColor = getZodiacColor(astro.sunSign);

  let interests: string[] = [];
  try {
    if (candidate.profile.interests) interests = JSON.parse(candidate.profile.interests);
  } catch { /* ignore */ }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl overflow-hidden"
            style={{ maxHeight: "92dvh" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-stone-200" />
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: "calc(92dvh - 20px)" }}>
              {/* Photo */}
              <div className={cn(
                "relative w-full flex items-center justify-center overflow-hidden",
                candidate.profile.avatarUrl ? "" : sunColor.bg
              )} style={{ height: 300 }}>
                {candidate.profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={candidate.profile.avatarUrl}
                    alt={candidate.profile.name}
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                      {getInitials(candidate.profile.name)}
                    </div>
                  </div>
                )}
                {/* Match score */}
                <div className="absolute top-4 right-4">
                  <div className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm",
                    getScoreBadgeClass(candidate.matchScore)
                  )}>
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {candidate.matchScore}%
                  </div>
                </div>
                {/* Close */}
                <button
                  onClick={onClose}
                  className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-stone-600 shadow"
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 space-y-5 pb-28">
                {/* Name / location */}
                <div>
                  <h2 className="text-2xl font-bold text-stone-900">
                    {candidate.profile.name}, {age}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1 text-stone-400 text-sm">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{candidate.profile.birthCity}, {candidate.profile.birthCountry}</span>
                  </div>
                </div>

                {/* Zodiac badges */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { sign: astro.sunSign, label: "☀️ Sun" },
                    { sign: astro.moonSign, label: "🌙 Moon" },
                    { sign: astro.risingSign, label: "⬆️ Rising" },
                  ].map(({ sign, label }) => {
                    const colors = getZodiacColor(sign);
                    return (
                      <span
                        key={label}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border",
                          colors.bg, colors.text, colors.border
                        )}
                      >
                        <ZodiacIcon sign={sign} size={16} className="bg-transparent border-0" />
                        <span>{label}: {sign}</span>
                      </span>
                    );
                  })}
                </div>

                {/* Bio */}
                {candidate.profile.bio && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">About</h3>
                    <p className="text-stone-700 text-sm leading-relaxed">{candidate.profile.bio}</p>
                  </div>
                )}

                {/* Interests */}
                {interests.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {interests.map((tag) => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-sm border border-stone-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Personality traits */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Personality</h3>
                  <div className="space-y-2">
                    {[
                      { label: "Emotionally", value: astro.traits.emotionalStyle },
                      { label: "Communicates", value: astro.traits.communicationStyle },
                      { label: "Needs", value: astro.traits.relationshipNeeds },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex gap-3 text-sm">
                        <span className="text-stone-400 flex-shrink-0 w-24">{label}</span>
                        <span className="text-stone-700">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons fixed at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-stone-100 flex justify-center gap-6">
              <button
                onClick={() => { onPass(); onClose(); }}
                className="w-14 h-14 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 hover:border-red-200 hover:text-red-400 transition-all shadow-sm"
              >
                <X className="h-6 w-6" />
              </button>
              <button
                onClick={() => { onLike(); onClose(); }}
                className="w-14 h-14 rounded-full bg-stone-900 flex items-center justify-center text-white hover:bg-stone-800 transition-all shadow-md"
              >
                <Heart className="h-6 w-6 fill-current" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ProfileCard({
  candidate,
  isTop,
  onLike,
  onPass,
  onOpenDetail,
}: {
  candidate: Candidate;
  isTop: boolean;
  onLike: () => void;
  onPass: () => void;
  onOpenDetail: () => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, -20], [1, 0]);
  const cardOpacity = useTransform(x, [-300, -200, 0, 200, 300], [0, 1, 1, 1, 0]);

  const age = getAge(candidate.profile.birthDate);
  const astro = candidate.astrologyProfile;
  const sunColor = getZodiacColor(astro.sunSign);

  let interests: string[] = [];
  try {
    if (candidate.profile.interests) interests = JSON.parse(candidate.profile.interests);
  } catch { /* ignore */ }

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
      <div className="relative h-full rounded-3xl overflow-hidden bg-white border border-stone-100 shadow-xl shadow-stone-200/80 select-none flex flex-col">
        {/* Avatar area, fixed height */}
        <div className={cn(
          "relative flex-shrink-0 flex items-center justify-center overflow-hidden",
          candidate.profile.avatarUrl ? "" : sunColor.bg
        )} style={{ height: 260 }}>
          {candidate.profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={candidate.profile.avatarUrl}
              alt={candidate.profile.name}
              className="w-full h-full object-cover"
              loading="eager"
              decoding="async"
            />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                {getInitials(candidate.profile.name)}
              </div>
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

        {/* Scrollable info area */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{ touchAction: "pan-y" }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="p-4 pb-20 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  {candidate.profile.name}, {age}
                </h2>
                <div className="flex items-center gap-1 mt-0.5 text-stone-400 text-xs">
                  <MapPin className="h-3 w-3" />
                  <span>{candidate.profile.birthCity}, {candidate.profile.birthCountry}</span>
                </div>
              </div>
              {/* "See full profile" hint */}
              <button
                className="flex-shrink-0 text-xs text-indigo-400 hover:text-indigo-600 underline underline-offset-2 mt-1"
                onClick={onOpenDetail}
              >
                Full profile
              </button>
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
                    <ZodiacIcon sign={sign} size={13} className="bg-transparent border-0" />
                    <span>{label}: {sign}</span>
                  </span>
                );
              })}
            </div>

            {/* Bio, full, no truncation */}
            {candidate.profile.bio && (
              <p className="text-stone-600 text-sm leading-relaxed">{candidate.profile.bio}</p>
            )}

            {/* Interests, all shown */}
            {interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {interests.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-xs border border-stone-200">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Traits */}
            <div className="border-t border-stone-100 pt-3 space-y-1.5">
              {[
                { label: "Emotionally", value: astro.traits.emotionalStyle },
                { label: "Communicates", value: astro.traits.communicationStyle },
                { label: "Needs", value: astro.traits.relationshipNeeds },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-2 text-xs">
                  <span className="text-stone-400 flex-shrink-0 w-20">{label}</span>
                  <span className="text-stone-600 line-clamp-2">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons, always visible at card bottom */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-6 pointer-events-none">
          <button
            onClick={onPass}
            className="w-14 h-14 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 hover:border-red-200 hover:text-red-400 transition-all shadow-md pointer-events-auto"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            onClick={onLike}
            className="w-14 h-14 rounded-full bg-stone-900 flex items-center justify-center text-white hover:bg-stone-800 transition-all shadow-md pointer-events-auto"
          >
            <Heart className="h-6 w-6 fill-current" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function SwipeDeck({ candidates, onLike, onPass, isSubscribed = false }: SwipeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [detailCandidate, setDetailCandidate] = useState<Candidate | null>(null);

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
    // Free-tier upgrade prompt
    if (!isSubscribed) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center gap-5 py-16 px-6">
          <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-400/30 flex items-center justify-center">
            <Star className="h-10 w-10 text-indigo-300" />
          </div>
          <div>
            <p className="text-xs tracking-[0.18em] uppercase text-indigo-400 mb-2" style={{ fontFamily: "var(--font-inter)" }}>
              Free plan
            </p>
            <h3 className="text-xl font-semibold text-white mb-2">
              You&apos;ve seen your 5 free matches
            </h3>
            <p className="text-white/60 text-sm max-w-xs mb-6">
              Upgrade to Kindred Stars+ to unlock unlimited suggestions, see who liked you, and find your cosmic match.
            </p>
            <a
              href="/pricing"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-6 py-3 rounded-2xl transition-colors shadow-lg shadow-indigo-500/20"
            >
              <Star className="h-4 w-4" />
              Upgrade to Kindred Stars+
            </a>
          </div>
        </div>
      );
    }

    // Paid user — seen everyone
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-20">
        <div className="w-20 h-20 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center">
          <Star className="h-10 w-10 text-stone-300" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {"You've seen everyone for now"}
          </h3>
          <p className="text-white/70 text-sm max-w-xs mb-3">
            Check back soon as new members join the constellation.
          </p>
          <p className="text-white/80 text-sm max-w-xs">
            ✨ We&apos;ll email you as soon as a new match is found for you.
          </p>
        </div>
      </div>
    );
  }

  const totalCards = candidates.length;
  const seen = currentIndex;
  const progressPct = totalCards > 0 ? (seen / totalCards) * 100 : 0;

  return (
    <>
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

        <div className="relative w-full" style={{ height: "min(660px, calc(100dvh - 220px))" }}>
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
                  onOpenDetail={() => setDetailCandidate(candidate)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Full profile detail modal */}
      {detailCandidate && (
        <ProfileDetailModal
          candidate={detailCandidate}
          open={!!detailCandidate}
          onClose={() => setDetailCandidate(null)}
          onLike={handleLike}
          onPass={handlePass}
        />
      )}
    </>
  );
}
