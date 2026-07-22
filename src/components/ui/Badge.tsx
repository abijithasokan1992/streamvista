import { HTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "outline";
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-brand-navy-light text-slate-300 border-white/10",
      success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      warning: "bg-brand-orange/10 text-brand-orange border-brand-orange/20",
      danger: "bg-red-500/10 text-red-400 border-red-500/20",
      outline: "bg-transparent border-white/20 text-slate-300",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-brand-black",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
