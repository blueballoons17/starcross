"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { SwipeDeck } from "@/components/SwipeDeck";
import { toast } from "@/components/ui/use-toast";

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

export default function DiscoverPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/discover")
      .then((r) => r.json())
      .then((data) => {
        if (data.candidates) {
          setCandidates(data.candidates);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status]);

  async function handleLike(userId: string) {
    try {
      const res = await fetch("/api/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: userId, direction: "like" }),
      });
      const data = await res.json();
      if (data.matched) {
        toast({
          title: "It's a cosmic match!",
          description: "You and this person liked each other. Check your matches.",
          variant: "default",
        });
      }
    } catch {
      // silent fail — swipe still removes card
    }
  }

  async function handlePass(userId: string) {
    try {
      await fetch("/api/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: userId, direction: "pass" }),
      });
    } catch {
      // silent
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-stone-700 animate-spin" />
          <p className="text-stone-400 text-sm">Reading the stars…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <NavBar />
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-serif text-2xl font-semibold text-stone-900 mb-1">Discover</h1>
            <p className="text-stone-400 text-sm">
              Swipe right to like, left to pass
            </p>
          </div>

          <SwipeDeck
            candidates={candidates}
            onLike={handleLike}
            onPass={handlePass}
          />
        </div>
      </main>
    </div>
  );
}
