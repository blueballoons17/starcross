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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 animate-pulse">Reading the stars…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Discover</h1>
            <p className="text-slate-400 text-sm">
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
