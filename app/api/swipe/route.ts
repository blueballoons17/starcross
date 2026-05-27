import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { calculateCompatibility } from "@/lib/matching";
import type { AstrologyResult } from "@/lib/astrology";

interface SessionUser {
  id?: string;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
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

  // Upsert swipe
  await prisma.swipe.upsert({
    where: { fromUserId_toUserId: { fromUserId: userId, toUserId } },
    create: { fromUserId: userId, toUserId, direction: direction as "like" | "pass" },
    update: { direction: direction as "like" | "pass" },
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
        const astroA: AstrologyResult = {
          signs: {
            sun: userA.astrologyProfile.sunSign,
            moon: userA.astrologyProfile.moonSign,
            rising: userA.astrologyProfile.risingSign,
          },
          elements: userA.astrologyProfile.elementScores as AstrologyResult["elements"],
          modals: userA.astrologyProfile.modalScores as AstrologyResult["modals"],
          traits: userA.astrologyProfile.traits as AstrologyResult["traits"],
        };

        const astroB: AstrologyResult = {
          signs: {
            sun: userB.astrologyProfile.sunSign,
            moon: userB.astrologyProfile.moonSign,
            rising: userB.astrologyProfile.risingSign,
          },
          elements: userB.astrologyProfile.elementScores as AstrologyResult["elements"],
          modals: userB.astrologyProfile.modalScores as AstrologyResult["modals"],
          traits: userB.astrologyProfile.traits as AstrologyResult["traits"],
        };

        const compat = calculateCompatibility(astroA, astroB);

        const match = await prisma.match.upsert({
          where: { userAId_userBId: { userAId, userBId } },
          create: {
            userAId,
            userBId,
            matchScore: compat.matchScore,
            breakdown: {
              ...compat.breakdown,
              explanation: compat.explanation,
              strengths: compat.strengths,
              frictionPoints: compat.frictionPoints,
            },
          },
          update: {
            matchScore: compat.matchScore,
            breakdown: {
              ...compat.breakdown,
              explanation: compat.explanation,
              strengths: compat.strengths,
              frictionPoints: compat.frictionPoints,
            },
          },
        });

        matched = true;
        matchId = match.id;
      }
    }
  }

  return NextResponse.json({ matched, matchId });
}
