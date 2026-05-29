"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Network } from "lucide-react";
import { ProfileDrawer } from "@/components/ProfileDrawer";
import type { ProfileDrawerMatch } from "@/components/ProfileDrawer";
import { getZodiacColor } from "@/lib/zodiac-colors";
import { ZodiacIcon } from "@/components/ui/zodiac-icon";
import { cn } from "@/lib/utils";

interface MatchCardProps {
  match: ProfileDrawerMatch;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function getAge(birthDateStr: string): number {
  const birth = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const gradId = `sr-${score}`;
  const [c1, c2] =
    score >= 80
      ? ["#d97706", "#fbbf24"]
      : score >= 65
      ? ["#7c3aed", "#a78bfa"]
      : ["#4b5563", "#9ca3af"];

  return (
    <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
      <svg width="56" height="56" className="-rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
        </defs>
        <circle
          cx="28" cy="28" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="3.5"
        />
        <circle
          cx="28" cy="28" r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-sm font-bold text-white">{score}</span>
        <span className="text-[8px] text-stone-500">%</span>
      </div>
    </div>
  );
}

export function MatchCard({ match }: MatchCardProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const age = getAge(match.otherUser.birthDate);
  const sunColor = getZodiacColor(match.otherAstro.sunSign);
  const moonColor = getZodiacColor(match.otherAstro.moonSign);

  return (
    <>
      <div className="group bg-stone-900/55 backdrop-blur-md rounded-2xl border border-white/8 hover:border-white/16 hover:bg-stone-900/75 transition-all duration-200 overflow-hidden shadow-sm">
        {/* Top area — opens profile drawer */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="text-left w-full p-5"
          aria-label={`View ${match.otherUser.name}'s profile`}
        >
          <div className="flex items-start gap-3.5">
            {/* Avatar */}
            <div className="relative shrink-0">
              {match.otherUser.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={match.otherUser.avatarUrl}
                  alt={match.otherUser.name}
                  className="w-14 h-14 rounded-full object-cover ring-1 ring-white/15"
                />
              ) : (
                <div
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center text-base font-bold ring-1 ring-white/15",
                    sunColor.bg,
                    sunColor.text
                  )}
                >
                  {getInitials(match.otherUser.name)}
                </div>
              )}
              {/* Sun sign dot badge */}
              <div
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-stone-900 flex items-center justify-center",
                  sunColor.bg
                )}
              >
                <ZodiacIcon
                  sign={match.otherAstro.sunSign}
                  size={11}
                  className="bg-transparent border-0"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-white truncate text-sm">
                    {match.otherUser.name}, {age}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5 truncate">
                    {match.otherUser.birthCity}, {match.otherUser.birthCountry}
                  </p>
                </div>
                <ScoreRing score={match.matchScore} />
              </div>

              {/* Sign badges */}
              <div className="mt-2.5 flex flex-wrap gap-1">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border",
                    sunColor.bg, sunColor.text, sunColor.border
                  )}
                >
                  <ZodiacIcon sign={match.otherAstro.sunSign} size={12} className="bg-transparent border-0" />
                  {match.otherAstro.sunSign}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border",
                    moonColor.bg, moonColor.text, moonColor.border
                  )}
                >
                  <ZodiacIcon sign={match.otherAstro.moonSign} size={12} className="bg-transparent border-0" />
                  {match.otherAstro.moonSign}
                  <span className="opacity-50 text-[9px]">Moon</span>
                </span>
              </div>

              {/* First strength hint */}
              {match.strengths[0] && (
                <p className="mt-2 text-[11px] text-stone-500 line-clamp-1 leading-relaxed">
                  ✦ {match.strengths[0]}
                </p>
              )}
            </div>
          </div>
        </button>

        {/* Action row */}
        <div className="flex items-center gap-2 px-5 pb-4">
          <Link
            href={`/messages/${match.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-sm shadow-indigo-500/20"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Message
          </Link>
          <Link
            href={`/matches/${match.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/12 text-stone-400 hover:text-white hover:border-white/25 hover:bg-white/5 text-xs font-semibold transition-all"
          >
            <Network className="h-3.5 w-3.5" />
            Synastry Chart
          </Link>
        </div>
      </div>

      <ProfileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        match={match}
      />
    </>
  );
}
