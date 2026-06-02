import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { sendReportEmail } from "@/lib/email";

interface SessionUser {
  id?: string;
}

const VALID_REASONS = [
  "spam",
  "harassment",
  "fake_profile",
  "inappropriate_content",
  "underage",
  "other",
] as const;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const reporterId = (session?.user as SessionUser)?.id;
    if (!reporterId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reportedUserId, reason, details } = body as {
      reportedUserId?: string;
      reason?: string;
      details?: string;
    };

    if (!reportedUserId || typeof reportedUserId !== "string") {
      return NextResponse.json({ error: "reportedUserId is required" }, { status: 400 });
    }
    if (!reason || !(VALID_REASONS as readonly string[]).includes(reason)) {
      return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
    }
    if (reportedUserId === reporterId) {
      return NextResponse.json({ error: "You cannot report yourself" }, { status: 400 });
    }

    // Verify the reported user exists
    const reportedUser = await prisma.user.findUnique({
      where: { id: reportedUserId },
      select: { id: true, email: true, profile: { select: { name: true } } },
    });
    if (!reportedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent duplicate open reports from the same reporter against the same user
    const existing = await prisma.report.findFirst({
      where: { reporterId, reportedId: reportedUserId, resolved: false },
    });
    if (existing) {
      // Silently succeed — don't let the reporter know if they've already filed
      return NextResponse.json({ ok: true });
    }

    await prisma.report.create({
      data: {
        reporterId,
        reportedId: reportedUserId,
        reason,
        details: details?.trim() || null,
      },
    });

    // Fetch reporter info for the email
    const reporter = await prisma.user.findUnique({
      where: { id: reporterId },
      select: { email: true, profile: { select: { name: true } } },
    });

    // Fire-and-forget admin email notification
    void sendReportEmail({
      reporterEmail: reporter?.email ?? "unknown",
      reporterName:  reporter?.profile?.name ?? "Unknown user",
      reportedEmail: reportedUser.email,
      reportedName:  reportedUser.profile?.name ?? "Unknown user",
      reportedUserId: reportedUser.id,
      reason,
      details: details?.trim() || null,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Report error:", message);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}
