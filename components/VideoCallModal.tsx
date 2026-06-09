"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneOff, Video, Mic, MicOff, VideoOff } from "lucide-react";
import { ZodiacIcon } from "@/components/ui/zodiac-icon";
import { getZodiacColor } from "@/lib/zodiac-colors";
import { cn } from "@/lib/utils";

interface VideoCallModalProps {
  open: boolean;
  onClose: () => void;
  matchId: string;
  matchName: string;
  matchSunSign?: string;
  matchAvatarUrl?: string | null;
  matchScore?: number;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

/* Pulsing ring animation for the pre-join screen */
function PulsingAvatar({
  name,
  sunSign,
  avatarUrl,
}: {
  name: string;
  sunSign?: string;
  avatarUrl?: string | null;
}) {
  const c = sunSign ? getZodiacColor(sunSign) : null;
  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      {/* Outer rings */}
      <div className="absolute inset-0 rounded-full border border-indigo-400/20 animate-ping" />
      <div
        className="absolute inset-2 rounded-full border border-indigo-400/15 animate-ping"
        style={{ animationDelay: "0.4s" }}
      />
      <div
        className="absolute inset-4 rounded-full border border-indigo-400/10 animate-ping"
        style={{ animationDelay: "0.8s" }}
      />
      {/* Avatar */}
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={name}
          className="relative w-24 h-24 rounded-full object-cover ring-2 ring-white/20 shadow-2xl z-10"
        />
      ) : (
        <div
          className={cn(
            "relative w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold ring-2 ring-white/20 shadow-2xl z-10",
            c ? `${c.bg} ${c.text}` : "bg-indigo-500/20 text-indigo-200"
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {/* Sign badge */}
      {sunSign && (
        <div
          className={cn(
            "absolute bottom-1 right-1 z-20 w-8 h-8 rounded-full border-2 border-stone-950 flex items-center justify-center",
            c?.bg
          )}
        >
          <ZodiacIcon sign={sunSign} size={16} className="bg-transparent border-0" />
        </div>
      )}
    </div>
  );
}

export function VideoCallModal({
  open,
  onClose,
  matchId,
  matchName,
  matchSunSign,
  matchAvatarUrl,
  matchScore,
}: VideoCallModalProps) {
  const [phase, setPhase] = useState<"prejoin" | "calling">("prejoin");
  const roomName = `kindredstars-${matchId}`;

  // Reset to prejoin when opened
  useEffect(() => {
    if (open) setPhase("prejoin");
  }, [open]);

  function handleEnd() {
    setPhase("prejoin");
    onClose();
  }

  const jitsiSrc = `https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.disableDeepLinking=true&config.toolbarButtons=["camera","microphone","hangup","chat","tileview","fullscreen","select-background"]&interfaceConfig.SHOW_CHROME_EXTENSION_BANNER=false`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col"
          style={{ background: "radial-gradient(ellipse 120% 80% at 50% 0%, #1a1040 0%, #080B18 60%)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* ── PRE-JOIN SCREEN ─────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {phase === "prejoin" && (
              <motion.div
                key="prejoin"
                className="flex-1 flex flex-col items-center justify-center gap-8 px-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Star field decorative dots */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full bg-white"
                      style={{
                        width: Math.random() * 2 + 1,
                        height: Math.random() * 2 + 1,
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        opacity: Math.random() * 0.4 + 0.1,
                      }}
                    />
                  ))}
                </div>

                {/* Label */}
                <div className="relative z-10 space-y-1">
                  <p className="text-stone-400 text-xs tracking-widest uppercase">Cosmic Call</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/20" />
                    <span className="text-stone-600 text-xs">✦</span>
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/20" />
                  </div>
                </div>

                {/* Avatar with pulsing rings */}
                <div className="relative z-10">
                  <PulsingAvatar
                    name={matchName}
                    sunSign={matchSunSign}
                    avatarUrl={matchAvatarUrl}
                  />
                </div>

                {/* Name + score */}
                <div className="relative z-10 space-y-1">
                  <h2 className="font-serif text-3xl font-semibold text-white">{matchName}</h2>
                  {matchScore && (
                    <p className="text-stone-400 text-sm">
                      {matchScore}% compatibility
                      {matchSunSign && ` · ${matchSunSign}`}
                    </p>
                  )}
                </div>

                {/* CTA buttons */}
                <div className="relative z-10 flex flex-col items-center gap-3 w-full max-w-xs">
                  <button
                    onClick={() => setPhase("calling")}
                    className="flex items-center justify-center gap-2.5 w-full py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-base transition-colors shadow-xl shadow-indigo-500/25"
                  >
                    <Video className="h-5 w-5" />
                    Join Video Call
                  </button>
                  <button
                    onClick={onClose}
                    className="text-stone-500 hover:text-stone-300 text-sm transition-colors py-2"
                  >
                    Cancel
                  </button>
                </div>

                {/* Privacy note */}
                <p className="relative z-10 text-[11px] text-stone-600 max-w-xs">
                  Calls are end-to-end encrypted and private to just the two of you.
                </p>
              </motion.div>
            )}

            {/* ── IN-CALL SCREEN ──────────────────────────────────── */}
            {phase === "calling" && (
              <motion.div
                key="calling"
                className="flex-1 flex flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Call header bar */}
                <div className="shrink-0 h-14 bg-stone-950/90 backdrop-blur-xl border-b border-white/8 flex items-center justify-between px-4 z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="text-white text-sm font-medium">
                      {matchName}
                    </span>
                    {matchSunSign && (
                      <span className="text-stone-500 text-xs hidden sm:inline">
                        · {matchSunSign}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleEnd}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-rose-500/25"
                  >
                    <PhoneOff className="h-4 w-4" />
                    End Call
                  </button>
                </div>

                {/* Jitsi iframe */}
                <div className="flex-1 relative">
                  <iframe
                    src={jitsiSrc}
                    allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-read; clipboard-write"
                    className="absolute inset-0 w-full h-full border-0"
                    title={`Video call with ${matchName}`}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
