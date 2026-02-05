import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "dc-btn",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm h-10 px-4 py-2",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm h-10 px-4 py-2",
        outline: "border border-input bg-card hover:bg-muted hover:text-foreground h-10 px-4 py-2",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm h-10 px-4 py-2",
        ghost: "hover:bg-muted hover:text-foreground h-10 px-4 py-2",
        link: "text-primary underline-offset-4 hover:underline h-10 px-4 py-2",
        olive: "bg-olive text-olive-foreground hover:bg-olive/90 shadow-sm h-10 px-4 py-2",
        charcoal: "bg-charcoal text-charcoal-foreground hover:bg-charcoal/90 shadow-sm h-10 px-4 py-2",
        castingAction: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-sm px-6 h-10 py-2",
      },
      size: {
        default: "",
        sm: "dc-btn-sm",
        lg: "dc-btn-lg",
        xl: "dc-btn-xl",
        icon: "dc-btn-icon",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
