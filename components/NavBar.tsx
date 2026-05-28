"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Compass, Heart, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShootingStarLogo } from "@/components/ui/shooting-star-logo";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/matches", label: "Matches", icon: Heart },
  { href: "/profile", label: "Profile", icon: User },
];

export function NavBar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-100">
      <nav className="mx-auto max-w-5xl flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/discover" className="flex items-center gap-2 group">
          <ShootingStarLogo size={18} className="text-stone-700" />
          <span className="font-serif text-lg font-semibold text-stone-900 tracking-tight">StarCross</span>
        </Link>

        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-stone-100 text-stone-900 border border-stone-200"
                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-stone-500 hover:text-stone-900 hover:bg-stone-50 gap-1.5"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </nav>
    </header>
  );
}
