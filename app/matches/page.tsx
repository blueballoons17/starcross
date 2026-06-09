"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { MatchCard } from "@/components/MatchCard";
import type { ProfileDrawerMatch } from "@/components/ProfileDrawer";
import { PageStars } from "@/components/PageStars";
import { AppFooter } from "@/components/ui/legal-page-layout";

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
    <div className="min-h-screen" style={{ background: "#07091f" }}>
      <PageStars />
      <NavBar />
      <main className="relative z-[1] pt-20 pb-24 px-5">
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

          {/* Empty state — no matches yet */}
          {matches.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-center">

              {/* Orbital animation */}
              <div className="relative w-36 h-36 mb-10 select-none" aria-hidden>
                {/* Outermost ring */}
                <div
                  className="absolute inset-0 rounded-full border border-white/[0.06]"
                  style={{ animation: "spin 28s linear infinite" }}
                />
                {/* Dot on outer ring */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-indigo-400/50"
                  style={{ animation: "spin 28s linear infinite" }}
                />

                {/* Middle ring */}
                <div
                  className="absolute inset-4 rounded-full border border-white/[0.09]"
                  style={{ animation: "spin 18s linear infinite reverse" }}
                />
                <div
                  className="absolute"
                  style={{
                    top: "1rem", left: "50%",
                    transform: "translateX(-50%) translateY(-50%)",
                    animation: "spin 18s linear infinite reverse",
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400/60" />
                </div>

                {/* Inner ring */}
                <div
                  className="absolute inset-8 rounded-full border border-indigo-400/20"
                  style={{ animation: "spin 11s linear infinite" }}
                />

                {/* Centre glow */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl scale-150" />
                    <span
                      className="relative text-3xl"
                      style={{ animation: "pulse 3s ease-in-out infinite" }}
                    >
                      ✦
                    </span>
                  </div>
                </div>
              </div>

              {/* Headline */}
              <h3 className="font-serif text-stone-200 text-2xl font-light leading-snug mb-3">
                The stars are still aligning
              </h3>

              {/* Body copy */}
              <p className="text-stone-500 text-sm leading-relaxed max-w-xs mb-2">
                We&rsquo;re searching for your best cosmic matches. Our community is still growing,
                so this can take a little time.
              </p>
              <p className="text-stone-500 text-sm leading-relaxed max-w-xs mb-8">
                The moment we find someone whose chart resonates with yours, we&rsquo;ll send you
                an email — so keep an eye on your inbox.
              </p>

              {/* Subtle CTA row */}
              <div className="flex flex-col items-center gap-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-stone-600">
                  In the meantime
                </p>
                <div className="flex gap-3">
                  <a
                    href="/discover"
                    className="px-4 py-2 rounded-full bg-indigo-600/80 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                  >
                    Keep swiping
                  </a>
                  <a
                    href="/profile"
                    className="px-4 py-2 rounded-full border border-white/10 hover:border-white/20 text-stone-400 hover:text-stone-200 text-xs transition-colors"
                  >
                    Refine your profile
                  </a>
                </div>
              </div>
            </div>

          ) : (
            <>
              {/* Unified editorial panel, one glass column, hairline dividers */}
              <div className="bg-stone-900/50 backdrop-blur-md border border-white/[0.07] rounded-[6px] overflow-hidden px-5 divide-y divide-white/[0.06]">
                {matches.map((match) => (
                  <MatchCard key={match.id} match={match} isPremium={isPremium} />
                ))}
              </div>

              {/* "Still searching" note — shown while the community is small */}
              {matches.length < 4 && (
                <div className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-5 text-center">
                  <p className="text-stone-500 text-xs font-medium mb-1.5">
                    ✦ More matches on the way
                  </p>
                  <p className="text-stone-600 text-xs leading-relaxed max-w-xs mx-auto">
                    Our community is still growing. We&rsquo;ll email you as soon as we find
                    another strong cosmic connection for you.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
