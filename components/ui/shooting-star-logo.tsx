"use client";
import { cn } from "@/lib/utils";

/**
 * A small animated shooting-star SVG to replace the plain star logo.
 * The tail periodically "flies" — repeating every ~4 s.
 */
export function ShootingStarLogo({
  className,
  size = 18,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      {/* ── Tail / streak (three parallel lines, tapering) ── */}
      <line
        x1="2" y1="18" x2="11" y2="9"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"
        opacity="0.45"
      >
        <animate
          attributeName="opacity"
          values="0.45;0.75;0.45"
          dur="3.5s"
          repeatCount="indefinite"
        />
      </line>
      <line
        x1="3" y1="19.5" x2="9" y2="14"
        stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"
        opacity="0.22"
      >
        <animate
          attributeName="opacity"
          values="0.22;0.4;0.22"
          dur="3.5s"
          begin="0.1s"
          repeatCount="indefinite"
        />
      </line>

      {/* ── Star body (4-pointed diamond star) ── */}
      <path
        d="M 14 3 L 15.3 7.5 L 20 8.5 L 15.3 9.5 L 14 14 L 12.7 9.5 L 8 8.5 L 12.7 7.5 Z"
        fill="currentColor"
      >
        {/* Glint pulse */}
        <animate
          attributeName="opacity"
          values="1;0.7;1"
          dur="3.5s"
          repeatCount="indefinite"
        />
      </path>

      {/* ── Tiny sparkle at tip of star ── */}
      <circle cx="14" cy="3.5" r="0.9" fill="currentColor" opacity="0.7">
        <animate
          attributeName="r"
          values="0.9;1.4;0.9"
          dur="3.5s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}
