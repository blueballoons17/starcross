import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

interface SessionUser {
  id?: string;
}

export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as SessionUser)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!priceId) {
    return NextResponse.json({ error: "STRIPE_PRICE_ID not configured" }, { status: 500 });
  }

  // Look up or create a Stripe customer for this user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true, email: true },
  });

  let customerId = user?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user?.email,
      metadata: { userId },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/pricing?upgraded=true`,
    cancel_url: `${appUrl}/pricing`,
    subscription_data: {
      metadata: { userId },
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
