"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileDrawer } from "@/components/ProfileDrawer";
import type { ProfileDrawerMatch } from "@/components/ProfileDrawer";
import { UpgradeModal } from "@/components/UpgradeModal";
import type { UpgradeFeature } from "@/components/UpgradeModal";

interface MatchCardProps {
  match: ProfileDrawerMatch;
  isPremium?: boolean | null;
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

function ScoreMark({ score }: { score: number }) {
  const r = 16;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const col =
    score >= 80 ? "#c9a86a" : score >= 65 ? "#9d8ec8" : "#4a4a52";

  return (
    <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
      <svg width="36" height="36" className="-rotate-90">
        <circle
          cx="18" cy="18" r={r}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
        <circle
          cx="18" cy="18" r={r}
          fill="none"
          stroke={col}
          strokeWidth="1.5"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-serif text-[10px] text-stone-300">{score}</span>
        <span className="text-[7px] text-stone-600 -mt-px">%</span>
      </div>
    </div>
  );
}

export function MatchCard({ match, isPremium }: MatchCardProps) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<UpgradeFeature>("messaging");
  const age = getAge(match.otherUser.birthDate);

  function handleMessage(e: React.MouseEvent) {
    if (isPremium === false) {
      e.preventDefault();
      setUpgradeFeature("messaging");
      setUpgradeOpen(true);
    } else {
      router.push(`/messages/${match.id}`);
    }
  }

  function handleSynastry(e: React.MouseEvent) {
    if (isPremium === false) {
      e.preventDefault();
      setUpgradeFeature("synastry");
      setUpgradeOpen(true);
    } else {
      router.push(`/matches/${match.id}`);
    }
  }

  return (
    <>
      <div className="group py-5 px-5 -mx-5 hover:bg-white/[0.025] transition-colors duration-300 rounded-[3px]">
        <div className="flex gap-4">
          {/* Avatar */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="shrink-0 mt-px"
            aria-label={`View ${match.otherUser.name}'s profile`}
          >
            {match.otherUser.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={match.otherUser.avatarUrl}
                alt={match.otherUser.name}
                className="w-11 h-11 rounded-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-stone-800/60 border border-white/[0.07] flex items-center justify-center text-[11px] font-medium text-stone-500 tracking-widest">
                {getInitials(match.otherUser.name)}
              </div>
            )}
          </button>

          {/* Body */}
          <div className="flex-1 min-w-0">
            {/* Clickable info block */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-full text-left group/inner"
            >
              {/* Name row */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-serif text-stone-100 text-[1.05rem] font-normal leading-snug tracking-[-0.01em] truncate">
                    {match.otherUser.name}
                    <span className="text-stone-500 font-light">, {age}</span>
                  </h3>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-stone-600 mt-0.5 truncate">
                    {match.otherUser.birthCity}, {match.otherUser.birthCountry}
                  </p>
                </div>
                <ScoreMark score={match.matchScore} />
              </div>

              {/* Signs — plain glyphs, no pills */}
              <p className="mt-2.5 text-[11px] text-stone-500 leading-none tracking-[0.02em]">
                <span>☉ {match.otherAstro.sunSign}</span>
                <span className="mx-2 opacity-25">·</span>
                <span>☽ {match.otherAstro.moonSign}</span>
                <span className="mx-2 opacity-25">·</span>
                <span className="opacity-70">↑</span>{" "}
                <span>{match.otherAstro.risingSign}</span>
              </p>

              {/* Strength — italic, editorial */}
              {match.strengths[0] && (
                <p className="mt-2 text-[11px] text-stone-600 italic leading-relaxed line-clamp-1 group-hover/inner:text-stone-500 transition-colors duration-200">
                  {match.strengths[0]}
                </p>
              )}
            </button>

            {/* Action row — text links, no buttons */}
            <div className="mt-4 flex items-center gap-1">
              <button
                onClick={handleMessage}
                className="text-[10px] uppercase tracking-[0.13em] text-stone-400 hover:text-stone-100 transition-colors duration-200 py-1 pr-3 border-b border-stone-700/60 hover:border-stone-400"
              >
                Message
              </button>
              <span className="text-stone-700 px-1.5 select-none text-[10px]">·</span>
              <button
                onClick={handleSynastry}
                className="text-[10px] uppercase tracking-[0.13em] text-stone-600 hover:text-stone-400 transition-colors duration-200 py-1"
              >
                Synastry Chart
              </button>
            </div>
          </div>
        </div>
      </div>

      <ProfileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        match={match}
        isPremium={isPremium}
      />

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature={upgradeFeature}
      />
    </>
  );
}
