"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, X, ArrowLeft } from "lucide-react";
import { PageStars } from "@/components/PageStars";

const FREE_FEATURES = [
  { label: "3 swipes per day", included: true },
  { label: "View matches", included: true },
  { label: "Basic compatibility score", included: true },
  { label: "Unlimited messaging", included: false },
  { label: "Full synastry charts", included: false },
  { label: "See who liked you", included: false },
  { label: "Unlimited swipes", included: false },
];

const PREMIUM_FEATURES = [
  { label: "Unlimited swipes", included: true },
  { label: "Message all your matches", included: true },
  { label: "Full synastry chart with planetary web", included: true },
  { label: "See who liked you", included: true },
  { label: "Deep compatibility breakdown", included: true },
  { label: "All free tier features", included: true },
];

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        router.push(data.url);
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      <PageStars />

      {/* Nav */}
      <div className="fixed top-0 left-0 right-0 z-40 border-b border-white/8 bg-stone-950/70 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <Link
            href="/discover"
            className="flex items-center gap-2 text-stone-400 hover:text-stone-100 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Discover
          </Link>
        </div>
      </div>

      <main className="pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-14">
            <p className="text-[11px] tracking-[0.24em] uppercase text-stone-500 mb-3">
              Subscription
            </p>
            <h1
              className="text-4xl sm:text-5xl font-semibold text-white mb-4"
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              StarCross+
            </h1>
            <p className="text-stone-400 text-base max-w-sm mx-auto leading-relaxed">
              Deepen every connection. Explore the full astrology of compatibility.
            </p>
          </div>

          {/* Comparison columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
            {/* Free */}
            <div className="rounded-2xl border border-white/10 bg-stone-900/50 p-6">
              <div className="mb-5">
                <p className="text-[10px] tracking-[0.2em] uppercase text-stone-500 mb-1">
                  Free
                </p>
                <p className="text-2xl font-light text-white">$0</p>
                <p className="text-stone-500 text-xs mt-0.5">forever</p>
              </div>
              <ul className="space-y-3">
                {FREE_FEATURES.map(({ label, included }) => (
                  <li key={label} className="flex items-center gap-2.5">
                    {included ? (
                      <Check className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-stone-700 shrink-0" />
                    )}
                    <span
                      className={`text-sm ${
                        included ? "text-stone-300" : "text-stone-600"
                      }`}
                    >
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Premium */}
            <div className="rounded-2xl border border-indigo-500/40 bg-indigo-950/30 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1.5 bg-indigo-600 text-white text-[10px] tracking-widest uppercase rounded-bl-xl font-medium">
                Best
              </div>
              <div className="mb-5">
                <p
                  className="text-[10px] tracking-[0.2em] uppercase text-indigo-400 mb-1"
                  style={{ fontFamily: "var(--font-cinzel)" }}
                >
                  StarCross+
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-light text-white">$9.99</span>
                  <span className="text-stone-400 text-xs">/ month</span>
                </div>
                <p className="text-stone-500 text-xs mt-0.5">billed monthly</p>
              </div>
              <ul className="space-y-3">
                {PREMIUM_FEATURES.map(({ label }) => (
                  <li key={label} className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    <span className="text-sm text-stone-200">{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors shadow-lg shadow-indigo-500/20 mb-4"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Redirecting…
                </>
              ) : (
                <>
                  Start your journey —{" "}
                  <span style={{ fontFamily: "var(--font-cinzel)" }}>
                    StarCross+
                  </span>
                </>
              )}
            </button>
            <p className="text-stone-600 text-xs">
              Cancel anytime · Secure payment via Stripe
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
