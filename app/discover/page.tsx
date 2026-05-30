"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { SwipeDeck } from "@/components/SwipeDeck";
import { MatchCelebration } from "@/components/MatchCelebration";
import { PageStars } from "@/components/PageStars";
import { UpgradeModal } from "@/components/UpgradeModal";

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

interface PendingMatch {
  matchId: string;
  name: string;
  sunSign: string;
  moonSign: string;
  risingSign: string;
  matchScore: number;
  birthCity: string;
  birthCountry: string;
}

interface CurrentUser {
  sunSign: string;
}

interface UserStatus {
  isPremium: boolean;
  swipesRemaining: number;
  dailySwipesMax: number;
}

export default function DiscoverPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingMatch, setPendingMatch] = useState<PendingMatch | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    // Load candidates, current user's sun sign, and subscription status in parallel
    Promise.all([
      fetch("/api/discover").then((r) => r.json()),
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/user/status").then((r) => r.json()),
    ])
      .then(([discoverData, profileData, statusData]) => {
        if (discoverData.candidates) setCandidates(discoverData.candidates);
        if (profileData?.astrologyProfile?.sunSign) {
          setCurrentUser({ sunSign: profileData.astrologyProfile.sunSign });
        }
        if (!statusData.error) {
          setUserStatus({
            isPremium: statusData.isPremium,
            swipesRemaining: statusData.swipesRemaining,
            dailySwipesMax: statusData.dailySwipesMax,
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status]);

  async function handleLike(userId: string) {
    const candidate = candidates.find((c) => c.id === userId);
    try {
      const res = await fetch("/api/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: userId, direction: "like" }),
      });
      const data = await res.json();
      if (res.status === 403 && data.error === "SWIPE_LIMIT") {
        setUpgradeOpen(true);
        return;
      }
      if (data.matched && data.matchId && candidate) {
        setPendingMatch({
          matchId: data.matchId,
          name: candidate.profile.name,
          sunSign: candidate.astrologyProfile.sunSign,
          moonSign: candidate.astrologyProfile.moonSign,
          risingSign: candidate.astrologyProfile.risingSign,
          matchScore: candidate.matchScore,
          birthCity: candidate.profile.birthCity,
          birthCountry: candidate.profile.birthCountry,
        });
      }
      // Refresh swipe count after a successful swipe
      fetch("/api/user/status")
        .then((r) => r.json())
        .then((s) => {
          if (!s.error) {
            setUserStatus({
              isPremium: s.isPremium,
              swipesRemaining: s.swipesRemaining,
              dailySwipesMax: s.dailySwipesMax,
            });
          }
        })
        .catch(() => {});
    } catch {
      // silent fail — card still removed
    }
  }

  async function handlePass(userId: string) {
    try {
      const res = await fetch("/api/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: userId, direction: "pass" }),
      });
      const data = await res.json();
      if (res.status === 403 && data.error === "SWIPE_LIMIT") {
        setUpgradeOpen(true);
        return;
      }
      // Refresh swipe count after a successful pass
      fetch("/api/user/status")
        .then((r) => r.json())
        .then((s) => {
          if (!s.error) {
            setUserStatus({
              isPremium: s.isPremium,
              swipesRemaining: s.swipesRemaining,
              dailySwipesMax: s.dailySwipesMax,
            });
          }
        })
        .catch(() => {});
    } catch {
      // silent
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-stone-600 border-t-stone-200 animate-spin" />
          <p className="text-stone-400 text-sm">Reading the stars…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageStars />
      <NavBar />
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-serif text-2xl font-semibold text-white mb-1">Discover</h1>
            <p className="text-stone-400 text-sm">
              Swipe right to like · left to pass
            </p>
            {/* Swipe counter for free users */}
            {userStatus && !userStatus.isPremium && (
              <div className="mt-3 inline-flex items-center gap-2">
                <span className="text-xs text-stone-500">
                  {userStatus.swipesRemaining === 0
                    ? "No swipes left today"
                    : `${userStatus.swipesRemaining} swipe${userStatus.swipesRemaining === 1 ? "" : "s"} left today`}
                </span>
                {userStatus.swipesRemaining === 0 && (
                  <button
                    onClick={() => setUpgradeOpen(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-2"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            )}
          </div>

          <SwipeDeck
            candidates={candidates}
            onLike={handleLike}
            onPass={handlePass}
          />
        </div>
      </main>

      {/* Full-screen match celebration */}
      {pendingMatch && (
        <MatchCelebration
          open={!!pendingMatch}
          onClose={() => setPendingMatch(null)}
          match={pendingMatch}
          mySunSign={currentUser?.sunSign ?? "Aries"}
        />
      )}

      {/* Swipe limit upgrade modal */}
      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature="swipes"
      />
    </div>
  );
}
