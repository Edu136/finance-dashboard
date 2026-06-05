import { createClient } from "@/lib/supabase/server";
import { resolvePeriod } from "@/lib/utils/period";
import type {
  BalanceTimelinePoint,
  DashboardPeriod,
  Transaction,
} from "@/types/domain";

export type InvestmentsSummaryForDashboard = {
  total_invested: number;
  current_value: number;
  profit: number;
  profit_pct: number;
};

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
  investments: InvestmentsSummaryForDashboard;
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
    investmentsRes,
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
    supabase.rpc("get_investments_summary", { p_user_id: user.id }),
  ]);

  const summary = summaryRes.data?.[0] ?? {
    total_income: 0,
    total_expense: 0,
    total_investment: 0,
    net_balance: 0,
    transaction_count: 0,
  };

  const investmentsSummary = investmentsRes.data?.[0] ?? {
    total_invested: 0,
    current_value: 0,
    profit: 0,
    profit_pct: 0,
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
    investments: {
      total_invested: Number(investmentsSummary.total_invested),
      current_value: Number(investmentsSummary.current_value),
      profit: Number(investmentsSummary.profit),
      profit_pct: Number(investmentsSummary.profit_pct),
    },
    timeline: (timelineRes.data ?? []) as BalanceTimelinePoint[],
    recentTransactions: (recentRes.data ?? []) as Transaction[],
    currency: profileRes.data?.currency ?? "BRL",
    locale: profileRes.data?.locale ?? "pt-BR",
  };
}
