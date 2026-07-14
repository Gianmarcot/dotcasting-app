import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "dc-btn",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm rounded-full",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm rounded-full",
        outline: "border border-input bg-card hover:bg-muted hover:text-foreground rounded-full",
        secondary: "border border-border bg-white/30 text-foreground hover:bg-white/50 hover:border-charcoal focus-visible:border-charcoal disabled:hover:border-border rounded-full",
        ghost: "hover:bg-muted hover:text-foreground rounded-full",
        link: "text-primary underline-offset-4 hover:underline",
        olive: "bg-olive text-olive-foreground hover:bg-olive/90 shadow-sm rounded-full",
        charcoal: "bg-charcoal text-charcoal-foreground hover:bg-charcoal/90 shadow-sm rounded-full",
        castingAction: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm rounded-full",
      },
      size: {
        // Text button heights: sm 36 · md 40 · lg 48
        sm: "h-9 px-4 text-sm",
        md: "h-10 px-6 text-sm [&_svg]:size-5",
        lg: "h-12 px-8 text-base [&_svg]:size-5",
        // Icon-only (square)
        "icon-sm": "h-9 w-9 p-0",
        "icon-md": "h-10 w-10 p-0 [&_svg]:size-5",
        "icon-lg": "h-12 w-12 p-0 [&_svg]:size-5",
        // Aliases (backwards compat)
        default: "h-10 px-6 text-sm",
        xl: "h-12 px-10 text-base",
        icon: "h-10 w-10 p-0",
      },
      iconPosition: {
        none: "",
        left: "pl-4 pr-6",
        right: "pl-6 pr-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      iconPosition: "none",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, iconPosition, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, iconPosition, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
