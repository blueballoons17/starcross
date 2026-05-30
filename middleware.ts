import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that require an active subscription
const PROTECTED_ROUTES = ["/discover", "/matches", "/messages", "/astrology", "/profile", "/chat"];

// Public routes that never redirect
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/pricing", "/api", "/_next", "/favicon", "/public"];

function isProtected(pathname: string): boolean {
  return PROTECTED_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

function isPublic(pathname: string): boolean {
  return PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/") || pathname.startsWith(r));
}

function isSubscriptionActive(
  status: string | null | undefined,
  periodEnd: string | null | undefined
): boolean {
  if (!status) return false;
  if (status === "active" || status === "trialing") return true;
  if (status === "canceled" && periodEnd) {
    return new Date(periodEnd) > new Date();
  }
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let public routes and API routes through
  if (isPublic(pathname)) return NextResponse.next();
  // Only apply subscription gate to protected app routes
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

  // Logged in but no active subscription → send to pricing
  const subStatus = token.subscriptionStatus as string | null | undefined;
  const subEnd = token.subscriptionCurrentPeriodEnd as string | null | undefined;

  if (!isSubscriptionActive(subStatus, subEnd)) {
    return NextResponse.redirect(new URL("/pricing", request.url));
  }

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
