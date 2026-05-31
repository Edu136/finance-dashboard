import { createClient } from "@/lib/supabase/server";
import type {
  Budget,
  BudgetHistoryEntry,
  BudgetProgress,
} from "@/types/domain";

export async function getBudgetsList(): Promise<{
  budgets: Budget[];
  progress: BudgetProgress[];
  currency: string;
  locale: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return { budgets: [], progress: [], currency: "BRL", locale: "pt-BR" };

  const [budgetsRes, progressRes, profileRes] = await Promise.all([
    supabase
      .from("budgets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.rpc("get_budgets_progress", { p_user_id: user.id }),
    supabase
      .from("profiles")
      .select("currency, locale")
      .eq("id", user.id)
      .single(),
  ]);

  return {
    budgets: (budgetsRes.data ?? []) as Budget[],
    progress: (progressRes.data ?? []) as BudgetProgress[],
    currency: profileRes.data?.currency ?? "BRL",
    locale: profileRes.data?.locale ?? "pt-BR",
  };
}

export async function getBudgetsProgress(): Promise<BudgetProgress[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase.rpc("get_budgets_progress", {
    p_user_id: user.id,
  });
  return (data ?? []) as BudgetProgress[];
}

export async function getBudgetsHistory(
  months = 6
): Promise<BudgetHistoryEntry[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase.rpc("get_budgets_history", {
    p_user_id: user.id,
    p_months: months,
  });
  return (data ?? []) as BudgetHistoryEntry[];
}
