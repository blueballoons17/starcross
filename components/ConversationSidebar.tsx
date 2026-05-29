"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search, MessageCircle } from "lucide-react";
import { getZodiacColor } from "@/lib/zodiac-colors";
import { ZodiacIcon } from "@/components/ui/zodiac-icon";
import { cn } from "@/lib/utils";

export interface Conversation {
  matchId: string;
  matchScore: number;
  otherUser: {
    id: string;
    name: string;
    avatarUrl: string | null;
    sunSign: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    isMine: boolean;
  } | null;
  unreadCount: number;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

interface ConversationSidebarProps {
  activeMatchId?: string;
  onSelect?: (matchId: string) => void;
}

export function ConversationSidebar({ activeMatchId, onSelect }: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchConversations();
    const id = setInterval(fetchConversations, 8000);
    return () => clearInterval(id);
  }, [fetchConversations]);

  const filtered = conversations.filter((c) =>
    c.otherUser.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 shrink-0 bg-stone-950/40 backdrop-blur-sm">
        <h2 className="font-serif text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-indigo-400" />
          Messages
        </h2>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search conversations…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/8 border border-white/10 text-stone-200 placeholder-stone-500 text-sm focus:outline-none focus:border-indigo-400/40 focus:bg-white/10 transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-stone-600 border-t-stone-300 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-6 space-y-3">
            <div className="text-3xl">🌌</div>
            <p className="text-stone-500 text-sm">
              {query ? "No conversations found" : "No matches yet — keep swiping!"}
            </p>
          </div>
        ) : (
          <div className="pb-4">
            {filtered.map((conv) => {
              const isActive = conv.matchId === activeMatchId;
              const sunColor = getZodiacColor(conv.otherUser.sunSign);

              return (
                <Link
                  key={conv.matchId}
                  href={`/messages/${conv.matchId}`}
                  onClick={() => onSelect?.(conv.matchId)}
                  className={cn(
                    "flex items-center gap-3 mx-3 px-4 py-3 rounded-xl transition-all duration-150 mb-1",
                    isActive
                      ? "bg-indigo-500/18 border border-indigo-400/25"
                      : "bg-stone-950/50 border border-white/6 hover:bg-stone-900/60 hover:border-white/12"
                  )}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {conv.otherUser.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={conv.otherUser.avatarUrl}
                        alt={conv.otherUser.name}
                        className="w-11 h-11 rounded-full object-cover ring-1 ring-white/10"
                      />
                    ) : (
                      <div className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold ring-1 ring-white/10",
                        isActive ? "bg-indigo-500/30 text-indigo-200" : "bg-white/10 text-stone-300"
                      )}>
                        {getInitials(conv.otherUser.name)}
                      </div>
                    )}
                    {/* Sun sign mini badge */}
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border border-stone-900 flex items-center justify-center",
                      sunColor.bg
                    )}>
                      <ZodiacIcon sign={conv.otherUser.sunSign} size={11} className="bg-transparent border-0" />
                    </div>
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className={cn(
                        "text-sm font-semibold truncate",
                        isActive ? "text-white" : conv.unreadCount > 0 ? "text-white" : "text-stone-200"
                      )}>
                        {conv.otherUser.name}
                      </span>
                      {conv.lastMessage && (
                        <span className="text-[10px] text-stone-500 shrink-0">
                          {formatTime(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn(
                        "text-xs truncate",
                        conv.unreadCount > 0 ? "text-stone-300 font-medium" : "text-stone-500"
                      )}>
                        {conv.lastMessage
                          ? `${conv.lastMessage.isMine ? "You: " : ""}${conv.lastMessage.content}`
                          : <span className="italic text-stone-600">No messages yet</span>}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
