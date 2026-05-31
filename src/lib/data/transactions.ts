import { createClient } from "@/lib/supabase/server";
import type { Transaction, TransactionType } from "@/types/domain";

export type TransactionsFilters = {
  type?: TransactionType;
  categoryId?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;
  page?: number;
  pageSize?: number;
};

export type TransactionsListResult = {
  rows: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  userId: string;
  currency: string;
  locale: string;
};

export async function getTransactionsList(
  filters: TransactionsFilters = {}
): Promise<TransactionsListResult | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("transactions")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.type) query = query.eq("type", filters.type);
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.startDate) query = query.gte("date", filters.startDate);
  if (filters.endDate) query = query.lte("date", filters.endDate);

  const [listRes, profileRes] = await Promise.all([
    query,
    supabase
      .from("profiles")
      .select("currency, locale")
      .eq("id", user.id)
      .single(),
  ]);

  const total = listRes.count ?? 0;

  return {
    rows: (listRes.data ?? []) as Transaction[],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    userId: user.id,
    currency: profileRes.data?.currency ?? "BRL",
    locale: profileRes.data?.locale ?? "pt-BR",
  };
}
