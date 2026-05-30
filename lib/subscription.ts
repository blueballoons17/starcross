import { prisma } from "@/lib/prisma";

export const FREE_SWIPES_PER_DAY = 3;

export function isSubscriptionActive(
  status: string | null | undefined,
  periodEnd: Date | null | undefined
): boolean {
  if (!status) return false;
  if (status === "active" || status === "trialing") return true;
  if (status === "canceled" && periodEnd && periodEnd > new Date()) return true;
  return false;
}

// Returns { allowed, swipesUsed, swipesMax }
// Increments counter if allowed. Use this BEFORE recording the swipe.
export async function checkAndIncrementSwipe(userId: string): Promise<{
  allowed: boolean;
  swipesUsed: number;
  swipesMax: number;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      subscriptionCurrentPeriodEnd: true,
      dailySwipeCount: true,
      dailySwipeResetAt: true,
    },
  });
  if (!user) return { allowed: false, swipesUsed: 0, swipesMax: FREE_SWIPES_PER_DAY };

  if (isSubscriptionActive(user.subscriptionStatus, user.subscriptionCurrentPeriodEnd)) {
    return { allowed: true, swipesUsed: 0, swipesMax: Infinity };
  }

  const now = new Date();
  const resetNeeded =
    !user.dailySwipeResetAt ||
    now.toDateString() !== new Date(user.dailySwipeResetAt).toDateString();

  if (resetNeeded) {
    await prisma.user.update({
      where: { id: userId },
      data: { dailySwipeCount: 1, dailySwipeResetAt: now },
    });
    return { allowed: true, swipesUsed: 1, swipesMax: FREE_SWIPES_PER_DAY };
  }

  if (user.dailySwipeCount >= FREE_SWIPES_PER_DAY) {
    return { allowed: false, swipesUsed: user.dailySwipeCount, swipesMax: FREE_SWIPES_PER_DAY };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { dailySwipeCount: { increment: 1 } },
  });
  return { allowed: true, swipesUsed: user.dailySwipeCount + 1, swipesMax: FREE_SWIPES_PER_DAY };
}
