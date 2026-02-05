import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "dc-badge",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-[#A30A2B] text-white hover:bg-[#A30A2B]/80",
        outline: "text-foreground",
        success: "border-transparent bg-[#729128] text-white",
        warning: "border-transparent bg-[#C88500] text-white",
        info: "border-transparent bg-[#708DC9] text-white",
        muted: "border-transparent bg-[#333333]/15 text-[#333333]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
