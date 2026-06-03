"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { SwipeDeck } from "@/components/SwipeDeck";
import { MatchCelebration } from "@/components/MatchCelebration";
import { PageStars } from "@/components/PageStars";
import { UpgradeModal } from "@/components/UpgradeModal";
import { AppFooter } from "@/components/ui/legal-page-layout";
import type { UpgradeFeature } from "@/components/UpgradeModal";

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

interface Liker {
  userId: string;
  name: string;
  avatarUrl: string | null;
  birthCity: string;
  sunSign: string;
}

export default function DiscoverPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingMatch, setPendingMatch] = useState<PendingMatch | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<UpgradeFeature>("swipes");
  const [likers, setLikers] = useState<Liker[]>([]);
  const [likerCount, setLikerCount] = useState<number>(0);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    // Load candidates, profile, status, and incoming likes in parallel
    Promise.all([
      fetch("/api/discover").then((r) => r.json()),
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/user/status").then((r) => r.json()),
      fetch("/api/likes/incoming").then((r) => r.json()),
    ])
      .then(([discoverData, profileData, statusData, likesData]) => {
        if (discoverData.candidates) setCandidates(discoverData.candidates);
        setIsSubscribed(!!discoverData.isSubscribed);
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
        if (!likesData.error) {
          if (likesData.isPremium) {
            setLikers(likesData.likers ?? []);
            setLikerCount((likesData.likers ?? []).length);
          } else {
            setLikerCount(likesData.count ?? 0);
          }
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
        setUpgradeFeature("swipes");
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
      // silent fail, card still removed
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
        setUpgradeFeature("swipes");
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
    <div className="min-h-screen" style={{ background: "#07091f" }}>
      <PageStars />
      <NavBar />
      <main className="pt-20 pb-24 md:pb-8 px-4">
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

          {/* ── Who liked you ─────────────────────────────────────── */}
          {likerCount > 0 && (
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 mb-3">
                Who liked you
              </p>

              {userStatus?.isPremium ? (
                /* Premium: show real liker cards */
                <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1">
                  {likers.map((liker) => (
                    <button
                      key={liker.userId}
                      onClick={() => handleLike(liker.userId)}
                      className="shrink-0 flex flex-col items-center gap-1.5 group"
                      title={`Like ${liker.name} back`}
                    >
                      {liker.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={liker.avatarUrl}
                          alt={liker.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/40 group-hover:ring-indigo-400 transition-all"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-sm font-semibold">
                          {liker.name[0]}
                        </div>
                      )}
                      <span className="text-[10px] text-stone-400 group-hover:text-stone-200 transition-colors truncate max-w-[48px]">
                        {liker.name.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                /* Free: blurred teaser */
                <button
                  onClick={() => { setUpgradeFeature("likes"); setUpgradeOpen(true); }}
                  className="w-full rounded-2xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 px-4 py-4 text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    {/* Ghost avatar blobs */}
                    {Array.from({ length: Math.min(likerCount, 4) }).map((_, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-indigo-800/60 blur-[2px] shrink-0"
                        style={{ opacity: 1 - i * 0.15 }}
                      />
                    ))}
                    {likerCount > 4 && (
                      <span className="text-stone-500 text-xs shrink-0 blur-[2px]">
                        +{likerCount - 4}
                      </span>
                    )}
                  </div>
                  <p className="text-indigo-300 text-sm font-medium">
                    {likerCount} {likerCount === 1 ? "person" : "people"} already liked you
                  </p>
                  <p className="text-stone-500 text-xs mt-0.5">
                    Upgrade to StarCross+ to see who →
                  </p>
                </button>
              )}
            </div>
          )}

          <SwipeDeck
            candidates={candidates}
            onLike={handleLike}
            onPass={handlePass}
            isSubscribed={isSubscribed}
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

      {/* Upgrade modal */}
      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature={upgradeFeature}
      />

      <AppFooter />
    </div>
  );
}
