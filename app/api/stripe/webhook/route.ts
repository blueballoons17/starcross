import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export const runtime = "nodejs";

/** Get the period end from a subscription (works with both old and new Stripe API shapes). */
function getPeriodEnd(sub: Stripe.Subscription): Date | null {
  // Newer Stripe API (2025+): period_end lives on each subscription item
  const itemPeriodEnd = sub.items?.data?.[0]?.current_period_end;
  if (itemPeriodEnd) return new Date(itemPeriodEnd * 1000);
  // Fallback for older API shapes via unknown cast
  const legacyEnd = (sub as unknown as Record<string, unknown>)["current_period_end"];
  if (typeof legacyEnd === "number") return new Date(legacyEnd * 1000);
  return null;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        if (checkoutSession.mode === "subscription" && checkoutSession.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            checkoutSession.subscription as string,
            { expand: ["items"] }
          );
          const userId = sub.metadata?.userId;
          if (userId) {
            await prisma.user.update({
              where: { id: userId },
              data: {
                stripeSubscriptionId: sub.id,
                subscriptionStatus: sub.status,
                subscriptionCurrentPeriodEnd: getPeriodEnd(sub),
              },
            });
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeSubscriptionId: sub.id,
              subscriptionStatus: sub.status,
              subscriptionCurrentPeriodEnd: getPeriodEnd(sub),
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus: "canceled",
              subscriptionCurrentPeriodEnd: getPeriodEnd(sub),
            },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // In the newer Stripe API, subscription is in invoice.parent.subscription_details.subscription
        const parentSub = invoice.parent?.type === "subscription_details"
          ? invoice.parent.subscription_details?.subscription
          : undefined;
        const subscriptionId = typeof parentSub === "string"
          ? parentSub
          : (parentSub as Stripe.Subscription | undefined)?.id;
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = sub.metadata?.userId;
          if (userId) {
            await prisma.user.update({
              where: { id: userId },
              data: { subscriptionStatus: "past_due" },
            });
          }
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
