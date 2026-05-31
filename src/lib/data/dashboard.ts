import { createClient } from "@/lib/supabase/server";
import { resolvePeriod } from "@/lib/utils/period";
import type {
  BalanceTimelinePoint,
  DashboardPeriod,
  Transaction,
} from "@/types/domain";

export type DashboardData = {
  userId: string;
  period: DashboardPeriod;
  periodLabel: string;
  totalBalance: number;
  periodSummary: {
    income: number;
    expense: number;
    investment: number;
    net: number;
    count: number;
  };
  timeline: BalanceTimelinePoint[];
  recentTransactions: Transaction[];
  currency: string;
  locale: string;
};

export async function getDashboardData(
  period: DashboardPeriod = "month"
): Promise<DashboardData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const range = resolvePeriod(period);

  // Decide quantos meses pegar no gráfico baseado no período
  const monthsForChart =
    period === "year" ? 12 : period === "all" ? 24 : period === "30d" ? 3 : 6;

  const [
    profileRes,
    balanceRes,
    summaryRes,
    timelineRes,
    recentRes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("currency, locale")
      .eq("id", user.id)
      .single(),
    supabase.rpc("get_user_balance", { p_user_id: user.id }),
    supabase.rpc("get_period_summary", {
      p_user_id: user.id,
      p_start_date: range.startDate,
      p_end_date: range.endDate,
    }),
    supabase.rpc("get_balance_timeline", {
      p_user_id: user.id,
      p_months: monthsForChart,
    }),
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const summary = summaryRes.data?.[0] ?? {
    total_income: 0,
    total_expense: 0,
    total_investment: 0,
    net_balance: 0,
    transaction_count: 0,
  };

  return {
    userId: user.id,
    period,
    periodLabel: range.label,
    totalBalance: Number(balanceRes.data ?? 0),
    periodSummary: {
      income: Number(summary.total_income),
      expense: Number(summary.total_expense),
      investment: Number(summary.total_investment),
      net: Number(summary.net_balance),
      count: Number(summary.transaction_count),
    },
    timeline: (timelineRes.data ?? []) as BalanceTimelinePoint[],
    recentTransactions: (recentRes.data ?? []) as Transaction[],
    currency: profileRes.data?.currency ?? "BRL",
    locale: profileRes.data?.locale ?? "pt-BR",
  };
}
