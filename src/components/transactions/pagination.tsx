"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type Props = {
  page: number;
  totalPages: number;
  total: number;
};

export function Pagination({ page, totalPages, total }: Props) {
  const params = useSearchParams();

  function buildHref(p: number) {
    const next = new URLSearchParams(params);
    next.set("page", String(p));
    return `/transactions?${next.toString()}`;
  }

  if (total === 0) return null;

  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Página <span className="font-medium text-foreground">{page}</span> de{" "}
        <span className="font-medium text-foreground">{totalPages}</span> ·{" "}
        {total} {total === 1 ? "registro" : "registros"}
      </p>
      <div className="flex gap-1">
        <Link
          href={buildHref(prev)}
          aria-disabled={isFirst}
          className={cn(
            "inline-flex h-9 items-center gap-1 rounded-md border px-3 text-sm",
            "hover:bg-accent hover:text-accent-foreground",
            isFirst && "pointer-events-none opacity-50"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Link>
        <Link
          href={buildHref(next)}
          aria-disabled={isLast}
          className={cn(
            "inline-flex h-9 items-center gap-1 rounded-md border px-3 text-sm",
            "hover:bg-accent hover:text-accent-foreground",
            isLast && "pointer-events-none opacity-50"
          )}
        >
          Próxima
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
