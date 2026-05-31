"use server";

import { createClient } from "@/lib/supabase/server";
import type { Transaction, TransactionType } from "@/types/domain";

export type ExportFilters = {
  type?: TransactionType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
};

export async function getAllTransactionsForExport(
  filters: ExportFilters
): Promise<Transaction[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5000);

  if (filters.type) query = query.eq("type", filters.type);
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.startDate) query = query.gte("date", filters.startDate);
  if (filters.endDate) query = query.lte("date", filters.endDate);

  const { data } = await query;
  return (data ?? []) as Transaction[];
}
