"use client";
import { cn } from "@/lib/utils";

/**
 * Kindred Stars logo — two four-pointed diamond stars (primary + secondary)
 * connected by a delicate orbital arc, representing two celestial paths crossing.
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
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      {/* Orbital arc — thin, dashed, suggesting the crossing trajectory */}
      <path
        d="M 13 10.5 Q 10.2 13 9 15.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.45"
        strokeLinecap="round"
        strokeDasharray="1.4 2.2"
        opacity="0.32"
      >
        <animate
          attributeName="opacity"
          values="0.32;0.55;0.32"
          dur="6s"
          repeatCount="indefinite"
        />
      </path>

      {/* Primary star — upper right, center (15.5, 7.5), r=5.5/1.5 */}
      <path
        d="M 15.5 2 L 16.6 6.4 L 21 7.5 L 16.6 8.6 L 15.5 13 L 14.4 8.6 L 10 7.5 L 14.4 6.4 Z"
        fill="currentColor"
      >
        <animate
          attributeName="opacity"
          values="1;0.8;1"
          dur="6s"
          repeatCount="indefinite"
        />
      </path>

      {/* Secondary star — lower left, center (7.5, 16.5), r=3/0.9 */}
      <path
        d="M 7.5 13.5 L 8.1 15.9 L 10.5 16.5 L 8.1 17.1 L 7.5 19.5 L 6.9 17.1 L 4.5 16.5 L 6.9 15.9 Z"
        fill="currentColor"
        opacity="0.55"
      >
        <animate
          attributeName="opacity"
          values="0.55;0.82;0.55"
          dur="6s"
          begin="1s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}
