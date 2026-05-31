import { createClient } from "@/lib/supabase/server";
import type {
  BalanceTimelinePoint,
  MonthComparison,
  Transaction,
} from "@/types/domain";

export type DashboardData = {
  userId: string;
  totalBalance: number;
  comparisons: MonthComparison[];
  timeline: BalanceTimelinePoint[];
  recentTransactions: Transaction[];
  currency: string;
  locale: string;
};

export async function getDashboardData(): Promise<DashboardData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Carrega tudo em paralelo
  const [
    profileRes,
    balanceRes,
    comparisonRes,
    timelineRes,
    recentRes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("currency, locale")
      .eq("id", user.id)
      .single(),
    supabase.rpc("get_user_balance", { p_user_id: user.id }),
    supabase.rpc("get_month_comparison", { p_user_id: user.id }),
    supabase.rpc("get_balance_timeline", {
      p_user_id: user.id,
      p_months: 6,
    }),
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return {
    userId: user.id,
    totalBalance: Number(balanceRes.data ?? 0),
    comparisons: (comparisonRes.data ?? []) as MonthComparison[],
    timeline: (timelineRes.data ?? []) as BalanceTimelinePoint[],
    recentTransactions: (recentRes.data ?? []) as Transaction[],
    currency: profileRes.data?.currency ?? "BRL",
    locale: profileRes.data?.locale ?? "pt-BR",
  };
}
