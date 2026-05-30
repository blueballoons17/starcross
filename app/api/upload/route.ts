import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import sharp from "sharp";

interface SessionUser {
  id?: string;
}

// Compress & convert to WebP before storing.
// Max dimension 1200px (preserves aspect ratio), quality 82 — typically 50-70% smaller.
async function compress(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
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

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 8 MB." }, { status: 400 });
    }

    // Compress the image
    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const compressed = await compress(rawBuffer);

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Production: Vercel Blob
      const { put } = await import("@vercel/blob");
      const blob = await put(`uploads/${userId}/${filename}`, compressed, {
        access: "public",
        contentType: "image/webp",
      });
      return NextResponse.json({ url: blob.url });
    } else if (process.env.NODE_ENV === "development") {
      // Local dev only
      const { writeFile, mkdir } = await import("fs/promises");
      const { join } = await import("path");
      const dir = join(process.cwd(), "public", "uploads", userId);
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, filename), compressed);
      return NextResponse.json({ url: `/uploads/${userId}/${filename}` });
    } else {
      return NextResponse.json(
        { error: "Photo storage is not configured. Please add BLOB_READ_WRITE_TOKEN to environment variables." },
        { status: 503 }
      );
    }
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
