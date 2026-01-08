import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.96] hover:-translate-y-0.5",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 shadow-md shadow-primary/20 focus-visible:ring-primary/50",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-lg hover:shadow-destructive/25 shadow-md shadow-destructive/20 focus-visible:ring-destructive/50",
        outline: "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/40 hover:shadow-md focus-visible:border-primary/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md shadow-sm focus-visible:ring-secondary/50",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:shadow-sm focus-visible:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80 focus-visible:text-primary/80 hover:translate-y-0",
        hero: "bg-gradient-to-r from-primary via-secondary/80 to-primary text-primary-foreground shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:scale-[1.03] hover:-translate-y-1 hover:brightness-110 active:scale-[0.97] focus-visible:ring-primary/50 bg-[length:200%_100%] hover:bg-right transition-all duration-500",
        glass: "bg-card/60 backdrop-blur-md border-2 border-border/50 hover:bg-card/80 hover:border-primary/40 hover:shadow-lg focus-visible:border-primary/50",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-4",
        lg: "h-13 rounded-xl px-10 text-base",
        icon: "h-11 w-11 rounded-xl",
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
