import { NextRequest, NextResponse } from "next/server";

// Proxy face portraits from randomuser.me through our own origin so canvas
// drawImage never hits a CORS taint. Images are edge-cached for 24 h.
export const runtime = "edge";

const ALLOWED_WOMEN = new Set([2,14,25,27,31,33,45,63,64,65,83,85]);
const ALLOWED_MEN   = new Set([5,7,22,25,29,30,31,38,54,65,85,90]);

export async function GET(req: NextRequest) {
  const gender = req.nextUrl.searchParams.get("gender") ?? "";
  const num    = parseInt(req.nextUrl.searchParams.get("num") ?? "-1", 10);

  const valid =
    (gender === "women" && ALLOWED_WOMEN.has(num)) ||
    (gender === "men"   && ALLOWED_MEN.has(num));

  if (!valid) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const upstream = await fetch(
      `https://randomuser.me/api/portraits/${gender}/${num}.jpg`
    );
    if (!upstream.ok) throw new Error(`upstream ${upstream.status}`);

    const buffer = await upstream.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("[avatar proxy]", err);
    return new NextResponse("Bad gateway", { status: 502 });
  }
}
