import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  TrendingDown,
  TrendingUp,
  Wallet,
  PiggyBank,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import type { MonthComparison } from "@/types/domain";

type Props = {
  totalBalance: number;
  comparisons: MonthComparison[];
  currency: string;
  locale: string;
};

export function SummaryCards({
  totalBalance,
  comparisons,
  currency,
  locale,
}: Props) {
  const income = comparisons.find((c) => c.metric === "income");
  const expense = comparisons.find((c) => c.metric === "expense");
  const investment = comparisons.find((c) => c.metric === "investment");

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        title="Saldo Total"
        value={formatCurrency(totalBalance, currency, locale)}
        icon={<Wallet className="h-4 w-4" />}
        accent="primary"
      />
      <SummaryCard
        title="Receitas (mês)"
        value={formatCurrency(income?.current_value ?? 0, currency, locale)}
        variation={income?.variation_pct ?? null}
        icon={<TrendingUp className="h-4 w-4" />}
        accent="success"
        variationKind="higher-is-better"
      />
      <SummaryCard
        title="Gastos (mês)"
        value={formatCurrency(expense?.current_value ?? 0, currency, locale)}
        variation={expense?.variation_pct ?? null}
        icon={<TrendingDown className="h-4 w-4" />}
        accent="destructive"
        variationKind="lower-is-better"
      />
      <SummaryCard
        title="Investido (mês)"
        value={formatCurrency(
          investment?.current_value ?? 0,
          currency,
          locale
        )}
        variation={investment?.variation_pct ?? null}
        icon={<PiggyBank className="h-4 w-4" />}
        accent="primary"
        variationKind="higher-is-better"
      />
    </div>
  );
}

type CardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  accent: "primary" | "success" | "destructive";
  variation?: number | null;
  variationKind?: "higher-is-better" | "lower-is-better";
};

function SummaryCard({
  title,
  value,
  icon,
  accent,
  variation,
  variationKind = "higher-is-better",
}: CardProps) {
  const accentClass = {
    primary: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    destructive: "text-destructive bg-destructive/10",
  }[accent];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full",
            accentClass
          )}
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <Variation value={variation} kind={variationKind} />
      </CardContent>
    </Card>
  );
}

function Variation({
  value,
  kind,
}: {
  value: number | null | undefined;
  kind: "higher-is-better" | "lower-is-better";
}) {
  if (value === null || value === undefined) {
    return (
      <p className="mt-1 text-xs text-muted-foreground">
        sem dados do mês anterior
      </p>
    );
  }

  if (value === 0) {
    return (
      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
        sem variação
      </p>
    );
  }

  const positive = value > 0;
  const isGood =
    kind === "higher-is-better" ? positive : !positive;

  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  const colorClass = isGood ? "text-success" : "text-destructive";

  return (
    <p className={cn("mt-1 flex items-center gap-1 text-xs", colorClass)}>
      <Icon className="h-3 w-3" />
      {Math.abs(value).toFixed(1)}% vs mês anterior
    </p>
  );
}
