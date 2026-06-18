import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";
import { registerLimiter } from "@/lib/rate-limit";

// ── Unique referral code generator ───────────────────────────────────────────

async function generateUniqueReferralCode(): Promise<string> {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars (I/1/0/O)
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    const existing = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  // Fallback: timestamp-based code (essentially impossible collision)
  return Date.now().toString(36).toUpperCase().slice(-8).padStart(8, "0");
}

// ── POST /api/auth/register ──────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  if (await registerLimiter.isLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute." },
      { status: 429 }
    );
  }

  let body: { email?: string; password?: string; referralCode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { email, password, referralCode: incomingRef } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);

  // Generate a unique referral code for the new user
  const newUserReferralCode = await generateUniqueReferralCode();

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      referralCode: newUserReferralCode,
    },
  });

  // If a valid referral code was supplied, create the referral record
  if (incomingRef && typeof incomingRef === "string") {
    const referrer = await prisma.user.findUnique({
      where: { referralCode: incomingRef.toUpperCase() },
      select: { id: true },
    });
    if (referrer && referrer.id !== user.id) {
      // upsert to be safe against double-registration edge cases
      await prisma.referral.upsert({
        where: { referredUserId: user.id },
        create: {
          referrerId: referrer.id,
          referredUserId: user.id,
        },
        update: {}, // already exists — no-op
      });
    }
  }

  // Send welcome email — fire-and-forget, never block registration
  sendWelcomeEmail(user.email, undefined, user.referralCode ?? undefined).catch(() => {});

  return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
}
