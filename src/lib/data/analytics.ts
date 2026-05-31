import { createClient } from "@/lib/supabase/server";
import type {
  BalanceTimelinePoint,
  CategoryExpense,
} from "@/types/domain";

export type AnalyticsData = {
  months: number;
  cashflow: BalanceTimelinePoint[];
  expensesByCategory: CategoryExpense[];
  totalIncome: number;
  totalExpense: number;
  totalInvestment: number;
  topCategory: CategoryExpense | null;
  cheapestMonth: BalanceTimelinePoint | null;
  highestExpenseMonth: BalanceTimelinePoint | null;
  currency: string;
  locale: string;
};

export async function getAnalyticsData(
  months: number
): Promise<AnalyticsData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profileRes, cashflowRes, categoriesRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("currency, locale")
      .eq("id", user.id)
      .single(),
    supabase.rpc("get_balance_timeline", {
      p_user_id: user.id,
      p_months: months,
    }),
    supabase.rpc("get_expenses_by_category", {
      p_user_id: user.id,
      p_months: months,
    }),
  ]);

  const cashflow = (cashflowRes.data ?? []) as BalanceTimelinePoint[];
  const expensesByCategory = (categoriesRes.data ?? []) as CategoryExpense[];

  // Agregações
  const totalIncome = cashflow.reduce((s, m) => s + Number(m.income), 0);
  const totalExpense = cashflow.reduce((s, m) => s + Number(m.expense), 0);
  const totalInvestment = cashflow.reduce(
    (s, m) => s + Number(m.investment),
    0
  );

  const topCategory = expensesByCategory[0] ?? null;

  const cheapestMonth =
    cashflow.length > 0
      ? cashflow.reduce((min, m) =>
          Number(m.expense) < Number(min.expense) ? m : min
        )
      : null;

  const highestExpenseMonth =
    cashflow.length > 0
      ? cashflow.reduce((max, m) =>
          Number(m.expense) > Number(max.expense) ? m : max
        )
      : null;

  return {
    months,
    cashflow,
    expensesByCategory,
    totalIncome,
    totalExpense,
    totalInvestment,
    topCategory,
    cheapestMonth,
    highestExpenseMonth,
    currency: profileRes.data?.currency ?? "BRL",
    locale: profileRes.data?.locale ?? "pt-BR",
  };
}
