"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check } from "lucide-react";
import { PageStars } from "@/components/PageStars";
import { ShootingStarLogo } from "@/components/ui/shooting-star-logo";

const FEATURES = [
  "Unlimited swipes",
  "Message all your matches",
  "Full synastry chart with planetary web",
  "Deep compatibility breakdown",
  "See who liked you",
  "Priority profile visibility",
];

function PricingContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status, update } = useSession();

  async function handleSubscribe() {
    setError("");

    // Not logged in, send to signup, then back here
    if (status === "unauthenticated") {
      router.push("/signup?callbackUrl=/pricing");
      return;
    }
    if (status === "loading") return;

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      if (res.status === 401) {
        router.push("/signup?callbackUrl=/pricing");
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? `Checkout failed (status ${res.status}). Please try again.`);
      }
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  const upgraded = searchParams?.get("upgraded") === "true";
  const sessionId = searchParams?.get("session_id") ?? null;
  const [activating, setActivating] = useState(false);

  // After Stripe redirects back: activate subscription immediately, then route correctly
  useEffect(() => {
    if (!upgraded || !sessionId) return;
    setActivating(true);
    (async () => {
      try {
        const res = await fetch("/api/stripe/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (data.ok) {
          await update();
          router.push(data.hasProfile ? "/discover" : "/onboarding");
          return;
        }
      } catch { /* fallback below */ }
      await update();
      router.push("/onboarding");
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upgraded, sessionId]);

  // Show a loading screen while activating so there's no flash of the pricing UI
  if (activating) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <PageStars />
        <div className="text-center space-y-4 relative z-10">
          <div className="w-10 h-10 rounded-full border-2 border-indigo-500/40 border-t-indigo-400 animate-spin mx-auto" />
          <p className="text-stone-300 text-sm" style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.12em" }}>
            Activating your subscription…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col">
      <PageStars />

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/8 bg-stone-950/70 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <ShootingStarLogo size={18} className="text-indigo-300" />
            <span
              className="text-[13px] font-medium text-white uppercase tracking-[0.18em]"
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              StarCross
            </span>
          </Link>
          <Link href="/login" className="text-stone-400 hover:text-stone-100 text-sm transition-colors">
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center pt-16 pb-20 px-4">
        <div className="w-full max-w-md">

          {upgraded && (
            <div className="mb-8 rounded-2xl border border-indigo-500/30 bg-indigo-950/40 px-5 py-4 text-center">
              <p className="text-indigo-200 text-sm font-medium">Welcome to StarCross+ ✨</p>
              <p className="text-indigo-400 text-xs mt-0.5">Your subscription is active. The stars are aligned.</p>
            </div>
          )}

          {/* Card */}
          <div className="rounded-3xl border border-indigo-500/30 bg-stone-900/60 backdrop-blur-md overflow-hidden">

            {/* Header */}
            <div className="px-8 pt-10 pb-8 text-center border-b border-white/[0.07]">
              <p className="text-[10px] tracking-[0.24em] uppercase text-indigo-400 mb-3"
                style={{ fontFamily: "var(--font-cinzel)" }}>
                Full Access
              </p>
              <h1
                className="text-4xl font-semibold text-white mb-2"
                style={{ fontFamily: "var(--font-cinzel)" }}
              >
                StarCross+
              </h1>
              <p className="text-stone-400 text-sm leading-relaxed mb-6">
                Map your birth chart. Find your cosmic match. Unlock every connection.
              </p>
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-5xl font-light text-white">$14.99</span>
                <span className="text-stone-400 text-sm">/ month</span>
              </div>
              <p className="text-stone-600 text-xs mt-1">Cancel anytime</p>
            </div>

            {/* Features */}
            <div className="px-8 py-7">
              <ul className="space-y-3.5">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-indigo-400" />
                    </div>
                    <span className="text-stone-200 text-sm">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="px-8 pb-8">
              {error && (
                <p className="text-red-400 text-xs text-center mb-3">{error}</p>
              )}
              <button
                onClick={handleSubscribe}
                disabled={loading || status === "loading"}
                className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Redirecting to checkout…
                  </>
                ) : (
                  <>Begin your journey, $14.99/mo</>
                )}
              </button>
              <p className="text-center text-stone-600 text-xs mt-3">
                Secure payment via Stripe · Cancel anytime
              </p>
            </div>
          </div>

          <p className="text-center text-stone-600 text-xs mt-6">
            Already have an account?{" "}
            <Link href="/login?callbackUrl=/pricing" className="text-stone-400 hover:text-stone-200 transition-colors underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense>
      <PricingContent />
    </Suspense>
  );
}
