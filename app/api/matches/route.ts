import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

interface SessionUser {
  id?: string;
}

export async function GET() {
  const session = await getServerSession();
  const userId = (session?.user as SessionUser)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawMatches = await prisma.match.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    include: {
      userA: { include: { profile: true, astrologyProfile: true } },
      userB: { include: { profile: true, astrologyProfile: true } },
    },
    orderBy: { matchScore: "desc" },
  });

  // Get current user's astrology profile for the modal
  const currentUserAstro = await prisma.astrologyProfile.findUnique({
    where: { userId },
  });

  const matches = rawMatches
    .filter((m) => {
      const other = m.userAId === userId ? m.userB : m.userA;
      return other.profile && other.astrologyProfile;
    })
    .map((m) => {
      const other = m.userAId === userId ? m.userB : m.userA;
      const breakdown = m.breakdown as {
        elemental?: number;
        emotional?: number;
        communication?: number;
        stability?: number;
        explanation?: string;
        strengths?: string[];
        frictionPoints?: string[];
      };

      return {
        id: m.id,
        matchScore: Math.round(m.matchScore),
        breakdown: {
          elemental: breakdown.elemental ?? 60,
          emotional: breakdown.emotional ?? 60,
          communication: breakdown.communication ?? 60,
          stability: breakdown.stability ?? 60,
        },
        explanation: breakdown.explanation ?? "",
        strengths: breakdown.strengths ?? [],
        frictionPoints: breakdown.frictionPoints ?? [],
        otherUser: {
          name: other.profile!.name,
          birthDate: other.profile!.birthDate.toISOString(),
          birthCity: other.profile!.birthCity,
          birthCountry: other.profile!.birthCountry,
          avatarUrl: other.profile!.avatarUrl,
        },
        otherAstro: {
          sunSign: other.astrologyProfile!.sunSign,
          moonSign: other.astrologyProfile!.moonSign,
          risingSign: other.astrologyProfile!.risingSign,
        },
        currentAstro: currentUserAstro
          ? {
              sunSign: currentUserAstro.sunSign,
              moonSign: currentUserAstro.moonSign,
              risingSign: currentUserAstro.risingSign,
            }
          : {
              sunSign: "Unknown",
              moonSign: "Unknown",
              risingSign: "Unknown",
            },
      };
    });

  return NextResponse.json({ matches });
}
