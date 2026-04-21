import * as React from "react";
import { cn } from "./utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      primary: "bg-emerald-500 text-white hover:bg-emerald-600 focus-visible:ring-emerald-500 shadow-lg shadow-emerald-500/25",
      secondary: "bg-zinc-800 text-white hover:bg-zinc-700 focus-visible:ring-zinc-500",
      ghost: "text-zinc-300 hover:bg-zinc-800 hover:text-white focus-visible:ring-zinc-500",
      danger: "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500",
      outline: "border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-5 text-sm",
      lg: "h-12 px-8 text-base",
    };

    return (
      <button
        ref={ref}
        disabled={disabled ?? isLoading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading…
          </>
        ) : children}
      </button>
    );
  }
);
Button.displayName = "Button";
