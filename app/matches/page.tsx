"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart, Star } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { MatchCard } from "@/components/MatchCard";

interface MatchData {
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
}

export default function MatchesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/matches")
      .then((r) => r.json())
      .then((data) => {
        if (data.matches) setMatches(data.matches);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-stone-700 animate-spin" />
          <p className="text-stone-400 text-sm">Loading matches…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <NavBar />
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center">
              <Heart className="h-5 w-5 text-stone-600" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-semibold text-stone-900">Your Matches</h1>
              <p className="text-stone-400 text-sm">
                {matches.length} cosmic {matches.length === 1 ? "connection" : "connections"}
              </p>
            </div>
          </div>

          {matches.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center">
                <Star className="h-8 w-8 text-stone-300" />
              </div>
              <div>
                <h3 className="font-serif text-stone-900 font-semibold mb-1">No matches yet</h3>
                <p className="text-stone-400 text-sm">Keep swiping — the stars are aligning.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
