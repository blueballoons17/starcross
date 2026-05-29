"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, MessageCircle } from "lucide-react";
import { CompatibilityModal } from "@/components/CompatibilityModal";
import { getZodiacColor } from "@/lib/zodiac-colors";
import { ZodiacIcon } from "@/components/ui/zodiac-icon";
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
  const color = score >= 70 ? "#92400e" : score >= 50 ? "#44403c" : "#a8a29e";
  const colorEnd = score >= 70 ? "#b45309" : score >= 50 ? "#78716c" : "#d6d3d1";

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg width="64" height="64" className="-rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={colorEnd} />
          </linearGradient>
        </defs>
        <circle
          cx="32" cy="32" r={radius}
          fill="none"
          stroke="rgba(28,25,23,0.06)"
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
        <span className="text-sm font-bold text-stone-900">{score}</span>
        <span className="text-[9px] text-stone-400 -mt-0.5">%</span>
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
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        {/* Top clickable area → compatibility modal */}
        <button
          onClick={() => setModalOpen(true)}
          className="text-left w-full p-5 group"
        >
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
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center text-white font-bold">
                  {getInitials(match.otherUser.name)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-stone-900 truncate">
                    {match.otherUser.name}, {age}
                  </h3>
                  <p className="text-xs text-stone-400">
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
                  <ZodiacIcon sign={match.otherAstro.sunSign} size={14} className="bg-transparent border-0" />
                  {match.otherAstro.sunSign}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border border-stone-200 bg-stone-50 text-stone-500">
                  <ZodiacIcon sign={match.otherAstro.moonSign} size={14} className="bg-transparent border-0" />
                  {match.otherAstro.moonSign} Moon
                </span>
              </div>

              {/* Strength preview */}
              {firstStrength && (
                <p className="mt-2 text-xs text-stone-500 line-clamp-2 leading-relaxed">
                  <Star className="h-3 w-3 text-stone-400 inline mr-1" />
                  {firstStrength}
                </p>
              )}
            </div>
          </div>
        </button>

        {/* Action row */}
        <div className="flex items-center gap-2 px-5 pb-4">
          <Link
            href={`/chat/${match.id}`}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Message
          </Link>
          <button
            onClick={() => setModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors"
          >
            <Star className="h-4 w-4" />
            Compatibility
          </button>
        </div>
      </div>

      <CompatibilityModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        match={match}
      />
    </>
  );
}
