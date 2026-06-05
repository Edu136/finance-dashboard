import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";

type Props = {
  totalBalance: number;
  income: number;
  expense: number;
  count: number;
  periodLabel: string;
  investments: {
    total_invested: number;
    current_value: number;
    profit: number;
    profit_pct: number;
  };
  currency: string;
  locale: string;
};

export function SummaryCards({
  totalBalance,
  income,
  expense,
  count,
  periodLabel,
  investments,
  currency,
  locale,
}: Props) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        title="Saldo Total"
        subtitle="Acumulado de todas as transações"
        value={formatCurrency(totalBalance, currency, locale)}
        icon={<Wallet className="h-4 w-4" />}
        accent="primary"
      />
      <SummaryCard
        title="Receitas"
        subtitle={periodLabel}
        value={formatCurrency(income, currency, locale)}
        icon={<TrendingUp className="h-4 w-4" />}
        accent="success"
      />
      <SummaryCard
        title="Gastos"
        subtitle={`${periodLabel} · ${count} transações`}
        value={formatCurrency(expense, currency, locale)}
        icon={<TrendingDown className="h-4 w-4" />}
        accent="destructive"
      />
      <PatrimonyCard
        investments={investments}
        currency={currency}
        locale={locale}
      />
    </div>
  );
}

type CardProps = {
  title: string;
  subtitle: string;
  value: string;
  icon: React.ReactNode;
  accent: "primary" | "success" | "destructive";
};

function SummaryCard({ title, subtitle, value, icon, accent }: CardProps) {
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
        <div className="truncate text-xl font-bold tracking-tight sm:text-2xl">{value}</div>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {subtitle}
        </p>
      </CardContent>
    </Card>
  );
}

function PatrimonyCard({
  investments,
  currency,
  locale,
}: {
  investments: Props["investments"];
  currency: string;
  locale: string;
}) {
  const hasInvestments = investments.total_invested > 0;
  const isProfit = investments.profit >= 0;

  const variationColor = !hasInvestments
    ? "text-muted-foreground"
    : isProfit
      ? "text-success"
      : "text-destructive";

  const VariationIcon = !hasInvestments
    ? Minus
    : isProfit
      ? ArrowUpRight
      : ArrowDownRight;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Patrimônio
        </CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          <PiggyBank className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="truncate text-xl font-bold tracking-tight sm:text-2xl">
          {hasInvestments
            ? formatCurrency(investments.current_value, currency, locale)
            : "—"}
        </div>
        {hasInvestments ? (
          <>
            <p
              className={cn(
                "mt-1 flex items-center gap-1 text-xs font-medium",
                variationColor
              )}
            >
              <VariationIcon className="h-3 w-3" />
              {isProfit ? "+" : ""}
              {investments.profit_pct.toFixed(2)}%
              <span className="text-muted-foreground">
                ({isProfit ? "+" : ""}
                {formatCurrency(investments.profit, currency, locale)})
              </span>
            </p>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              Aplicado:{" "}
              {formatCurrency(investments.total_invested, currency, locale)}
            </p>
          </>
        ) : (
          <p className="mt-1 truncate text-xs text-muted-foreground">
            Sem investimentos
          </p>
        )}
      </CardContent>
    </Card>
  );
}
