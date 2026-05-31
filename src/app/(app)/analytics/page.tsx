import { Suspense } from "react";

import { AnalyticsSkeleton } from "@/components/analytics/analytics-skeleton";
import { CashflowBarChart } from "@/components/analytics/cashflow-bar-chart";
import { CategoryPieChart } from "@/components/analytics/category-pie-chart";
import { InsightsCards } from "@/components/analytics/insights-cards";
import { PeriodSelector } from "@/components/analytics/period-selector";
import { getAnalyticsData } from "@/lib/data/analytics";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ range?: string }>;

const ALLOWED = [3, 6, 12];

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const requested = Number(sp.range ?? 6);
  const months = ALLOWED.includes(requested) ? requested : 6;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Analytics</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Análise detalhada das suas finanças
          </p>
        </div>
        <PeriodSelector current={months} />
      </div>

      <Suspense key={months} fallback={<AnalyticsSkeleton />}>
        <AnalyticsContent months={months} />
      </Suspense>
    </div>
  );
}

async function AnalyticsContent({ months }: { months: number }) {
  const data = await getAnalyticsData(months);
  if (!data) return null;

  return (
    <>
      <InsightsCards data={data} />

      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryPieChart
          data={data.expensesByCategory}
          currency={data.currency}
          locale={data.locale}
        />
        <CashflowBarChart
          data={data.cashflow}
          currency={data.currency}
          locale={data.locale}
        />
      </div>
    </>
  );
}
