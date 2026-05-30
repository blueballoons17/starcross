import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive, FREE_SWIPES_PER_DAY } from "@/lib/subscription";

interface SessionUser {
  id?: string;
}

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as SessionUser)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      subscriptionCurrentPeriodEnd: true,
      dailySwipeCount: true,
      dailySwipeResetAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isPremium = isSubscriptionActive(
    user.subscriptionStatus,
    user.subscriptionCurrentPeriodEnd
  );

  // Check if daily reset is needed (read-only — don't increment)
  const now = new Date();
  const resetNeeded =
    !user.dailySwipeResetAt ||
    now.toDateString() !== new Date(user.dailySwipeResetAt).toDateString();

  const dailySwipesUsed = resetNeeded ? 0 : user.dailySwipeCount;
  const swipesRemaining = isPremium
    ? 999
    : Math.max(0, FREE_SWIPES_PER_DAY - dailySwipesUsed);

  return NextResponse.json({
    isPremium,
    subscriptionStatus: user.subscriptionStatus ?? null,
    subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd
      ? user.subscriptionCurrentPeriodEnd.toISOString()
      : null,
    dailySwipesUsed,
    dailySwipesMax: FREE_SWIPES_PER_DAY,
    swipesRemaining,
  });
}
