import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface SessionUser { id?: string }

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as SessionUser)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    include: {
      userA: { include: { profile: true, astrologyProfile: true } },
      userB: { include: { profile: true, astrologyProfile: true } },
    },
  });

  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const currentUserAstro = await prisma.astrologyProfile.findUnique({ where: { userId } });
  const other = match.userAId === userId ? match.userB : match.userA;

  const breakdown =
    typeof match.breakdown === "string"
      ? JSON.parse(match.breakdown)
      : (match.breakdown as {
          elemental?: number; emotional?: number;
          communication?: number; stability?: number;
          explanation?: string; strengths?: string[]; frictionPoints?: string[];
        });

  return NextResponse.json({
    id: match.id,
    matchScore: Math.round(match.matchScore),
    breakdown: {
      elemental:     breakdown.elemental     ?? 60,
      emotional:     breakdown.emotional     ?? 60,
      communication: breakdown.communication ?? 60,
      stability:     breakdown.stability     ?? 60,
    },
    explanation:   breakdown.explanation  ?? "",
    strengths:     breakdown.strengths    ?? [],
    frictionPoints: breakdown.frictionPoints ?? [],
    otherUser: {
      name:        other.profile!.name,
      birthDate:   other.profile!.birthDate.toISOString(),
      birthCity:   other.profile!.birthCity,
      birthCountry: other.profile!.birthCountry,
      avatarUrl:   other.profile!.avatarUrl,
      photos: (() => {
        try { return JSON.parse(other.profile!.photos ?? "[]") as string[]; }
        catch { return [] as string[]; }
      })(),
    },
    otherAstro: {
      sunSign:    other.astrologyProfile!.sunSign,
      moonSign:   other.astrologyProfile!.moonSign,
      risingSign: other.astrologyProfile!.risingSign,
    },
    currentAstro: currentUserAstro
      ? { sunSign: currentUserAstro.sunSign, moonSign: currentUserAstro.moonSign, risingSign: currentUserAstro.risingSign }
      : null,
  });
}
