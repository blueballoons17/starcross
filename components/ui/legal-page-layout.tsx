"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

// ── Shared typography components ────────────────────────────────────────────

export function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif text-xl font-semibold text-stone-900 mt-12 mb-4 pb-2 border-b border-stone-100">
      {children}
    </h2>
  );
}

export function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-semibold text-stone-700 text-sm mt-6 mb-2">{children}</h3>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-stone-600 text-sm leading-relaxed mb-3">{children}</p>;
}

export function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5 text-stone-600 text-sm leading-relaxed mb-4">
      {children}
    </ul>
  );
}

// ── Shared page header ──────────────────────────────────────────────────────

export function LegalHeader() {
  const router = useRouter();
  return (
    <header className="bg-[#faf8f4]/95 backdrop-blur border-b border-stone-100 sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-medium text-stone-700 tracking-[0.28em]"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          kindred stars
        </Link>
        <button
          onClick={() => router.back()}
          className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
        >
          ← Back
        </button>
      </div>
    </header>
  );
}

// ── Shared footer ────────────────────────────────────────────────────────────

const FOOTER_LINKS = {
  Legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms",   label: "Terms of Service" },
    { href: "/cookies", label: "Cookie Policy" },
  ],
  Safety: [
    { href: "/safety",            label: "Safety Tips" },
    { href: "/safety/resources",  label: "Safety Resources" },
    { href: "/safety/features",   label: "Safety Features" },
    { href: "/safety/reporting",  label: "Reporting" },
  ],
  Company: [
    { href: "/pricing",                       label: "Pricing" },
    { href: "mailto:admin.kindredstars@gmail.com", label: "Contact" },
  ],
};

export function LegalFooter() {
  return (
    <footer className="border-t border-stone-100 bg-[#faf8f4] px-6 pt-14 pb-10 text-xs">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start gap-10 md:gap-16 mb-10">
          <div className="shrink-0">
            <Link
              href="/"
              className="text-sm font-medium text-stone-700 tracking-[0.28em] block mb-2"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              kindred stars
            </Link>
            <p className="text-stone-400 text-[11px] max-w-[160px] leading-relaxed">
              Astrology-based compatibility. Find your cosmic counterpart.
            </p>
          </div>

          <div className="flex flex-wrap gap-10 flex-1">
            {Object.entries(FOOTER_LINKS).map(([col, links]) => (
              <div key={col}>
                <p className="text-stone-400 font-semibold uppercase tracking-[0.14em] mb-3">{col}</p>
                <ul className="space-y-2.5">
                  {links.map(({ href, label }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="text-stone-500 hover:text-stone-800 transition-colors"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-stone-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-400 text-[11px]">
          <p>&copy; {new Date().getFullYear()} Alder Bridge Partners. Kindred Stars is a product of Alder Bridge Partners.</p>
          <p>Made with care for the cosmically curious.</p>
        </div>
      </div>
    </footer>
  );
}

// ── Dark footer — for in-app pages with dark/navy backgrounds ────────────────

export function AppFooter() {
  return (
    <footer className="relative z-20 border-t border-white/[0.07] px-6 pt-12 pb-10 text-xs" style={{ background: "#07091f" }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start gap-10 md:gap-16 mb-10">
          <div className="shrink-0">
            <Link
              href="/"
              className="text-sm font-medium text-stone-300 tracking-[0.28em] block mb-2"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              kindred stars
            </Link>
            <p className="text-stone-600 text-[11px] max-w-[160px] leading-relaxed">
              Astrology-based compatibility. Find your cosmic counterpart.
            </p>
          </div>

          <div className="flex flex-wrap gap-10 flex-1">
            {Object.entries(FOOTER_LINKS).map(([col, links]) => (
              <div key={col}>
                <p className="text-stone-500 font-semibold uppercase tracking-[0.14em] mb-3">{col}</p>
                <ul className="space-y-2.5">
                  {links.map(({ href, label }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="text-stone-500 hover:text-stone-300 transition-colors"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-600 text-[11px]">
          <p>&copy; {new Date().getFullYear()} Alder Bridge Partners. Kindred Stars is a product of Alder Bridge Partners.</p>
          <p>Made with care for the cosmically curious.</p>
        </div>
      </div>
    </footer>
  );
}
