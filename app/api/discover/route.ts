import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { calculateCompatibility } from "@/lib/matching";
import type { AstrologyResult } from "@/lib/astrology";

interface SessionUser {
  id?: string;
  email?: string | null;
}

function getAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as SessionUser)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get current user's profile and astrology
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      astrologyProfile: true,
      swipesGiven: { select: { toUserId: true } },
    },
  });

  if (!currentUser?.profile || !currentUser.astrologyProfile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const swipedIds = new Set(currentUser.swipesGiven.map((s) => s.toUserId));
  swipedIds.add(userId); // exclude self

  const { prefAgeMin, prefAgeMax, prefGenders, gender: myGender } = currentUser.profile;

  // Parse gender preferences into an array e.g. ["Men","Women"]
  const myPrefs: string[] =
    prefGenders && prefGenders !== "any"
      ? prefGenders.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

  /** Does a candidate's gender match the current user's preferences? */
  function wantsGender(candidateGender: string | null): boolean {
    if (myPrefs.length === 0 || myPrefs.includes("Everyone")) return true;
    const g = candidateGender ?? "";
    return myPrefs.some((pref) => {
      if (pref === "Women") return g === "Woman";
      if (pref === "Men") return g === "Man";
      if (pref === "Non-binary people") return g === "Non-binary" || g === "Other" || g === "Non-binary";
      return false;
    });
  }

  /** Would a candidate also be open to the current user's gender? */
  function candidateWantsMe(candidatePrefGenders: string | null): boolean {
    if (!candidatePrefGenders || candidatePrefGenders === "any") return true;
    if (candidatePrefGenders.includes("Everyone")) return true;
    const g = myGender ?? "";
    const prefs = candidatePrefGenders.split(",").map((s) => s.trim());
    return prefs.some((pref) => {
      if (pref === "Women") return g === "Woman";
      if (pref === "Men") return g === "Man";
      if (pref === "Non-binary people") return g === "Non-binary" || g === "Other";
      return false;
    });
  }

  // Fetch candidate pool
  const candidates = await prisma.user.findMany({
    where: {
      id: { notIn: Array.from(swipedIds) },
      profile: { isNot: null },
      astrologyProfile: { isNot: null },
    },
    include: {
      profile: true,
      astrologyProfile: true,
    },
    take: 200,
  });

  // Filter by age AND gender preferences (both directions)
  const filtered = candidates.filter((c) => {
    if (!c.profile || !c.astrologyProfile) return false;
    const age = getAge(c.profile.birthDate);
    if (age < prefAgeMin || age > prefAgeMax) return false;
    if (!wantsGender(c.profile.gender)) return false;
    if (!candidateWantsMe(c.profile.prefGenders)) return false;
    return true;
  });

  // Parse current user's JSON string fields
  const currentAstro: AstrologyResult = {
    signs: {
      sun: currentUser.astrologyProfile.sunSign,
      moon: currentUser.astrologyProfile.moonSign,
      rising: currentUser.astrologyProfile.risingSign,
    },
    elements: (typeof currentUser.astrologyProfile.elementScores === "string"
      ? JSON.parse(currentUser.astrologyProfile.elementScores)
      : currentUser.astrologyProfile.elementScores) as AstrologyResult["elements"],
    modals: (typeof currentUser.astrologyProfile.modalScores === "string"
      ? JSON.parse(currentUser.astrologyProfile.modalScores)
      : currentUser.astrologyProfile.modalScores) as AstrologyResult["modals"],
    traits: (typeof currentUser.astrologyProfile.traits === "string"
      ? JSON.parse(currentUser.astrologyProfile.traits)
      : currentUser.astrologyProfile.traits) as AstrologyResult["traits"],
  };

  // Score and sort
  const scored = filtered
    .map((c) => {
      const rawAstro = c.astrologyProfile!;
      const candidateAstro: AstrologyResult = {
        signs: {
          sun: rawAstro.sunSign,
          moon: rawAstro.moonSign,
          rising: rawAstro.risingSign,
        },
        elements: (typeof rawAstro.elementScores === "string"
          ? JSON.parse(rawAstro.elementScores)
          : rawAstro.elementScores) as AstrologyResult["elements"],
        modals: (typeof rawAstro.modalScores === "string"
          ? JSON.parse(rawAstro.modalScores)
          : rawAstro.modalScores) as AstrologyResult["modals"],
        traits: (typeof rawAstro.traits === "string"
          ? JSON.parse(rawAstro.traits)
          : rawAstro.traits) as AstrologyResult["traits"],
      };

      const compat = calculateCompatibility(currentAstro, candidateAstro);

      return {
        id: c.id,
        profile: {
          name: c.profile!.name,
          birthDate: c.profile!.birthDate.toISOString(),
          avatarUrl: c.profile!.avatarUrl,
          bio: c.profile!.bio,
          gender: c.profile!.gender,
          birthCity: c.profile!.birthCity,
          birthCountry: c.profile!.birthCountry,
          interests: c.profile!.interests,
        },
        astrologyProfile: {
          sunSign: rawAstro.sunSign,
          moonSign: rawAstro.moonSign,
          risingSign: rawAstro.risingSign,
          traits: candidateAstro.traits,
        },
        matchScore: compat.matchScore,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 20);

  return NextResponse.json({ candidates: scored });
}
