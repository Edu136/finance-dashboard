import { Award, Calendar, TrendingDown } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatMonth } from "@/lib/utils/format";
import type { AnalyticsData } from "@/lib/data/analytics";

type Props = {
  data: AnalyticsData;
};

export function InsightsCards({ data }: Props) {
  const savingsRate =
    data.totalIncome > 0
      ? ((data.totalIncome - data.totalExpense) / data.totalIncome) * 100
      : 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <InsightCard
        icon={<Award className="h-4 w-4" />}
        title="Categoria mais gasta"
        value={data.topCategory?.category_name ?? "—"}
        subtitle={
          data.topCategory
            ? formatCurrency(
                Number(data.topCategory.total),
                data.currency,
                data.locale
              )
            : "Sem dados"
        }
        accent="destructive"
      />
      <InsightCard
        icon={<Calendar className="h-4 w-4" />}
        title="Mês mais econômico"
        value={
          data.cheapestMonth
            ? formatMonth(data.cheapestMonth.month, data.locale)
            : "—"
        }
        subtitle={
          data.cheapestMonth
            ? `${formatCurrency(
                Number(data.cheapestMonth.expense),
                data.currency,
                data.locale
              )} em gastos`
            : "Sem dados"
        }
        accent="success"
      />
      <InsightCard
        icon={<TrendingDown className="h-4 w-4" />}
        title="Taxa de poupança"
        value={`${savingsRate.toFixed(1)}%`}
        subtitle={
          savingsRate >= 20
            ? "Excelente! 🎉"
            : savingsRate >= 10
            ? "Bom ritmo"
            : savingsRate > 0
            ? "Pode melhorar"
            : "Atenção: gastos altos"
        }
        accent={
          savingsRate >= 20
            ? "success"
            : savingsRate > 0
            ? "primary"
            : "destructive"
        }
      />
    </div>
  );
}

type InsightCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  accent: "primary" | "success" | "destructive";
};

function InsightCard({ icon, title, value, subtitle, accent }: InsightCardProps) {
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
          className={`flex h-8 w-8 items-center justify-center rounded-full ${accentClass}`}
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="truncate text-xl font-bold tracking-tight">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
