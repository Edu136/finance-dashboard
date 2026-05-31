import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "default" | "success" | "destructive" | "warning" | "outline";

const variants: Record<Variant, string> = {
  default:     "bg-primary/10 text-primary border-primary/20",
  success:     "bg-success/10 text-success border-success/20",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
  warning:     "bg-warning/10 text-warning border-warning/20",
  outline:     "border-border text-foreground",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & { variant?: Variant };

export function Badge({ className, variant = "default", ...p }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...p}
    />
  );
}
