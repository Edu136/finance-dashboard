import { cn } from "@/lib/utils/cn";
import { type HTMLAttributes } from "react";

export function Skeleton({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...p} />;
}
