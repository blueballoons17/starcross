"use client";
import { cn } from "@/lib/utils";

/**
 * StarCross logo — two stars (primary + secondary) connected by a
 * subtle dashed arc, evoking a crossing of celestial paths.
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
      viewBox="0 0 22 22"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      {/* Orbit arc connecting the two stars */}
      <path
        d="M 6.2 14.8 Q 11.5 7.2 16.8 6.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.55"
        strokeLinecap="round"
        strokeDasharray="1.3 2.1"
        opacity="0.38"
      >
        <animate
          attributeName="opacity"
          values="0.38;0.65;0.38"
          dur="4s"
          repeatCount="indefinite"
        />
      </path>

      {/* Primary 4-pointed star — upper right */}
      <path
        d="M 15.8 2.5 L 17.0 6.8 L 21.2 7.4 L 17.0 8.0 L 15.8 12.3 L 14.6 8.0 L 10.4 7.4 L 14.6 6.8 Z"
        fill="currentColor"
      >
        <animate
          attributeName="opacity"
          values="1;0.78;1"
          dur="4s"
          repeatCount="indefinite"
        />
      </path>

      {/* Sparkle dot at the tip of the primary star */}
      <circle cx="15.8" cy="2.5" r="0.75" fill="currentColor" opacity="0.85">
        <animate
          attributeName="r"
          values="0.75;1.2;0.75"
          dur="4s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Secondary smaller star — lower left */}
      <path
        d="M 4.8 13.8 L 5.6 16.1 L 8.2 16.6 L 5.6 17.1 L 4.8 19.4 L 4.0 17.1 L 1.4 16.6 L 4.0 16.1 Z"
        fill="currentColor"
        opacity="0.62"
      >
        <animate
          attributeName="opacity"
          values="0.62;0.88;0.62"
          dur="4s"
          begin="0.6s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}
