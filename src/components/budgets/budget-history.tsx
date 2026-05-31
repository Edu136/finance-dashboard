"use client";

import { useState } from "react";
import { ChevronDown, AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatMonth } from "@/lib/utils/format";
import type {
  BudgetHistoryEntry,
  BudgetHistoryItem,
} from "@/types/domain";

type Props = {
  history: BudgetHistoryEntry[];
  currency: string;
  locale: string;
};

const STATUS_META = {
  safe: {
    Icon: CheckCircle2,
    color: "text-success",
    bar: "bg-success",
  },
  warning: {
    Icon: AlertTriangle,
    color: "text-warning",
    bar: "bg-warning",
  },
  exceeded: {
    Icon: AlertCircle,
    color: "text-destructive",
    bar: "bg-destructive",
  },
};

export function BudgetHistory({ history, currency, locale }: Props) {
  const validMonths = history.filter((h) => h.total_budgets > 0);
  if (validMonths.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Histórico de metas</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {validMonths.map((month) => (
            <HistoryMonthRow
              key={month.month}
              month={month}
              currency={currency}
              locale={locale}
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function HistoryMonthRow({
  month,
  currency,
  locale,
}: {
  month: BudgetHistoryEntry;
  currency: string;
  locale: string;
}) {
  const [open, setOpen] = useState(false);

  const ratio = month.total_budgets > 0 ? month.met_budgets / month.total_budgets : 0;
  const colorClass =
    ratio >= 0.8
      ? "text-success"
      : ratio >= 0.5
      ? "text-warning"
      : "text-destructive";

  const exceeded = Number(month.exceeded);

  return (
    <li className="overflow-hidden rounded-md border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 p-3 text-left text-sm transition-colors hover:bg-accent/50"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 min-w-0">
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )}
          />
          <span className="font-medium capitalize truncate">
            {formatMonth(month.month, locale)}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-right text-xs sm:gap-3">
          <span className={cn("font-medium", colorClass)}>
            {month.met_budgets} de {month.total_budgets} batidas
          </span>
          {exceeded > 0 && (
            <span className="hidden text-destructive sm:inline">
              +{formatCurrency(exceeded, currency, locale)} excedido
            </span>
          )}
        </div>
      </button>

      {/* Conteúdo expandido */}
      <div
        className={cn(
          "grid transition-all duration-200",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <ul className="space-y-2 border-t bg-muted/30 p-3">
            {/* mostra excedido em mobile (estava escondido no header) */}
            {exceeded > 0 && (
              <li className="text-xs text-destructive sm:hidden">
                +{formatCurrency(exceeded, currency, locale)} excedido no total
              </li>
            )}

            {month.items.map((item) => (
              <HistoryItemRow
                key={item.budget_id}
                item={item}
                currency={currency}
                locale={locale}
              />
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}

function HistoryItemRow({
  item,
  currency,
  locale,
}: {
  item: BudgetHistoryItem;
  currency: string;
  locale: string;
}) {
  const pct = Number(item.pct);
  const isPositiveGoal = item.type !== "expense";
  const displayStatus =
    isPositiveGoal && item.status === "exceeded" ? "safe" : item.status;
  const displayMeta = STATUS_META[displayStatus];
  const { Icon } = displayMeta;

  return (
    <li className="rounded-sm bg-card p-2">
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: item.category_color }}
          />
          <span className="truncate font-medium">{item.category_name}</span>
          <Icon className={cn("h-3 w-3 shrink-0", displayMeta.color)} />
        </div>
        <span className="shrink-0 text-muted-foreground tabular-nums">
          {formatCurrency(Number(item.spent), currency, locale)} /{" "}
          {formatCurrency(Number(item.amount), currency, locale)}
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full transition-all", displayMeta.bar)}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <span
          className={cn(
            "shrink-0 text-[10px] font-medium tabular-nums",
            displayMeta.color
          )}
        >
          {pct.toFixed(0)}%
        </span>
      </div>
    </li>
  );
}
