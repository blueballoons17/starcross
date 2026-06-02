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

    // 8 MB max
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 8 MB." }, { status: 400 });
    }

    // Verify actual file content via magic bytes — client-supplied MIME is spoofable
    const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const isJpeg = header[0] === 0xff && header[1] === 0xd8;
    const isPng  = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47;
    const isWebp = header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50;
    const isGif  = header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46;
    if (!isJpeg && !isPng && !isWebp && !isGif) {
      return NextResponse.json({ error: "File content does not match a supported image format." }, { status: 400 });
    }

    const ext = isPng ? "png" : isWebp ? "webp" : isGif ? "gif" : "jpg";
    const filename = `${crypto.randomUUID()}.${ext}`;
    const key = `uploads/${userId}/${filename}`;

    // ── 1. Cloudflare R2 (preferred — 10 GB free, zero egress fees) ────────────
    if (
      process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_PUBLIC_URL
    ) {
      const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
      const r2 = new S3Client({
        region: "auto",
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
      });
      const buffer = Buffer.from(await file.arrayBuffer());
      await r2.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: file.type,
          // cache for 1 year — photos are immutable (UUID filenames)
          CacheControl: "public, max-age=31536000, immutable",
        })
      );
      const publicUrl = process.env.R2_PUBLIC_URL.replace(/\/$/, "");
      return NextResponse.json({ url: `${publicUrl}/${key}` });
    }

    // ── 2. Vercel Blob (fallback if already configured) ────────────────────────
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import("@vercel/blob");
      const blob = await put(key, file, {
        access: "public",
        contentType: file.type,
      });
      return NextResponse.json({ url: blob.url });
    }

    // ── 3. Local filesystem (development only) ─────────────────────────────────
    if (process.env.NODE_ENV === "development") {
      const { writeFile, mkdir } = await import("fs/promises");
      const { join } = await import("path");
      const dir = join(process.cwd(), "public", "uploads", userId);
      await mkdir(dir, { recursive: true });
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(join(dir, filename), buffer);
      return NextResponse.json({ url: `/uploads/${userId}/${filename}` });
    }

    return NextResponse.json(
      { error: "Photo storage is not configured. Add R2 credentials to environment variables." },
      { status: 503 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Upload error:", message);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
