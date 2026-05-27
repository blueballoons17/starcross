"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { CompatibilityModal } from "@/components/CompatibilityModal";
import { getZodiacColor, ZODIAC_SYMBOLS } from "@/lib/zodiac-colors";
import { cn } from "@/lib/utils";

interface MatchCardProps {
  match: {
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
    currentAstro: {
      sunSign: string;
      moonSign: string;
      risingSign: string;
    };
  };
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
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const gradId = `score-grad-${score}`;
  const color = score >= 70 ? "#f59e0b" : score >= 50 ? "#7c3aed" : "#64748b";

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg width="64" height="64" className="-rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={score >= 70 ? "#fbbf24" : score >= 50 ? "#6366f1" : "#94a3b8"} />
          </linearGradient>
        </defs>
        <circle
          cx="32" cy="32" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="4"
        />
        <circle
          cx="32" cy="32" r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-white">{score}</span>
        <span className="text-[9px] text-slate-400 -mt-0.5">%</span>
      </div>
    </div>
  );
}

export function MatchCard({ match }: MatchCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const age = getAge(match.otherUser.birthDate);
  const sunColor = getZodiacColor(match.otherAstro.sunSign);
  const firstStrength = match.strengths[0] ?? "";

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="text-left w-full group"
      >
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/8 hover:border-white/20 transition-all duration-200 hover:shadow-xl hover:shadow-violet-900/20">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="relative shrink-0">
              {match.otherUser.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={match.otherUser.avatarUrl}
                  alt={match.otherUser.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-bold">
                  {getInitials(match.otherUser.name)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-white truncate">
                    {match.otherUser.name}, {age}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {match.otherUser.birthCity}, {match.otherUser.birthCountry}
                  </p>
                </div>
                <ScoreRing score={match.matchScore} />
              </div>

              {/* Sun sign badge */}
              <div className="mt-2 flex flex-wrap gap-1">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border",
                    sunColor.bg, sunColor.text, sunColor.border
                  )}
                >
                  {ZODIAC_SYMBOLS[match.otherAstro.sunSign]} {match.otherAstro.sunSign}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border border-white/10 bg-white/5 text-slate-400">
                  {ZODIAC_SYMBOLS[match.otherAstro.moonSign]} {match.otherAstro.moonSign} Moon
                </span>
              </div>

              {/* Strength preview */}
              {firstStrength && (
                <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  <Star className="h-3 w-3 text-violet-400 inline mr-1" />
                  {firstStrength}
                </p>
              )}
            </div>
          </div>
        </div>
      </button>

      <CompatibilityModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        match={match}
      />
    </>
  );
}
