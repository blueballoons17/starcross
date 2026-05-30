"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShootingStarLogo } from "@/components/ui/shooting-star-logo";
import { NotificationBell } from "@/components/NotificationBell";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/discover",  label: "Discover"  },
  { href: "/matches",   label: "Matches"   },
  { href: "/messages",  label: "Messages"  },
  { href: "/astrology", label: "Astrology" },
  { href: "/profile",   label: "Profile"   },
];

export function NavBar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-stone-950/70 backdrop-blur-xl border-b border-white/8">
      <nav className="mx-auto max-w-5xl flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <ShootingStarLogo size={18} className="text-indigo-300" />
          <span
            className="text-[13px] font-medium text-white uppercase tracking-[0.18em]"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            StarCross
          </span>
        </Link>

        <div className="flex items-center gap-0.5">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive =
              pathname === href ||
              (href === "/messages" && pathname.startsWith("/messages")) ||
              (href === "/astrology" && pathname.startsWith("/astrology"));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-3 py-1.5 text-sm font-bold tracking-wide transition-colors duration-150",
                  isActive
                    ? "text-white"
                    : "text-stone-400 hover:text-stone-100"
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/pricing"
            className="hidden sm:inline-flex items-center px-2.5 py-1 text-xs font-medium text-stone-500 hover:text-stone-200 transition-colors border border-stone-700/60 hover:border-stone-500/60 rounded-full"
            style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}
          >
            +
          </Link>
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
  );
}
