import { Suspense } from "react";

import { BalanceChart } from "@/components/dashboard/balance-chart";
import { BudgetSummaryCard } from "@/components/dashboard/budget-summary-card";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { PeriodFilter } from "@/components/dashboard/period-filter";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { getBudgetsProgress } from "@/lib/data/budgets";
import { getDashboardData } from "@/lib/data/dashboard";
import { isValidPeriod } from "@/lib/utils/period";
import type { DashboardPeriod } from "@/types/domain";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ period?: string }>;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const period: DashboardPeriod = isValidPeriod(sp.period) ? sp.period : "month";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Visão geral das suas finanças
          </p>
        </div>
        <PeriodFilter current={period} />
      </div>

      <Suspense key={period} fallback={<DashboardSkeleton />}>
        <DashboardContent period={period} />
      </Suspense>
    </div>
  );
}

async function DashboardContent({ period }: { period: DashboardPeriod }) {
  const [data, budgetProgress] = await Promise.all([
    getDashboardData(period),
    getBudgetsProgress(),
  ]);
  if (!data) return null;

  return (
    <>
      <SummaryCards
        totalBalance={data.totalBalance}
        income={data.periodSummary.income}
        expense={data.periodSummary.expense}
        investment={data.periodSummary.investment}
        count={data.periodSummary.count}
        periodLabel={data.periodLabel}
        currency={data.currency}
        locale={data.locale}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BalanceChart
            data={data.timeline}
            currency={data.currency}
            locale={data.locale}
          />
        </div>
        <BudgetSummaryCard
          progress={budgetProgress}
          currency={data.currency}
          locale={data.locale}
        />
      </div>

      <RecentTransactions
        userId={data.userId}
        initialData={data.recentTransactions}
        currency={data.currency}
        locale={data.locale}
      />
    </>
  );
}
