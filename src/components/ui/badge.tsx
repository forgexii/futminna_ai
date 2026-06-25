import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        violet: "bg-violet-100 text-violet-700",
        emerald: "bg-emerald-100 text-emerald-600",
        gold: "bg-gold-100 text-gold-600",
        rose: "bg-rose-500/10 text-rose-500",
        neutral: "bg-warmgray-100 text-warmgray-600",
        outline: "border border-warmgray-200 text-ink",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
