import * as React from "react";
import { cn } from "./utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glass, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-zinc-800 bg-zinc-900/80",
        glass && "bg-white/5 backdrop-blur-xl border-white/10",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";
