import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface SessionUser { id?: string }

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const reviewerId = (session?.user as SessionUser)?.id;
    if (!reviewerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reviewedUserId, rating, comment } = body as {
      reviewedUserId?: string;
      rating?: number;
      comment?: string;
    };

    if (!reviewedUserId || typeof reviewedUserId !== "string") {
      return NextResponse.json({ error: "reviewedUserId is required" }, { status: 400 });
    }
    if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "rating must be 1–5" }, { status: 400 });
    }
    if (reviewedUserId === reviewerId) {
      return NextResponse.json({ error: "You cannot review yourself" }, { status: 400 });
    }

    // Enforce: reviewer must have matched with the reviewed user
    const match = await prisma.match.findFirst({
      where: {
        OR: [
          { userAId: reviewerId, userBId: reviewedUserId },
          { userAId: reviewedUserId, userBId: reviewerId },
        ],
      },
    });
    if (!match) {
      return NextResponse.json({ error: "You can only review people you have matched with" }, { status: 403 });
    }

    // Sanitise comment: strip excessive whitespace, hard-cap at 300 chars
    const cleanComment = comment?.trim().slice(0, 300) || null;

    // Upsert — one review per pair, updateable
    await prisma.review.upsert({
      where: { reviewerId_reviewedId: { reviewerId, reviewedId: reviewedUserId } },
      create: { reviewerId, reviewedId: reviewedUserId, rating, comment: cleanComment },
      update: { rating, comment: cleanComment },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Review error:", message);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
