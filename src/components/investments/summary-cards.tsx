import { ArrowDownRight, ArrowUpRight, TrendingUp, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import type { InvestmentsSummary } from "@/types/domain";

type Props = {
  summary: InvestmentsSummary;
  currency: string;
  locale: string;
};

export function SummaryCards({ summary, currency, locale }: Props) {
  const isProfit = summary.profit >= 0;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total investido
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Wallet className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold sm:text-2xl">
            {formatCurrency(summary.total_invested, currency, locale)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Valor atual
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <TrendingUp className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold sm:text-2xl">
            {formatCurrency(summary.current_value, currency, locale)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Rentabilidade
          </CardTitle>
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full",
              isProfit
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {isProfit ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "text-xl font-bold sm:text-2xl",
              isProfit ? "text-success" : "text-destructive"
            )}
          >
            {isProfit ? "+" : ""}
            {formatCurrency(summary.profit, currency, locale)}
          </div>
          <p
            className={cn(
              "mt-1 text-xs",
              isProfit ? "text-success" : "text-destructive"
            )}
          >
            {isProfit ? "+" : ""}
            {summary.profit_pct.toFixed(2)}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
