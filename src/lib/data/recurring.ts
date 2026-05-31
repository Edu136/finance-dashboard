import { createClient } from "@/lib/supabase/server";
import type { RecurringTransaction } from "@/types/domain";

export async function getRecurringTransactions(): Promise<{
  rows: RecurringTransaction[];
  currency: string;
  locale: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { rows: [], currency: "BRL", locale: "pt-BR" };

  const [listRes, profileRes] = await Promise.all([
    supabase
      .from("recurring_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("active", { ascending: false })
      .order("day_of_month", { ascending: true }),
    supabase
      .from("profiles")
      .select("currency, locale")
      .eq("id", user.id)
      .single(),
  ]);

  return {
    rows: (listRes.data ?? []) as RecurringTransaction[],
    currency: profileRes.data?.currency ?? "BRL",
    locale: profileRes.data?.locale ?? "pt-BR",
  };
}
