"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Send, User, Video } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import { ProfileDrawer } from "@/components/ProfileDrawer";
import type { ProfileDrawerMatch } from "@/components/ProfileDrawer";
import { VideoCallModal } from "@/components/VideoCallModal";
import { getZodiacColor } from "@/lib/zodiac-colors";
import { ZodiacIcon } from "@/components/ui/zodiac-icon";
import { cn } from "@/lib/utils";

interface MessageData {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    profile: { name: string; avatarUrl?: string | null } | null;
  };
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDay(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function MessagesChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const matchId = params.matchId as string;

  const [messages, setMessages] = useState<MessageData[]>([]);
  const [matchData, setMatchData] = useState<ProfileDrawerMatch | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);

  const bottomRef = useCallback((el: HTMLDivElement | null) => {
    el?.scrollIntoView({ behavior: "smooth" });
  }, []);
  const myId = (session?.user as { id?: string })?.id;

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Load full match data
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/matches")
      .then((r) => r.json())
      .then((data) => {
        const m = (data.matches ?? []).find(
          (m: ProfileDrawerMatch) => m.id === matchId
        );
        if (m) setMatchData(m);
      })
      .catch(console.error);
  }, [status, matchId]);

  // Mark notifications read
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/notifications/read-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId }),
    }).catch(() => {});
  }, [status, matchId]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages/${matchId}`);
      if (!res.ok) return;
      const data = await res.json();
      const newMsgs: MessageData[] = data.messages ?? [];
      setMessages((prev) => {
        if (
          newMsgs.length === prev.length &&
          newMsgs[newMsgs.length - 1]?.id === prev[prev.length - 1]?.id
        )
          return prev;
        return newMsgs;
      });
    } catch { /* silent */ }
  }, [matchId]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchMessages();
    const id = setInterval(fetchMessages, 3000);
    return () => clearInterval(id);
  }, [status, fetchMessages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");

    const optimisticId = `opt-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: optimisticId,
        content: text,
        createdAt: new Date().toISOString(),
        sender: { id: myId ?? "", profile: { name: "Me", avatarUrl: null } },
      },
    ]);

    try {
      const res = await fetch(`/api/messages/${matchId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        await fetchMessages();
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        setInput(text);
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Group messages by day
  const grouped: { day: string; msgs: MessageData[] }[] = [];
  for (const msg of messages) {
    const day = formatDay(msg.createdAt);
    const last = grouped[grouped.length - 1];
    if (last?.day === day) last.msgs.push(msg);
    else grouped.push({ day, msgs: [msg] });
  }

  const sunColor = matchData ? getZodiacColor(matchData.otherAstro.sunSign) : null;

  if (status === "loading") return null;

  return (
    <>
      <div className="h-screen flex flex-col">
        <NavBar />

        <div className="flex flex-1 overflow-hidden pt-16">
          {/* Sidebar */}
          <div className="hidden md:flex w-[340px] lg:w-[380px] shrink-0 border-r border-white/8 bg-stone-950/60 backdrop-blur-2xl flex-col overflow-hidden">
            <ConversationSidebar activeMatchId={matchId} />
          </div>

          {/* Chat panel */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

            {/* Chat header — click name/avatar to open profile */}
            <div className="shrink-0 bg-stone-950/80 backdrop-blur-xl border-b border-white/8 px-4 py-3">
              <div className="max-w-3xl mx-auto flex items-center gap-3">
                <Link
                  href="/messages"
                  className="md:hidden p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Link>
                <Link
                  href="/messages"
                  className="hidden md:flex p-1.5 rounded-lg hover:bg-white/10 text-stone-500 hover:text-white transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Link>

                {/* Clickable avatar + name → profile drawer */}
                <button
                  onClick={() => setProfileOpen(true)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
                  aria-label="View profile"
                >
                  {matchData?.otherUser.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={matchData.otherUser.avatarUrl}
                      alt={matchData.otherUser.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-white/15 shrink-0"
                    />
                  ) : (
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ring-1 ring-white/15",
                        sunColor ? `${sunColor.bg} ${sunColor.text}` : "bg-indigo-500/20 text-indigo-200"
                      )}
                    >
                      {matchData ? getInitials(matchData.otherUser.name) : "?"}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm truncate">
                      {matchData?.otherUser.name ?? "Chat"}
                    </div>
                    {sunColor && matchData && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] border",
                            sunColor.bg, sunColor.text, sunColor.border
                          )}
                        >
                          <ZodiacIcon sign={matchData.otherAstro.sunSign} size={9} className="bg-transparent border-0" />
                          {matchData.otherAstro.sunSign}
                        </span>
                        <span className="text-[10px] text-stone-600">·</span>
                        <span className="text-[10px] text-stone-500">
                          {matchData.matchScore}% match
                        </span>
                      </div>
                    )}
                  </div>
                </button>

                {/* Video call button */}
                <button
                  onClick={() => setCallOpen(true)}
                  className="p-2 rounded-xl hover:bg-white/8 text-stone-500 hover:text-indigo-300 transition-colors shrink-0"
                  aria-label="Start video call"
                >
                  <Video className="h-4 w-4" />
                </button>

                {/* Profile button */}
                <button
                  onClick={() => setProfileOpen(true)}
                  className="p-2 rounded-xl hover:bg-white/8 text-stone-500 hover:text-stone-200 transition-colors shrink-0"
                  aria-label="View full profile"
                >
                  <User className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages scroll area — explicit dark bg */}
            <div className="flex-1 overflow-y-auto bg-[#080B18]/50">
              <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
                {messages.length === 0 && (
                  <div className="text-center py-16 space-y-3">
                    <div className="relative mx-auto w-14 h-14">
                      <div className="absolute inset-0 rounded-full border border-indigo-500/25 animate-ping" />
                      <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
                        ✨
                      </div>
                    </div>
                    <p className="text-stone-400 text-sm">
                      You matched! Say hello to{" "}
                      <span className="text-white font-medium">
                        {matchData?.otherUser.name ?? "your match"}
                      </span>
                      .
                    </p>
                  </div>
                )}

                {grouped.map(({ day, msgs }) => (
                  <div key={day}>
                    {/* Day divider */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 h-px bg-white/6" />
                      <span className="text-[11px] text-stone-500 font-medium tracking-wide px-3 py-1 rounded-full bg-white/5 border border-white/8">
                        {day}
                      </span>
                      <div className="flex-1 h-px bg-white/6" />
                    </div>

                    <div className="space-y-1.5">
                      {msgs.map((msg, i) => {
                        const isMine = msg.sender.id === myId;
                        const isOptimistic = msg.id.startsWith("opt-");
                        const prevMsg = msgs[i - 1];
                        const nextMsg = msgs[i + 1];
                        const isFirst = !prevMsg || prevMsg.sender.id !== msg.sender.id;
                        const isLast = !nextMsg || nextMsg.sender.id !== msg.sender.id;

                        return (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex items-end gap-2",
                              isMine ? "flex-row-reverse" : "flex-row",
                              isFirst && !isMine ? "mt-3" : ""
                            )}
                          >
                            {/* Their avatar — only last in group */}
                            {!isMine && (
                              <div className="w-7 h-7 shrink-0 mb-0.5">
                                {isLast && (
                                  matchData?.otherUser.avatarUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={matchData.otherUser.avatarUrl}
                                      alt=""
                                      className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10"
                                    />
                                  ) : (
                                    <div
                                      className={cn(
                                        "w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold ring-1 ring-white/10",
                                        sunColor ? `${sunColor.bg} ${sunColor.text}` : "bg-white/10 text-stone-300"
                                      )}
                                    >
                                      {matchData ? getInitials(matchData.otherUser.name) : "?"}
                                    </div>
                                  )
                                )}
                              </div>
                            )}

                            <div
                              className={cn(
                                "flex flex-col gap-0.5 max-w-[72%]",
                                isMine ? "items-end" : "items-start"
                              )}
                            >
                              <div
                                className={cn(
                                  "px-4 py-2.5 text-sm leading-relaxed",
                                  isMine
                                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                                    : "bg-stone-800/80 text-stone-100 border border-white/8",
                                  isMine
                                    ? cn(
                                        "rounded-2xl",
                                        isFirst ? "rounded-tr-lg" : "",
                                        isLast ? "rounded-br-lg" : ""
                                      )
                                    : cn(
                                        "rounded-2xl",
                                        isFirst ? "rounded-tl-lg" : "",
                                        isLast ? "rounded-bl-lg" : ""
                                      ),
                                  isOptimistic && "opacity-60"
                                )}
                              >
                                {msg.content}
                              </div>
                              {isLast && (
                                <span className="text-[10px] text-stone-600 px-1">
                                  {formatTime(msg.createdAt)}
                                  {isMine && isOptimistic && " · Sending…"}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            </div>

            {/* Input bar */}
            <div className="shrink-0 bg-stone-950/85 backdrop-blur-xl border-t border-white/8 px-4 py-3">
              <div className="max-w-3xl mx-auto flex items-end gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${matchData?.otherUser.name ?? "your match"}…`}
                  rows={1}
                  className="flex-1 resize-none rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-indigo-400/40 focus:bg-white/10 transition-all min-h-[44px] max-h-[120px]"
                  style={{ fieldSizing: "content" } as React.CSSProperties}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center text-white transition-all shrink-0",
                    input.trim() && !sending
                      ? "bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/25"
                      : "bg-white/8 opacity-40 cursor-not-allowed"
                  )}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile drawer */}
      <ProfileDrawer
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        match={matchData}
      />

      {/* Video call */}
      <VideoCallModal
        open={callOpen}
        onClose={() => setCallOpen(false)}
        matchId={matchId}
        matchName={matchData?.otherUser.name ?? "Your Match"}
        matchSunSign={matchData?.otherAstro.sunSign}
        matchAvatarUrl={matchData?.otherUser.avatarUrl}
        matchScore={matchData?.matchScore}
      />
    </>
  );
}
