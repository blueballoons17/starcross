"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { NavBar } from "@/components/NavBar";
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
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const matchId = params.matchId as string;

  const [messages, setMessages] = useState<MessageData[]>([]);
  const [meta, setMeta] = useState<MatchMeta | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestIdRef = useRef<string | null>(null);

  const myId = (session?.user as { id?: string })?.id;

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Load match metadata from matches list
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
      .catch(console.error)
      .finally(() => setLoadingMeta(false));
  }, [status, matchId]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages/${matchId}`);
      if (!res.ok) return;
      const data = await res.json();
      const newMsgs: MessageData[] = data.messages ?? [];
      setMessages((prev) => {
        // Only update if there are new messages to avoid re-render churn
        if (newMsgs.length !== prev.length) return newMsgs;
        const lastNew = newMsgs[newMsgs.length - 1];
        const lastOld = prev[prev.length - 1];
        if (lastNew?.id !== lastOld?.id) return newMsgs;
        return prev;
      });
      if (newMsgs.length > 0) {
        latestIdRef.current = newMsgs[newMsgs.length - 1].id;
      }
    } catch {
      // silent
    }
  }, [matchId]);

  // Initial load + start polling
  useEffect(() => {
    if (status !== "authenticated") return;
    fetchMessages();
    pollingRef.current = setInterval(fetchMessages, 3000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [status, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");

    // Optimistic update
    const optimisticId = `opt-${Date.now()}`;
    const optimistic: MessageData = {
      id: optimisticId,
      content: text,
      createdAt: new Date().toISOString(),
      sender: {
        id: myId ?? "",
        profile: { name: "Me", avatarUrl: null },
      },
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch(`/api/messages/${matchId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        // Replace optimistic with real message from server
        await fetchMessages();
      } else {
        // Remove optimistic on failure
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

  // Group messages by day
  const grouped: { day: string; msgs: MessageData[] }[] = [];
  for (const msg of messages) {
    const day = formatDay(msg.createdAt);
    const last = grouped[grouped.length - 1];
    if (last?.day === day) {
      last.msgs.push(msg);
    } else {
      grouped.push({ day, msgs: [msg] });
    }
  }

  const sunColor = meta ? getZodiacColor(meta.otherSunSign) : null;

  if (status === "loading" || loadingMeta) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-stone-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col">
      <NavBar />

      {/* Chat header */}
      <div className="fixed top-16 left-0 right-0 z-30 bg-white/90 backdrop-blur-xl border-b border-stone-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/matches"
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          {/* Avatar */}
          {meta?.otherAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={meta.otherAvatarUrl}
              alt={meta.otherName}
              className="w-9 h-9 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {meta ? getInitials(meta.otherName) : "?"}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-stone-900 text-sm truncate">
              {meta?.otherName ?? "Chat"}
            </div>
            {sunColor && meta && (
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] border",
                    sunColor.bg, sunColor.text, sunColor.border
                  )}
                >
                  <ZodiacIcon sign={meta.otherSunSign} size={10} className="bg-transparent border-0" />
                  {meta.otherSunSign}
                </span>
                <span className="text-[10px] text-stone-400">·</span>
                <span className="text-[10px] text-stone-400">{meta.matchScore}% match</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages scroll area */}
      <main className="flex-1 pt-[120px] pb-[80px] overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-16 space-y-3">
              <div className="text-3xl">✨</div>
              <p className="text-stone-500 text-sm">
                You matched! Say hello to {meta?.otherName ?? "your match"}.
              </p>
            </div>
          )}

          {grouped.map(({ day, msgs }) => (
            <div key={day}>
              {/* Day divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-stone-100" />
                <span className="text-[11px] text-stone-400 font-medium tracking-wide px-1">{day}</span>
                <div className="flex-1 h-px bg-stone-100" />
              </div>

              <div className="space-y-2">
                {msgs.map((msg, i) => {
                  const isMine = msg.sender.id === myId;
                  const showAvatar =
                    !isMine &&
                    (i === 0 || msgs[i - 1].sender.id !== msg.sender.id);

                  return (
                    <div
                      key={msg.id}
                      className={cn("flex items-end gap-2", isMine ? "flex-row-reverse" : "flex-row")}
                    >
                      {/* Other person's avatar */}
                      {!isMine && (
                        <div className="w-6 shrink-0">
                          {showAvatar && (
                            meta?.otherAvatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={meta.otherAvatarUrl}
                                alt=""
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-stone-600 to-stone-800 flex items-center justify-center text-white text-[8px] font-bold">
                                {meta ? getInitials(meta.otherName) : "?"}
                              </div>
                            )
                          )}
                        </div>
                      )}

                      <div className={cn("flex flex-col gap-0.5 max-w-[75%]", isMine ? "items-end" : "items-start")}>
                        <div
                          className={cn(
                            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                            isMine
                              ? "bg-stone-900 text-white rounded-br-sm"
                              : "bg-white border border-stone-100 text-stone-800 shadow-sm rounded-bl-sm"
                          )}
                          style={
                            msg.id.startsWith("opt-")
                              ? { opacity: 0.6 }
                              : undefined
                          }
                        >
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-stone-400 px-1">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-stone-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${meta?.otherName ?? "your match"}…`}
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors min-h-[40px] max-h-[120px]"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-700 transition-colors shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
