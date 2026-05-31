import { createClient } from "@/lib/supabase/server";
import { computeNotifications } from "@/lib/notifications/compute";
import type { AppNotification } from "@/lib/notifications/types";
import type { Transaction } from "@/types/domain";
import { getBudgetsProgress } from "@/lib/data/budgets";

export async function getNotifications(): Promise<AppNotification[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Pega últimos 4 meses de transações (suficiente pra todas as métricas)
  const fourMonthsAgo = new Date();
  fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
  const fromDate = fourMonthsAgo.toISOString().slice(0, 10);

  const [txRes, dismissedRes, budgetsProgress] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", fromDate)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("dismissed_notifications")
      .select("notification_key")
      .eq("user_id", user.id),
    getBudgetsProgress(),
  ]);

  const allTransactions = (txRes.data ?? []) as Transaction[];
  const dismissedKeys = new Set(
    (dismissedRes.data ?? []).map((d) => d.notification_key)
  );

  return computeNotifications({
    today: new Date(),
    allTransactions,
    dismissedKeys,
    budgetsProgress,
  });
}
