import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const url = process.env.DATABASE_URL ?? "NOT SET";
  const host = url.split("?")[0]; // strip auth token before logging
  try {
    const count = await prisma.user.count();
    return NextResponse.json({ host, userCount: count });
  } catch (e) {
    return NextResponse.json({ host, error: String(e) });
  }
}
