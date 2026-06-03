"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import { StarField } from "@/components/ui/star-field";
import { UpgradeModal } from "@/components/UpgradeModal";
import { AppFooter } from "@/components/ui/legal-page-layout";

export default function MessagesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user/status")
      .then((r) => r.json())
      .then((d) => { if (!d.error) setIsPremium(d.isPremium); })
      .catch(() => {});
  }, [status]);

  if (status === "loading") return null;

  /* Free-user gate */
  if (isPremium === false) {
    return (
      <>
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <StarField count={220} />
        </div>
        <NavBar />
        <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
          <div className="max-w-sm w-full text-center space-y-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border border-indigo-400/20 animate-ping" />
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center">
                <span className="text-2xl">✦</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.22em] uppercase text-stone-500 mb-2">StarCross+</p>
              <h2 className="font-serif text-white text-2xl font-semibold mb-3">
                Messaging is StarCross+
              </h2>
              <p className="text-stone-400 text-sm leading-relaxed max-w-xs mx-auto">
                Upgrade to start conversations with all your cosmic matches, unlimited messages, full synastry charts, and more.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setUpgradeOpen(true)}
                className="w-full py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
              >
                Upgrade to StarCross+
              </button>
              <Link
                href="/matches"
                className="block text-sm text-stone-500 hover:text-stone-300 transition-colors"
              >
                Back to matches
              </Link>
            </div>
          </div>
        </div>
        <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} feature="messaging" />
      </>
    );
  }

  return (
    <div style={{ background: "#07091f", minHeight: "100vh" }}>
      {/* Local star canvas, lives inside this page's stacking context */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <StarField count={220} />
      </div>

      <div className="fixed inset-x-0 bottom-16 md:bottom-0 flex overflow-hidden" style={{ top: 64 }}>
        <NavBar />

        {/* Sidebar, no bg, stars show through */}
        <div className="w-full md:w-[340px] lg:w-[380px] shrink-0 border-r border-white/8 overflow-hidden flex flex-col">
          <ConversationSidebar />
        </div>

        {/* Empty state, desktop only */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center space-y-4 px-8">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border border-indigo-400/20 animate-ping" />
              <div className="absolute inset-2 rounded-full border border-indigo-400/30 animate-ping [animation-delay:0.3s]" />
              <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center">
                <span className="text-3xl">✦</span>
              </div>
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-white mb-1">
                Select a conversation
              </h3>
              <p className="text-stone-500 text-sm max-w-xs">
                Choose a match from the left to start chatting across the cosmos.
              </p>
            </div>
          </div>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}
