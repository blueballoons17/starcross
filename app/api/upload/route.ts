import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface SessionUser {
  id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as SessionUser)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP and GIF images are allowed." },
        { status: 400 }
      );
    }

    // 8 MB max (after client-side compression this is rarely hit)
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 8 MB." }, { status: 400 });
    }

    const ext = file.type === "image/webp" ? "webp"
      : file.type === "image/png" ? "png"
      : file.type === "image/gif" ? "gif"
      : "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import("@vercel/blob");
      const blob = await put(`uploads/${userId}/${filename}`, file, {
        access: "public",
        contentType: file.type,
      });
      return NextResponse.json({ url: blob.url });
    } else if (process.env.NODE_ENV === "development") {
      const { writeFile, mkdir } = await import("fs/promises");
      const { join } = await import("path");
      const dir = join(process.cwd(), "public", "uploads", userId);
      await mkdir(dir, { recursive: true });
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(join(dir, filename), buffer);
      return NextResponse.json({ url: `/uploads/${userId}/${filename}` });
    } else {
      return NextResponse.json(
        { error: "Photo storage is not configured yet — please set up Vercel Blob." },
        { status: 503 }
      );
    }
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
