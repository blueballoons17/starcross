import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface SessionUser { id?: string; }

// Mark all new_message notifications for a specific matchId as read
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as SessionUser)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { matchId } = await req.json().catch(() => ({}));
  if (!matchId) return NextResponse.json({ error: "matchId required" }, { status: 400 });

  await prisma.notification.updateMany({
    where: { userId, type: "new_message", relatedId: matchId, read: false },
    data: { read: true },
  });

  return NextResponse.json({ ok: true });
}
