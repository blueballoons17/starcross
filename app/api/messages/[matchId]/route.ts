import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { messageLimiter } from "@/lib/rate-limit";

interface SessionUser {
  id?: string;
}

// GET /api/messages/[matchId], fetch all messages for a match
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as SessionUser)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { matchId } = await params;

  // Verify the requesting user is part of this match
  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      OR: [{ userAId: userId }, { userBId: userId }],
    },
  });
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const messages = await prisma.message.findMany({
    where: { matchId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: {
        select: {
          id: true,
          profile: { select: { name: true, avatarUrl: true } },
        },
      },
    },
  });

  return NextResponse.json({ messages });
}

// POST /api/messages/[matchId], send a message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as SessionUser)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate-limit: 30 messages per minute per user
  if (await messageLimiter.isLimited(userId)) {
    return NextResponse.json({ error: "Slow down, too many messages." }, { status: 429 });
  }

  const { matchId } = await params;

  const body = await req.json();
  const content = (body.content ?? "").trim();
  if (!content) return NextResponse.json({ error: "Empty message" }, { status: 400 });
  if (content.length > 2000) return NextResponse.json({ error: "Too long" }, { status: 400 });

  // Verify the requesting user is part of this match
  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      OR: [{ userAId: userId }, { userBId: userId }],
    },
  });
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const message = await prisma.message.create({
    data: { matchId, senderId: userId, content },
    include: {
      sender: {
        select: {
          id: true,
          profile: { select: { name: true, avatarUrl: true } },
        },
      },
    },
  });

  // Notify the OTHER person in the match
  const recipientId = match.userAId === userId ? match.userBId : match.userAId;
  const senderName = message.sender.profile?.name ?? "Someone";
  const preview = content.length > 60 ? content.slice(0, 57) + "…" : content;

  await prisma.notification.create({
    data: {
      userId: recipientId,
      type: "new_message",
      title: `New message from ${senderName}`,
      body: preview,
      relatedId: matchId,
    },
  });

  return NextResponse.json({ message });
}
