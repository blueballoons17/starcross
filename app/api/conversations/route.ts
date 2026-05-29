import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface SessionUser { id?: string; }

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as SessionUser)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const matches = await prisma.match.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    include: {
      userA: { include: { profile: true, astrologyProfile: true } },
      userB: { include: { profile: true, astrologyProfile: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  // Unread message notification counts per match
  const unreadNotifs = await prisma.notification.findMany({
    where: { userId, type: "new_message", read: false },
    select: { relatedId: true },
  });
  const unreadMap: Record<string, number> = {};
  for (const n of unreadNotifs) {
    if (n.relatedId) unreadMap[n.relatedId] = (unreadMap[n.relatedId] ?? 0) + 1;
  }

  const conversations = matches
    .map((m) => {
      const other = m.userAId === userId ? m.userB : m.userA;
      if (!other.profile || !other.astrologyProfile) return null;
      const last = m.messages[0] ?? null;
      return {
        matchId: m.id,
        matchScore: Math.round(m.matchScore),
        otherUser: {
          id: other.id,
          name: other.profile.name,
          avatarUrl: other.profile.avatarUrl ?? null,
          sunSign: other.astrologyProfile.sunSign,
        },
        lastMessage: last
          ? {
              content: last.content,
              createdAt: last.createdAt.toISOString(),
              isMine: last.senderId === userId,
            }
          : null,
        unreadCount: unreadMap[m.id] ?? 0,
      };
    })
    .filter(Boolean);

  // Sort: conversations with messages first (by last message time), then by match creation
  conversations.sort((a, b) => {
    const ta = a!.lastMessage ? new Date(a!.lastMessage.createdAt).getTime() : 0;
    const tb = b!.lastMessage ? new Date(b!.lastMessage.createdAt).getTime() : 0;
    return tb - ta;
  });

  return NextResponse.json({ conversations });
}
