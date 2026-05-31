import { Suspense } from "react";

import { BalanceChart } from "@/components/dashboard/balance-chart";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { getDashboardData } from "@/lib/data/dashboard";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral das suas finanças
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

async function DashboardContent() {
  const data = await getDashboardData();
  if (!data) return null;

  return (
    <>
      <SummaryCards
        totalBalance={data.totalBalance}
        comparisons={data.comparisons}
        currency={data.currency}
        locale={data.locale}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <BalanceChart
          data={data.timeline}
          currency={data.currency}
          locale={data.locale}
        />
        <RecentTransactions
          userId={data.userId}
          initialData={data.recentTransactions}
          currency={data.currency}
          locale={data.locale}
        />
      </div>
    </>
  );
}
