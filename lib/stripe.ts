// Required in .env.local:
// STRIPE_SECRET_KEY=sk_...
// NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
// STRIPE_PRICE_ID=price_... (create a $9.99/mo product in Stripe dashboard)
// STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe webhook endpoint settings)
// NEXT_PUBLIC_APP_URL=https://your-domain.com

import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key, {
      apiVersion: "2026-05-27.dahlia" as const,
    });
  }
  return _stripe;
}

/** Convenience alias — same as getStripe() but available as an expression. */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});
