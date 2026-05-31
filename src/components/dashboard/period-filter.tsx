"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils/cn";
import type { DashboardPeriod } from "@/types/domain";

const OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: "month", label: "Este mês" },
  { value: "30d", label: "30 dias" },
  { value: "year", label: "Este ano" },
  { value: "all", label: "Tudo" },
];

export function PeriodFilter({ current }: { current: DashboardPeriod }) {
  const params = useSearchParams();

  function buildHref(value: DashboardPeriod) {
    const next = new URLSearchParams(params);
    next.set("period", value);
    return `/dashboard?${next.toString()}`;
  }

  return (
    <div className="inline-flex rounded-md border bg-card p-1">
      {OPTIONS.map((opt) => {
        const active = current === opt.value;
        return (
          <Link
            key={opt.value}
            href={buildHref(opt.value)}
            className={cn(
              "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
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
