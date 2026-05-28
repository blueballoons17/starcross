import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-stone-900 text-white",
        secondary:
          "border-stone-200 bg-stone-100 text-stone-600",
        outline:
          "border-stone-200 text-stone-600 bg-transparent",
        success:
          "border-transparent bg-emerald-100 text-emerald-700 border-emerald-200",
        warning:
          "border-transparent bg-amber-100 text-amber-700 border-amber-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
