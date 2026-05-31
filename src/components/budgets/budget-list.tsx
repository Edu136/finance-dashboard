"use client";

import { useMemo } from "react";

import type { Budget, BudgetProgress, Category } from "@/types/domain";

import { BudgetCard } from "./budget-card";

type Props = {
  budgets: Budget[];
  progress: BudgetProgress[];
  categories: Category[];
  currency: string;
  locale: string;
};

export function BudgetList({
  budgets,
  progress,
  categories,
  currency,
  locale,
}: Props) {
  const progressById = useMemo(() => {
    const map = new Map<string, BudgetProgress>();
    progress.forEach((p) => map.set(p.budget_id, p));
    return map;
  }, [progress]);

  if (budgets.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <p className="text-sm font-medium">Nenhuma meta ainda</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Defina limites mensais por categoria. Ex: &quot;no máximo R$ 500 em
          Lazer&quot;.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {budgets.map((b) => (
        <BudgetCard
          key={b.id}
          budget={b}
          progress={progressById.get(b.id) ?? null}
          categories={categories}
          currency={currency}
          locale={locale}
        />
      ))}
    </div>
  );
}
