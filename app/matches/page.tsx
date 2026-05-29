"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { MatchCard } from "@/components/MatchCard";
import type { ProfileDrawerMatch } from "@/components/ProfileDrawer";
import { PageStars } from "@/components/PageStars";

/* ── Constellation header decoration ───────────────────────────── */
function ConstellationAccent() {
  const nodes = [
    { x: 12, y: 18 }, { x: 38, y: 8 }, { x: 62, y: 22 },
    { x: 82, y: 10 }, { x: 95, y: 26 },
  ];
  const edges = [[0,1],[1,2],[2,3],[3,4]];
  return (
    <svg
      viewBox="0 0 100 35"
      className="w-32 h-10 opacity-25 pointer-events-none select-none"
      aria-hidden
    >
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].x} y1={nodes[a].y}
          x2={nodes[b].x} y2={nodes[b].y}
          stroke="white" strokeWidth="0.5" strokeLinecap="round"
        />
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={i % 2 === 0 ? 1.4 : 1.0} fill="white" />
      ))}
    </svg>
  );
}

export default function MatchesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [matches, setMatches] = useState<ProfileDrawerMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/matches")
      .then((r) => r.json())
      .then((data) => { if (data.matches) setMatches(data.matches); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500/40 border-t-indigo-300 animate-spin" />
          <p className="text-stone-400 text-sm">Loading matches…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageStars />
      <NavBar />
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Page header */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ConstellationAccent />
                </div>
                <h1 className="font-serif text-3xl font-semibold text-white leading-tight">
                  Your Matches
                </h1>
                <p className="text-stone-400 text-sm mt-1">
                  {matches.length}{" "}
                  {matches.length === 1 ? "cosmic connection" : "cosmic connections"} found
                </p>
              </div>

              {/* Score legend */}
              {matches.length > 0 && (
                <div className="shrink-0 flex flex-col gap-1.5 pt-1">
                  {[
                    { color: "#fbbf24", label: "≥80% match" },
                    { color: "#a78bfa", label: "≥65% match" },
                    { color: "#6b7280", label: "<65% match" },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: color }}
                      />
                      <span className="text-[10px] text-stone-500">{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Subtle separator with stars */}
            <div className="flex items-center gap-3 mt-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <span className="text-stone-600 text-xs tracking-widest">✦ ✦ ✦</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            </div>
          </div>

          {matches.length === 0 ? (
            <div className="text-center py-24 space-y-5">
              <div className="relative mx-auto w-20 h-20">
                {/* Pulsing rings */}
                <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping" />
                <div className="absolute inset-2 rounded-full border border-indigo-400/15 animate-ping" style={{ animationDelay: "0.5s" }} />
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/12 flex items-center justify-center text-2xl">
                  ✨
                </div>
              </div>
              <div>
                <h3 className="font-serif text-white font-semibold text-lg mb-1">
                  No matches yet
                </h3>
                <p className="text-stone-400 text-sm">Keep swiping — the stars are aligning.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
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
