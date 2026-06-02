"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check, X } from "lucide-react";
import { PageStars } from "@/components/PageStars";

const FREE_FEATURES = [
  { text: "5 suggested matches", included: true },
  { text: "Message your matches", included: true },
  { text: "Astrology chart", included: true },
  { text: "Unlimited swipes", included: false },
  { text: "See who liked you", included: false },
  { text: "Priority profile visibility", included: false },
  { text: "Full synastry breakdown", included: false },
];

const PAID_FEATURES = [
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

  function handleFree() {
    if (status === "unauthenticated") {
      router.push("/signup");
      return;
    }
    // Logged in — check if they have a profile
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        router.push(data?.profile ? "/discover" : "/onboarding");
      })
      .catch(() => router.push("/onboarding"));
  }

  const upgraded = searchParams?.get("upgraded") === "true";
  const sessionId = searchParams?.get("session_id") ?? null;
  const [activating, setActivating] = useState(false);

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
          <Link href="/" className="flex items-center group">
            <span className="text-[13px] font-normal text-white tracking-[0.32em]" style={{ fontFamily: "var(--font-inter)" }}>
              starcross
            </span>
          </Link>
          <Link href="/login" className="text-stone-400 hover:text-stone-100 text-sm transition-colors">
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center pt-24 pb-20 px-4">
        <div className="w-full max-w-2xl">

          {/* Heading */}
          <div className="text-center mb-10">
            <p className="text-xs tracking-[0.22em] uppercase text-indigo-400 mb-3" style={{ fontFamily: "var(--font-cinzel)" }}>
              Choose your path
            </p>
            <h1 className="text-3xl font-semibold text-white mb-3" style={{ fontFamily: "var(--font-cinzel)" }}>
              Find your cosmic match
            </h1>
            <p className="text-stone-400 text-sm">Start free. Upgrade whenever you&apos;re ready.</p>
          </div>

          {upgraded && (
            <div className="mb-8 rounded-2xl border border-indigo-500/30 bg-indigo-950/40 px-5 py-4 text-center">
              <p className="text-indigo-200 text-sm font-medium">Welcome to StarCross+ ✨</p>
              <p className="text-indigo-400 text-xs mt-0.5">Your subscription is active. The stars are aligned.</p>
            </div>
          )}

          {/* Plans */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Free plan */}
            <div className="rounded-3xl border border-white/10 bg-stone-900/40 backdrop-blur-md overflow-hidden flex flex-col">
              <div className="px-7 pt-8 pb-6 text-center border-b border-white/[0.06]">
                <p className="text-[10px] tracking-[0.22em] uppercase text-stone-500 mb-3" style={{ fontFamily: "var(--font-cinzel)" }}>
                  Free
                </p>
                <h2 className="text-2xl font-semibold text-white mb-2" style={{ fontFamily: "var(--font-cinzel)" }}>
                  Starcross
                </h2>
                <p className="text-stone-500 text-xs leading-relaxed mb-4">
                  Dip your toes in — no card required.
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-light text-white">$0</span>
                  <span className="text-stone-500 text-sm">/ forever</span>
                </div>
              </div>

              <div className="px-7 py-5 flex-1">
                <ul className="space-y-3">
                  {FREE_FEATURES.map((f) => (
                    <li key={f.text} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        f.included
                          ? "bg-emerald-500/10 border border-emerald-500/30"
                          : "bg-stone-800 border border-stone-700"
                      }`}>
                        {f.included
                          ? <Check className="h-3 w-3 text-emerald-400" />
                          : <X className="h-3 w-3 text-stone-600" />
                        }
                      </div>
                      <span className={`text-sm ${f.included ? "text-stone-300" : "text-stone-600"}`}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="px-7 pb-7">
                <button
                  onClick={handleFree}
                  className="w-full py-3.5 rounded-2xl border border-white/15 hover:border-white/30 text-stone-300 hover:text-white font-medium text-sm transition-all"
                >
                  Continue for free
                </button>
              </div>
            </div>

            {/* Paid plan */}
            <div className="rounded-3xl border border-indigo-500/40 bg-stone-900/60 backdrop-blur-md overflow-hidden flex flex-col relative">
              {/* Recommended badge */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="bg-indigo-500 text-white text-[10px] font-semibold tracking-[0.1em] uppercase px-3 py-1 rounded-full">
                  Most popular
                </span>
              </div>

              <div className="px-7 pt-10 pb-6 text-center border-b border-white/[0.07]">
                <p className="text-[10px] tracking-[0.22em] uppercase text-indigo-400 mb-3" style={{ fontFamily: "var(--font-cinzel)" }}>
                  Full access
                </p>
                <h2 className="text-2xl font-semibold text-white mb-2" style={{ fontFamily: "var(--font-cinzel)" }}>
                  StarCross+
                </h2>
                <p className="text-stone-400 text-xs leading-relaxed mb-4">
                  Unlock every connection the stars have written.
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-light text-white">$14.99</span>
                  <span className="text-stone-400 text-sm">/ month</span>
                </div>
                <p className="text-stone-600 text-xs mt-1">Cancel anytime</p>
              </div>

              <div className="px-7 py-5 flex-1">
                <ul className="space-y-3">
                  {PAID_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-indigo-400" />
                      </div>
                      <span className="text-stone-200 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="px-7 pb-7">
                {error && (
                  <p className="text-red-400 text-xs text-center mb-3">{error}</p>
                )}
                <button
                  onClick={handleSubscribe}
                  disabled={loading || status === "loading"}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
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
