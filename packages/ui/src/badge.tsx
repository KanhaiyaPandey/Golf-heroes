import * as React from "react";
import { cn } from "./utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = "default", ...props }) => {
  const variants = {
    default: "bg-zinc-800 text-zinc-300",
    success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
    warning: "bg-amber-500/15 text-amber-400 border border-amber-500/25",
    danger: "bg-red-500/15 text-red-400 border border-red-500/25",
    info: "bg-blue-500/15 text-blue-400 border border-blue-500/25",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
};
