"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import { StarField } from "@/components/ui/star-field";

export default function MessagesPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") return null;

  return (
    <>
      {/* Local star canvas — lives inside this page's stacking context */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <StarField count={220} />
      </div>

      <div className="fixed inset-x-0 bottom-0 flex overflow-hidden" style={{ top: 64 }}>
        <NavBar />

        {/* Sidebar — no bg, stars show through */}
        <div className="w-full md:w-[340px] lg:w-[380px] shrink-0 border-r border-white/8 overflow-hidden flex flex-col">
          <ConversationSidebar />
        </div>

        {/* Empty state — desktop only */}
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
    </>
  );
}
