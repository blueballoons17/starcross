import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface SessionUser {
  id?: string;
  email?: string | null;
}

const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ?? "blueballoons17@gmail.com";

function isAdmin(email?: string | null) {
  return email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

// GET /api/admin/reports — list all reports (newest first)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdmin((session?.user as SessionUser)?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: {
        select: {
          email: true,
          profile: { select: { name: true, birthDate: true } },
        },
      },
      reported: {
        select: {
          id: true,
          email: true,
          profile: { select: { name: true, birthDate: true } },
        },
      },
    },
  });

  return NextResponse.json({ reports });
}

// PATCH /api/admin/reports — toggle resolved on a report
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin((session?.user as SessionUser)?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { reportId, resolved } = (await request.json()) as {
    reportId?: string;
    resolved?: boolean;
  };

  if (!reportId || typeof resolved !== "boolean") {
    return NextResponse.json({ error: "reportId and resolved are required" }, { status: 400 });
  }

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: { resolved },
  });

  return NextResponse.json({ report: updated });
}

// DELETE /api/admin/reports — delete a report
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin((session?.user as SessionUser)?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { reportId } = (await request.json()) as { reportId?: string };
  if (!reportId) {
    return NextResponse.json({ error: "reportId is required" }, { status: 400 });
  }

  await prisma.report.delete({ where: { id: reportId } });
  return NextResponse.json({ ok: true });
}
