"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Check, Zap, MessageCircle, GitBranch, Heart } from "lucide-react";
import { useRouter } from "next/navigation";

export type UpgradeFeature = "swipes" | "messaging" | "synastry" | "likes";

interface Props {
  open: boolean;
  onClose: () => void;
  feature: UpgradeFeature;
}

const HEADLINES: Record<UpgradeFeature, string> = {
  swipes: "You've used your 3 daily swipes",
  messaging: "Messaging is StarCross+",
  synastry: "Full synastry charts are StarCross+",
  likes: "See who liked you — StarCross+",
};

const SUBLINES: Record<UpgradeFeature, string> = {
  swipes: "Upgrade to discover unlimited connections, every day.",
  messaging: "Upgrade to start conversations with all your matches.",
  synastry: "Upgrade to explore the full planetary web of your connection.",
  likes: "Upgrade to see everyone who's already liked you.",
};

const FEATURES = [
  { icon: Zap, label: "Unlimited swipes" },
  { icon: MessageCircle, label: "Message your matches" },
  { icon: GitBranch, label: "Full synastry charts" },
  { icon: Heart, label: "See who liked you" },
];

export function UpgradeModal({ open, onClose, feature }: Props) {
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
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-sm bg-stone-950 border border-white/15 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden">
              {/* Header */}
              <div className="relative px-6 pt-6 pb-4 border-b border-white/8">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-500 hover:text-stone-200 hover:bg-white/8 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>

                <p className="text-[10px] tracking-[0.22em] uppercase text-stone-500 mb-2">
                  Unlock StarCross+
                </p>
                <h2 className="font-serif text-white text-xl font-semibold leading-snug mb-1">
                  {HEADLINES[feature]}
                </h2>
                <p className="text-stone-400 text-sm leading-relaxed">
                  {SUBLINES[feature]}
                </p>
              </div>

              {/* Features list */}
              <div className="px-6 py-5">
                <p className="text-[10px] tracking-[0.18em] uppercase text-stone-500 mb-3">
                  Everything in StarCross+
                </p>
                <ul className="space-y-2.5">
                  {FEATURES.map(({ icon: Icon, label }) => (
                    <li key={label} className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 shrink-0">
                        <Check className="h-3 w-3 text-indigo-300" />
                      </span>
                      <span className="text-stone-200 text-sm">{label}</span>
                      <Icon className="h-3.5 w-3.5 text-stone-600 ml-auto shrink-0" />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price + CTA */}
              <div className="px-6 pb-6 space-y-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-white text-2xl font-light">$9.99</span>
                  <span className="text-stone-500 text-sm">/ month</span>
                </div>

                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      Redirecting…
                    </span>
                  ) : (
                    <span>
                      Upgrade to{" "}
                      <span style={{ fontFamily: "var(--font-cinzel)" }}>
                        StarCross+
                      </span>
                    </span>
                  )}
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-2 text-stone-500 hover:text-stone-300 text-sm transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
