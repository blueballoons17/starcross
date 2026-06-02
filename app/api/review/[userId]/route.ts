import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface SessionUser { id?: string }

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const session = await getServerSession(authOptions);
  const viewerId = (session?.user as SessionUser)?.id;

  const reviews = await prisma.review.findMany({
    where: { reviewedId: userId },
    orderBy: { updatedAt: "desc" },
  });

  const count = reviews.length;
  const averageRating = count > 0
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
    : null;

  // Public comments: anonymous, non-empty, max 5 most recent
  const comments = reviews
    .filter((r) => r.comment && r.comment.trim())
    .slice(0, 5)
    .map((r) => r.comment as string);

  // Viewer's own review of this user (if logged in)
  const myReview = viewerId
    ? (reviews.find((r) => r.reviewerId === viewerId) ?? null)
    : null;

  return NextResponse.json({
    averageRating,
    count,
    comments,
    myReview: myReview
      ? { rating: myReview.rating, comment: myReview.comment }
      : null,
  });
}
