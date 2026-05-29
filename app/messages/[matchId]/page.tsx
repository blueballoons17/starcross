"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, ChevronLeft } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { ConversationSidebar } from "@/components/ConversationSidebar";
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

interface MatchMeta {
  otherName: string;
  otherAvatarUrl?: string | null;
  otherSunSign: string;
  matchScore: number;
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
  const [meta, setMeta] = useState<MatchMeta | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const myId = (session?.user as { id?: string })?.id;

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Load match metadata
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/matches")
      .then((r) => r.json())
      .then((data) => {
        const match = (data.matches ?? []).find((m: { id: string }) => m.id === matchId);
        if (match) {
          setMeta({
            otherName: match.otherUser.name,
            otherAvatarUrl: match.otherUser.avatarUrl,
            otherSunSign: match.otherAstro.sunSign,
            matchScore: match.matchScore,
          });
        }
      })
      .catch(console.error);
  }, [status, matchId]);

  // Mark notifications read when opening this chat
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/notifications/read-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId }),
    }).catch(() => {/* silent */});
  }, [status, matchId]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages/${matchId}`);
      if (!res.ok) return;
      const data = await res.json();
      const newMsgs: MessageData[] = data.messages ?? [];
      setMessages((prev) => {
        if (newMsgs.length === prev.length &&
          newMsgs[newMsgs.length - 1]?.id === prev[prev.length - 1]?.id) {
          return prev;
        }
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Group by day
  const grouped: { day: string; msgs: MessageData[] }[] = [];
  for (const msg of messages) {
    const day = formatDay(msg.createdAt);
    const last = grouped[grouped.length - 1];
    if (last?.day === day) last.msgs.push(msg);
    else grouped.push({ day, msgs: [msg] });
  }

  const sunColor = meta ? getZodiacColor(meta.otherSunSign) : null;

  if (status === "loading") return null;

  return (
    <div className="h-screen flex flex-col">
      <NavBar />

      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Sidebar — hidden on mobile when chat is open */}
        <div className="hidden md:flex w-[340px] lg:w-[380px] shrink-0 border-r border-white/8 bg-stone-950/60 backdrop-blur-2xl flex-col overflow-hidden">
          <ConversationSidebar activeMatchId={matchId} />
        </div>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Chat header */}
          <div className="shrink-0 bg-stone-950/75 backdrop-blur-xl border-b border-white/8 px-4 py-3">
            <div className="max-w-3xl mx-auto flex items-center gap-3">
              {/* Mobile back */}
              <Link
                href="/messages"
                className="md:hidden p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors mr-1"
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <Link
                href="/messages"
                className="hidden md:flex p-1.5 rounded-lg hover:bg-white/10 text-stone-500 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>

              {/* Avatar */}
              {meta?.otherAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={meta.otherAvatarUrl}
                  alt={meta.otherName}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-white/15 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-400/20 flex items-center justify-center text-indigo-200 text-xs font-bold shrink-0">
                  {meta ? getInitials(meta.otherName) : "?"}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-sm truncate">
                  {meta?.otherName ?? "Chat"}
                </div>
                {sunColor && meta && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={cn(
                      "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] border",
                      sunColor.bg, sunColor.text, sunColor.border
                    )}>
                      <ZodiacIcon sign={meta.otherSunSign} size={9} className="bg-transparent border-0" />
                      {meta.otherSunSign}
                    </span>
                    <span className="text-[10px] text-stone-500">·</span>
                    <span className="text-[10px] text-stone-500">{meta.matchScore}% match</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
              {messages.length === 0 && (
                <div className="text-center py-16 space-y-3">
                  <div className="text-4xl">✨</div>
                  <p className="text-stone-500 text-sm">
                    You matched! Say hello to {meta?.otherName ?? "your match"}.
                  </p>
                </div>
              )}

              {grouped.map(({ day, msgs }) => (
                <div key={day}>
                  {/* Day divider */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-white/8" />
                    <span className="text-[11px] text-stone-600 font-medium tracking-wide px-2 py-0.5 rounded-full bg-white/5 border border-white/8">
                      {day}
                    </span>
                    <div className="flex-1 h-px bg-white/8" />
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
                            isFirst && !isMine ? "mt-3" : "",
                          )}
                        >
                          {/* Their avatar (only on last message of a group) */}
                          {!isMine && (
                            <div className="w-7 h-7 shrink-0 mb-0.5">
                              {isLast && (
                                meta?.otherAvatarUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={meta.otherAvatarUrl}
                                    alt=""
                                    className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10"
                                  />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-stone-300 text-[9px] font-bold">
                                    {meta ? getInitials(meta.otherName) : "?"}
                                  </div>
                                )
                              )}
                            </div>
                          )}

                          <div className={cn(
                            "flex flex-col gap-0.5",
                            isMine ? "items-end" : "items-start",
                            "max-w-[72%]"
                          )}>
                            <div className={cn(
                              "px-4 py-2.5 text-sm leading-relaxed",
                              isMine
                                ? "bg-indigo-600 text-white"
                                : "bg-white/10 backdrop-blur-sm text-stone-100 border border-white/8",
                              // Rounded corners — bubble shaping
                              isMine
                                ? cn(
                                    "rounded-2xl",
                                    isFirst ? "rounded-tr-md" : "",
                                    isLast ? "rounded-br-md" : ""
                                  )
                                : cn(
                                    "rounded-2xl",
                                    isFirst ? "rounded-tl-md" : "",
                                    isLast ? "rounded-bl-md" : ""
                                  ),
                              isOptimistic && "opacity-60"
                            )}>
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
          <div className="shrink-0 bg-stone-950/80 backdrop-blur-xl border-t border-white/8 px-4 py-3">
            <div className="max-w-3xl mx-auto flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${meta?.otherName ?? "your match"}…`}
                rows={1}
                className="flex-1 resize-none rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-indigo-400/50 focus:bg-white/10 transition-all min-h-[44px] max-h-[120px]"
                style={{ fieldSizing: "content" } as React.CSSProperties}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className={cn(
                  "w-11 h-11 rounded-full flex items-center justify-center text-white transition-all shrink-0",
                  input.trim() && !sending
                    ? "bg-indigo-500 hover:bg-indigo-400 shadow-lg shadow-indigo-500/25"
                    : "bg-white/10 opacity-40 cursor-not-allowed"
                )}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
