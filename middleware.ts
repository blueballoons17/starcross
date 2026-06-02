import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that require login (but NOT a paid subscription — free tier can access these)
const PROTECTED_ROUTES = ["/discover", "/matches", "/messages", "/astrology", "/profile", "/chat"];

// Public routes that never redirect
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/pricing", "/api", "/_next", "/favicon", "/public"];

function isProtected(pathname: string): boolean {
  return PROTECTED_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

function isPublic(pathname: string): boolean {
  return PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/") || pathname.startsWith(r));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let public routes and API routes through
  if (isPublic(pathname)) return NextResponse.next();
  // Only apply login gate to protected app routes
  if (!isProtected(pathname)) return NextResponse.next();

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Not logged in → send to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged in (free or paid) → let through; limits enforced at the API level
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/discover/:path*",
    "/matches/:path*",
    "/messages/:path*",
    "/astrology/:path*",
    "/profile/:path*",
    "/chat/:path*",
  ],
};
