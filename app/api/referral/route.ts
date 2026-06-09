import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface SessionUser {
  id?: string;
}

const REFERRALS_FOR_FREE_MONTH = 5;

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as SessionUser)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      referralCode: true,
      pendingFreeMonths: true,
      referralsMade: {
        select: { paidAt: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const signupCount = user.referralsMade.length;
  const paidCount = user.referralsMade.filter((r) => r.paidAt !== null).length;
  const progressToNextReward = paidCount % REFERRALS_FOR_FREE_MONTH;
  const totalFreeMonthsEarned = Math.floor(paidCount / REFERRALS_FOR_FREE_MONTH);

  return NextResponse.json({
    code: user.referralCode ?? null,
    signupCount,
    paidCount,
    progressToNextReward,         // 0–4: how many of the current 5 are done
    totalFreeMonthsEarned,
    pendingFreeMonths: user.pendingFreeMonths,
    rewardThreshold: REFERRALS_FOR_FREE_MONTH,
  });
}
