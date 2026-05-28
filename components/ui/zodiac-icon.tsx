import { cn } from "@/lib/utils";

// Minimal SVG glyph paths for each zodiac sign (24×24 viewBox)
const PATHS: Record<string, React.ReactNode> = {
  Aries: (
    // Two curved horns meeting at a central descending point
    <path
      d="M 4 17 C 4 7 12 9 12 13 C 12 9 20 7 20 17"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    />
  ),

  Taurus: (
    // Circle with two upward-curving horns
    <>
      <circle cx="12" cy="15" r="6" fill="none" stroke="currentColor" strokeWidth="1.8"/>
      <path
        d="M 6.5 11 C 5 6 2 4 4 2 M 17.5 11 C 19 6 22 4 20 2"
        fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      />
    </>
  ),

  Gemini: (
    // Two vertical bars with top & bottom cross-bars
    <>
      <line x1="8" y1="4" x2="8" y2="20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="16" y1="4" x2="16" y2="20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="4" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="4" y1="17" x2="20" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </>
  ),

  Cancer: (
    // Two crescent arcs facing opposite directions
    <>
      <path
        d="M 5 9 A 6 4.5 0 1 1 19 9"
        fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      />
      <path
        d="M 5 15 A 6 4.5 0 1 0 19 15"
        fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      />
    </>
  ),

  Leo: (
    // Open spiral ending in a small circle
    <>
      <path
        d="M 4 8 C 4 3 20 3 20 9 C 20 14 15 16 12 16"
        fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      />
      <circle cx="9" cy="18" r="3" fill="none" stroke="currentColor" strokeWidth="1.8"/>
    </>
  ),

  Virgo: (
    // Three humps → right side descends with a backward loop
    <path
      d="M 3 14 C 3 6 8 6 8 11 C 8 6 13 6 13 11 C 13 6 20 6 20 11 L 20 19 Q 20 22 17 21 Q 14 20 15 17"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    />
  ),

  Libra: (
    // Flat baseline with an arc resting above it
    <>
      <line x1="3" y1="17" x2="21" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path
        d="M 7 17 A 5 5 0 0 1 17 17"
        fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      />
    </>
  ),

  Scorpio: (
    // Three humps left-to-right, final stroke becomes an arrow tail
    <path
      d="M 3 14 C 3 7 7.5 7 7.5 12 C 7.5 7 12 7 12 12 C 12 7 17 7 20 10 L 17 7 M 20 10 L 17 13"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    />
  ),

  Sagittarius: (
    // Diagonal arrow ↗ with tick marks on the shaft
    <>
      <line x1="4" y1="20" x2="20" y2="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <polyline
        points="11,4 20,4 20,13"
        fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
    </>
  ),

  Capricorn: (
    // A V where the right arm curls into a small backward loop
    <path
      d="M 3 6 L 11 18 L 20 7 L 20 15 A 4.5 4.5 0 0 1 11 15"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    />
  ),

  Aquarius: (
    // Two parallel wavy lines (water waves)
    <>
      <path
        d="M 3 9 C 6 5 9 13 12 9 C 15 5 18 13 21 9"
        fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      />
      <path
        d="M 3 15 C 6 11 9 19 12 15 C 15 11 18 19 21 15"
        fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      />
    </>
  ),

  Pisces: (
    // Two arcs facing opposite directions, connected by a centre horizontal line
    <>
      <path
        d="M 12 3 C 4 3 4 12 4 12 C 4 12 4 21 12 21"
        fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      />
      <path
        d="M 12 3 C 20 3 20 12 20 12 C 20 12 20 21 12 21"
        fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      />
      <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </>
  ),
};

interface ZodiacIconProps {
  sign: string;
  /** Size of the circular container in px (default 28) */
  size?: number;
  className?: string;
}

/**
 * A circular grey icon containing a minimal SVG glyph for the zodiac sign.
 * No emoji, no unicode — just a clean line drawing.
 */
export function ZodiacIcon({ sign, size = 28, className }: ZodiacIconProps) {
  const path = PATHS[sign];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-stone-100 border border-stone-200 shrink-0",
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.62}
        height={size * 0.62}
        className="text-stone-500"
        aria-label={sign}
      >
        {path}
      </svg>
    </span>
  );
}

/** Dark variant for use on dark backgrounds */
export function ZodiacIconDark({ sign, size = 28, className }: ZodiacIconProps) {
  const path = PATHS[sign];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-stone-800 border border-stone-700 shrink-0",
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.62}
        height={size * 0.62}
        className="text-stone-400"
        aria-label={sign}
      >
        {path}
      </svg>
    </span>
  );
}
