"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Compass, Heart, MessageCircle, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/NotificationBell";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/discover",  label: "Discover",   icon: Compass        },
  { href: "/matches",   label: "Matches",    icon: Heart          },
  { href: "/messages",  label: "Messages",   icon: MessageCircle  },
  { href: "/astrology", label: "Astrology",  icon: Sparkles       },
  { href: "/profile",   label: "Profile",    icon: User           },
];

export function NavBar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetch("/api/user/status")
      .then((r) => r.json())
      .then((d) => { if (d.isPremium) setIsPremium(true); })
      .catch(() => {});
  }, [session]);

  if (!session) return null;

  // On focused full-screen views (open chat / match detail) hide the mobile tab bar
  // so it doesn't compete with back buttons or obscure conversation content.
  const isFocusedView =
    /^\/messages\/[^/]/.test(pathname) ||
    /^\/matches\/[^/]/.test(pathname);

  function isActive(href: string) {
    return (
      pathname === href ||
      (href === "/messages" && pathname.startsWith("/messages")) ||
      (href === "/matches"  && pathname.startsWith("/matches"))  ||
      (href === "/astrology" && pathname.startsWith("/astrology"))
    );
  }

  return (
    <>
      {/* ── Top bar (all screen sizes) ──────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-stone-950/70 backdrop-blur-xl border-b border-white/8">
        <nav className="mx-auto max-w-5xl flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Wordmark */}
          <Link href="/" className="flex items-center group">
            <span
              className="text-xl font-semibold text-white tracking-[0.28em]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              kindred stars
            </span>
          </Link>

          {/* Desktop nav links — hidden on mobile (bottom tab bar used instead) */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-3 py-1.5 text-sm font-bold tracking-wide transition-colors duration-150",
                  isActive(href) ? "text-white" : "text-stone-400 hover:text-stone-100"
                )}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {!isPremium && (
              <Link
                href="/pricing"
                className="hidden sm:inline-flex items-center px-2.5 py-1 text-xs font-medium text-stone-500 hover:text-stone-200 transition-colors border border-stone-700/60 hover:border-stone-500/60 rounded-full"
                style={{ fontFamily: "var(--font-inter)", letterSpacing: "0.08em" }}
              >
                +
              </Link>
            )}
            <NotificationBell />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-stone-400 hover:text-white hover:bg-white/8 gap-1.5"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </nav>
      </header>

      {/* ── Mobile bottom tab bar ───────────────────────────────────────── */}
      {!isFocusedView && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-950/80 backdrop-blur-xl border-t border-white/8">
          {/* Tab buttons — fixed 64 px tall */}
          <div className="flex h-16">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-150",
                    active ? "text-white" : "text-stone-500 hover:text-stone-300"
                  )}
                >
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={active ? 2.5 : 1.75}
                  />
                  <span className="text-[10px] font-medium tracking-wide leading-none">
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
          {/* Safe-area spacer — fills the iPhone home indicator region */}
          <div
            className="bg-stone-950/80"
            style={{ height: "env(safe-area-inset-bottom, 0px)" }}
          />
        </nav>
      )}
    </>
  );
}
