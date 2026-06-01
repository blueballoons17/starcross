import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive } from "@/lib/subscription";

interface SessionUser { id?: string }

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as SessionUser)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check subscription
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionStatus: true, subscriptionCurrentPeriodEnd: true },
  });
  const isPremium = isSubscriptionActive(
    user?.subscriptionStatus,
    user?.subscriptionCurrentPeriodEnd,
  );

  // Users who have already matched with the current user (already in Matches)
  const existingMatches = await prisma.match.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    select: { userAId: true, userBId: true },
  });
  const matchedIds = new Set(
    existingMatches.map((m) => (m.userAId === userId ? m.userBId : m.userAId)),
  );

  // Swipes where someone liked the current user, excluding already-matched
  const likeSwipes = await prisma.swipe.findMany({
    where: { toUserId: userId, direction: "like" },
    include: {
      fromUser: {
        select: {
          id: true,
          profile: {
            select: { name: true, avatarUrl: true, birthCity: true },
          },
          astrologyProfile: {
            select: { sunSign: true, moonSign: true, risingSign: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const validLikers = likeSwipes.filter(
    (s) =>
      s.fromUser.profile &&
      s.fromUser.astrologyProfile &&
      !matchedIds.has(s.fromUser.id),
  );

  if (!isPremium) {
    return NextResponse.json({ isPremium: false, count: validLikers.length });
  }

  const likers = validLikers.map((s) => ({
    userId: s.fromUser.id,
    name: s.fromUser.profile!.name,
    avatarUrl: s.fromUser.profile!.avatarUrl ?? null,
    birthCity: s.fromUser.profile!.birthCity,
    sunSign: s.fromUser.astrologyProfile!.sunSign,
    moonSign: s.fromUser.astrologyProfile!.moonSign,
    risingSign: s.fromUser.astrologyProfile!.risingSign,
  }));

  return NextResponse.json({ isPremium: true, likers });
}
