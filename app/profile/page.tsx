"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Edit2, Star } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getZodiacColor, ZODIAC_SYMBOLS } from "@/lib/zodiac-colors";
import { cn } from "@/lib/utils";

interface ProfileData {
  profile: {
    name: string;
    birthDate: string;
    birthCity: string;
    birthCountry: string;
    gender?: string | null;
    bio?: string | null;
  };
  astrologyProfile: {
    sunSign: string;
    moonSign: string;
    risingSign: string;
    elementScores: { fire: number; earth: number; air: number; water: number };
    modalScores: { cardinal: number; fixed: number; mutable: number };
    traits: {
      emotionalStyle: string;
      communicationStyle: string;
      relationshipNeeds: string;
      conflictStyle: string;
    };
  } | null;
}

function getAge(birthDateStr: string): number {
  const birth = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function ProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 animate-pulse">Loading profile…</div>
      </div>
    );
  }

  if (!data?.profile) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <main className="pt-20 pb-12 px-4 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-slate-400">No profile found.</p>
            <Button asChild>
              <Link href="/onboarding">Complete Setup</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const { profile, astrologyProfile: astro } = data;
  const age = getAge(profile.birthDate);

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile header */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                  {getInitials(profile.name)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {profile.name}, {age}
                  </h1>
                  <p className="text-slate-400 text-sm">
                    {profile.birthCity}, {profile.birthCountry}
                  </p>
                  {profile.gender && (
                    <Badge variant="secondary" className="mt-1">
                      {profile.gender}
                    </Badge>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" asChild className="shrink-0">
                <Link href="/onboarding">
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </Link>
              </Button>
            </div>

            {profile.bio && (
              <p className="text-slate-300 text-sm leading-relaxed">{profile.bio}</p>
            )}
          </div>

          {/* Astrological profile */}
          {astro && (
            <>
              {/* Signs */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Star className="h-4 w-4 text-violet-400" />
                  Your Placements
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Sun Sign", sign: astro.sunSign },
                    { label: "Moon Sign", sign: astro.moonSign },
                    { label: "Rising Sign", sign: astro.risingSign },
                  ].map(({ label, sign }) => {
                    const c = getZodiacColor(sign);
                    return (
                      <div key={label} className="text-center space-y-2">
                        <p className="text-xs text-slate-500">{label}</p>
                        <div
                          className={cn(
                            "inline-flex flex-col items-center gap-1 px-3 py-2 rounded-xl border w-full",
                            c.bg, c.border
                          )}
                        >
                          <span className="text-2xl">{ZODIAC_SYMBOLS[sign]}</span>
                          <span className={cn("text-xs font-medium", c.text)}>{sign}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Element balance */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-4">Element Balance</h2>
                <div className="space-y-3">
                  {Object.entries(astro.elementScores as Record<string, number>).map(([el, pct]) => (
                    <div key={el} className="flex items-center gap-3">
                      <span className="text-sm text-slate-400 w-12 capitalize">{el}</span>
                      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            el === "fire" ? "bg-gradient-to-r from-orange-600 to-red-500" :
                            el === "earth" ? "bg-gradient-to-r from-emerald-600 to-green-500" :
                            el === "air" ? "bg-gradient-to-r from-sky-600 to-cyan-500" :
                            "bg-gradient-to-r from-indigo-600 to-blue-500"
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-500 w-10 text-right">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personality traits */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-5">
                <h2 className="text-white font-semibold">Personality Profile</h2>

                {[
                  { label: "Emotional Style", text: astro.traits.emotionalStyle },
                  { label: "Communication", text: astro.traits.communicationStyle },
                  { label: "In Relationships", text: astro.traits.relationshipNeeds },
                  { label: "In Conflict", text: astro.traits.conflictStyle },
                ].map(({ label, text }) => (
                  <div key={label} className="space-y-1.5">
                    <p className="text-xs uppercase tracking-wider text-violet-400">{label}</p>
                    <p className="text-slate-300 text-sm leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
