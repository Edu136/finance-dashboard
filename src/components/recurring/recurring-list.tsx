"use client";

import { useMemo } from "react";

import type { Category, RecurringTransaction } from "@/types/domain";

import { RecurringCard } from "./recurring-card";

type Props = {
  recurrings: RecurringTransaction[];
  categories: Category[];
  currency: string;
  locale: string;
};

export function RecurringList({
  recurrings,
  categories,
  currency,
  locale,
}: Props) {
  const categoriesById = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  if (recurrings.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <p className="text-sm font-medium">Nenhuma recorrência ainda</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre transações que se repetem todo mês — Salário, Aluguel,
          Netflix... Elas serão criadas automaticamente.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {recurrings.map((r) => (
        <RecurringCard
          key={r.id}
          recurring={r}
          category={r.category_id ? categoriesById.get(r.category_id) : undefined}
          allCategories={categories}
          currency={currency}
          locale={locale}
        />
      ))}
    </div>
  );
}
