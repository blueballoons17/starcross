import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

interface SessionUser { id?: string; }

// Called immediately after Stripe redirects back — applies subscription before webhook fires
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as SessionUser)?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { sessionId } = await req.json();
    if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

    // Retrieve the checkout session from Stripe to confirm payment
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (checkoutSession.status !== "complete") {
      return NextResponse.json({ error: "Payment not complete" }, { status: 400 });
    }

    const sub = checkoutSession.subscription as import("stripe").Stripe.Subscription | null;
    if (!sub) return NextResponse.json({ error: "No subscription found" }, { status: 400 });

    // Resolve period end — newer Stripe API puts it on the item, older at the top level
    const itemPeriodEnd = sub.items?.data?.[0]?.current_period_end;
    const legacyEnd = (sub as unknown as Record<string, unknown>)["current_period_end"];
    const periodEndTs = itemPeriodEnd ?? (typeof legacyEnd === "number" ? legacyEnd : null);
    const periodEndDate = periodEndTs ? new Date(periodEndTs * 1000) : null;

    // Apply subscription to user immediately
    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeCustomerId: checkoutSession.customer as string,
        stripeSubscriptionId: sub.id,
        subscriptionStatus: sub.status,
        ...(periodEndDate ? { subscriptionCurrentPeriodEnd: periodEndDate } : {}),
      },
    });

    // Check if user has a profile already
    const profile = await prisma.profile.findUnique({ where: { userId } });

    return NextResponse.json({ ok: true, hasProfile: !!profile });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
