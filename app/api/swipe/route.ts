import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { calculateCompatibility } from "@/lib/matching";
import type { AstrologyResult } from "@/lib/astrology";

interface SessionUser {
  id?: string;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as SessionUser)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { toUserId?: string; direction?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { toUserId, direction } = body;

  if (!toUserId || typeof toUserId !== "string") {
    return NextResponse.json({ error: "toUserId is required." }, { status: 400 });
  }
  if (direction !== "like" && direction !== "pass") {
    return NextResponse.json({ error: "direction must be 'like' or 'pass'." }, { status: 400 });
  }
  if (toUserId === userId) {
    return NextResponse.json({ error: "Cannot swipe on yourself." }, { status: 400 });
  }

  // Upsert swipe — direction stored as plain string for SQLite
  await prisma.swipe.upsert({
    where: { fromUserId_toUserId: { fromUserId: userId, toUserId } },
    create: { fromUserId: userId, toUserId, direction },
    update: { direction },
  });

  // Check for mutual like
  let matched = false;
  let matchId: string | undefined;

  if (direction === "like") {
    const otherSwipe = await prisma.swipe.findUnique({
      where: { fromUserId_toUserId: { fromUserId: toUserId, toUserId: userId } },
    });

    if (otherSwipe?.direction === "like") {
      // It's a match! Create match record with sorted user IDs
      const [userAId, userBId] = [userId, toUserId].sort();

      // Get both users' astrology profiles
      const [userA, userB] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userAId },
          include: { astrologyProfile: true },
        }),
        prisma.user.findUnique({
          where: { id: userBId },
          include: { astrologyProfile: true },
        }),
      ]);

      if (userA?.astrologyProfile && userB?.astrologyProfile) {
        const rawA = userA.astrologyProfile;
        const rawB = userB.astrologyProfile;

        const astroA: AstrologyResult = {
          signs: {
            sun: rawA.sunSign,
            moon: rawA.moonSign,
            rising: rawA.risingSign,
          },
          elements: (typeof rawA.elementScores === "string"
            ? JSON.parse(rawA.elementScores)
            : rawA.elementScores) as AstrologyResult["elements"],
          modals: (typeof rawA.modalScores === "string"
            ? JSON.parse(rawA.modalScores)
            : rawA.modalScores) as AstrologyResult["modals"],
          traits: (typeof rawA.traits === "string"
            ? JSON.parse(rawA.traits)
            : rawA.traits) as AstrologyResult["traits"],
        };

        const astroB: AstrologyResult = {
          signs: {
            sun: rawB.sunSign,
            moon: rawB.moonSign,
            rising: rawB.risingSign,
          },
          elements: (typeof rawB.elementScores === "string"
            ? JSON.parse(rawB.elementScores)
            : rawB.elementScores) as AstrologyResult["elements"],
          modals: (typeof rawB.modalScores === "string"
            ? JSON.parse(rawB.modalScores)
            : rawB.modalScores) as AstrologyResult["modals"],
          traits: (typeof rawB.traits === "string"
            ? JSON.parse(rawB.traits)
            : rawB.traits) as AstrologyResult["traits"],
        };

        const compat = calculateCompatibility(astroA, astroB);

        // Serialize breakdown as JSON string for SQLite
        const breakdownStr = JSON.stringify({
          ...compat.breakdown,
          explanation: compat.explanation,
          strengths: compat.strengths,
          frictionPoints: compat.frictionPoints,
        });

        const match = await prisma.match.upsert({
          where: { userAId_userBId: { userAId, userBId } },
          create: {
            userAId,
            userBId,
            matchScore: compat.matchScore,
            breakdown: breakdownStr,
          },
          update: {
            matchScore: compat.matchScore,
            breakdown: breakdownStr,
          },
        });

        matched = true;
        matchId = match.id;
      }
    }
  }

  return NextResponse.json({ matched, matchId });
}
