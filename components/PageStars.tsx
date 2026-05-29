"use client";
import { StarField } from "@/components/ui/star-field";

/**
 * Drop this as the first element inside any page that needs the star background.
 * Rendering it INSIDE the page (rather than in the root layout) puts it in the
 * same compositor layer as the page content so stars punch through transparent areas.
 */
export function PageStars({ count = 220 }: { count?: number }) {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <StarField count={count} />
    </div>
  );
}
