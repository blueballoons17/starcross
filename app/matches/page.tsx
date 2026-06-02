"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { MatchCard } from "@/components/MatchCard";
import type { ProfileDrawerMatch } from "@/components/ProfileDrawer";
import { PageStars } from "@/components/PageStars";

export default function MatchesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [matches, setMatches] = useState<ProfileDrawerMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    Promise.all([
      fetch("/api/matches").then((r) => r.json()),
      fetch("/api/user/status").then((r) => r.json()),
    ])
      .then(([data, statusData]) => {
        if (data.matches) setMatches(data.matches);
        if (!statusData.error) setIsPremium(statusData.isPremium);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-serif text-stone-600 text-sm italic tracking-wide">
          Loading…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageStars />
      <NavBar />
      <main className="pt-20 pb-24 px-5">
        <div className="max-w-[480px] mx-auto">

          {/* Page header */}
          <div className="pt-6 mb-10">
            <h1 className="font-serif text-[2.6rem] font-light text-stone-100 tracking-[-0.02em] leading-none">
              Your Matches
            </h1>
            <p className="text-[10px] uppercase tracking-[0.16em] text-stone-600 mt-3">
              {matches.length === 0
                ? "No connections yet"
                : `${matches.length} ${matches.length === 1 ? "connection" : "connections"} found`}
            </p>
            {/* Hairline rule */}
            <div className="mt-7 h-px bg-white/[0.07]" />
          </div>

          {/* Empty state */}
          {matches.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-serif text-stone-700 text-5xl font-extralight mb-6 select-none">
                ✦
              </p>
              <h3 className="font-serif text-stone-400 text-xl font-light mb-2">
                No matches yet
              </h3>
              <p className="text-stone-600 text-sm tracking-wide">
                Keep swiping. the stars are aligning.
              </p>
            </div>
          ) : (
            /* Unified editorial panel, one glass column, hairline dividers */
            <div className="bg-stone-900/50 backdrop-blur-md border border-white/[0.07] rounded-[6px] overflow-hidden px-5 divide-y divide-white/[0.06]">
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} isPremium={isPremium} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
