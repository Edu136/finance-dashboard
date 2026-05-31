"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type ImportResult =
  | { success: true; inserted: number }
  | { error: string };

type ImportRow = {
  date: string;
  type: "income" | "expense" | "investment";
  amount: number;
  description: string;
  category_id: string | null;
  status: "confirmed" | "pending" | "cancelled";
  notes: string | null;
};

export async function bulkImportTransactions(
  rows: ImportRow[]
): Promise<ImportResult> {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { error: "Nada para importar." };
  }
  if (rows.length > 1000) {
    return { error: "Máximo 1000 linhas por importação." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const payload = rows.map((r) => ({
    user_id: user.id,
    type: r.type,
    amount: r.amount,
    description: r.description,
    date: r.date,
    category_id: r.category_id,
    status: r.status,
    notes: r.notes,
  }));

  const { error, count } = await supabase
    .from("transactions")
    .insert(payload, { count: "exact" });

  if (error) return { error: "Erro ao inserir: " + error.message };

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/analytics");

  return { success: true, inserted: count ?? rows.length };
}
