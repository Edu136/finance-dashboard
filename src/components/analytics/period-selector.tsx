"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils/cn";

const OPTIONS = [
  { value: "3", label: "3 meses" },
  { value: "6", label: "6 meses" },
  { value: "12", label: "12 meses" },
];

export function PeriodSelector({ current }: { current: number }) {
  const params = useSearchParams();

  function buildHref(value: string) {
    const next = new URLSearchParams(params);
    next.set("range", value);
    return `/analytics?${next.toString()}`;
  }

  return (
    <div className="inline-flex w-full rounded-md border bg-card p-1 sm:w-auto">
      {OPTIONS.map((opt) => {
        const active = String(current) === opt.value;
        return (
          <Link
            key={opt.value}
            href={buildHref(opt.value)}
            className={cn(
              "flex-1 rounded-sm px-3 py-1.5 text-center text-sm font-medium transition-colors sm:flex-initial",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </Link>
        );
      })}
    </div>
  );
}
