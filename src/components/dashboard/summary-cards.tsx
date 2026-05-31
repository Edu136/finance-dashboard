import {
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
  investment: number;
  count: number;
  periodLabel: string;
  currency: string;
  locale: string;
};

export function SummaryCards({
  totalBalance,
  income,
  expense,
  investment,
  count,
  periodLabel,
  currency,
  locale,
}: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        subtitle={periodLabel}
        value={formatCurrency(expense, currency, locale)}
        icon={<TrendingDown className="h-4 w-4" />}
        accent="destructive"
      />
      <SummaryCard
        title="Investido"
        subtitle={`${periodLabel} · ${count} transações`}
        value={formatCurrency(investment, currency, locale)}
        icon={<PiggyBank className="h-4 w-4" />}
        accent="primary"
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
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground truncate">
          {subtitle}
        </p>
      </CardContent>
    </Card>
  );
}
