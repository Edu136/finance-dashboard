"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

// ─────────────────────────────────────────────────────────────
// Legacy: bulk import (F-F10) — mantida para não quebrar nada
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// Smart Import (F-F10-V2)
// ─────────────────────────────────────────────────────────────

// Buscar hashes existentes (pra detectar duplicatas)
export async function getExistingHashes(
  hashes: string[]
): Promise<string[]> {
  if (hashes.length === 0) return [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("transactions")
    .select("import_hash")
    .eq("user_id", user.id)
    .in("import_hash", hashes);

  return (data ?? [])
    .map((r) => r.import_hash)
    .filter((h): h is string => Boolean(h));
}

// Buscar memória de categorização do usuário
export async function getUserMemory(): Promise<
  { merchant_pattern: string; category_id: string }[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("user_merchant_categories")
    .select("merchant_pattern, category_id")
    .eq("user_id", user.id)
    .order("hit_count", { ascending: false });

  return data ?? [];
}

// Importar em lote + salvar memória
type SmartImportPayload = {
  rows: {
    date: string;
    type: "income" | "expense" | "investment";
    amount: number;
    description: string;
    category_id: string | null;
    hash: string;
  }[];
  memoryUpserts: { merchant_pattern: string; category_id: string }[];
};

export type SmartImportResult =
  | { success: true; inserted: number; skipped: number }
  | { error: string };

export async function smartImportTransactions(
  payload: SmartImportPayload
): Promise<SmartImportResult> {
  if (!payload.rows.length) return { error: "Nada para importar." };
  if (payload.rows.length > 1000)
    return { error: "Máximo 1000 linhas por importação." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const inserts = payload.rows.map((r) => ({
    user_id: user.id,
    type: r.type,
    amount: r.amount,
    description: r.description,
    date: r.date,
    category_id: r.category_id,
    status: "confirmed" as const,
    import_hash: r.hash,
  }));

  const { data, error, count } = await supabase
    .from("transactions")
    .insert(inserts, { count: "exact" })
    .select("id");

  if (error) {
    // Se for erro de unique constraint, tenta inserir um por um
    if (error.code === "23505") {
      let inserted = 0;
      let skipped = 0;
      for (const row of inserts) {
        const { error: e } = await supabase.from("transactions").insert(row);
        if (e) skipped++;
        else inserted++;
      }
      await upsertMemory(supabase, user.id, payload.memoryUpserts);
      revalidatePath("/", "layout");
      return { success: true, inserted, skipped };
    }
    return { error: "Erro ao importar: " + error.message };
  }

  await upsertMemory(supabase, user.id, payload.memoryUpserts);
  revalidatePath("/", "layout");
  return {
    success: true,
    inserted: count ?? data?.length ?? 0,
    skipped: 0,
  };
}

// Helper: salvar memória (incrementa hit_count se já existir)
async function upsertMemory(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  pairs: { merchant_pattern: string; category_id: string }[]
) {
  if (!pairs.length) return;

  const map = new Map<string, string>();
  pairs.forEach((p) => map.set(p.merchant_pattern, p.category_id));

  for (const [pattern, categoryId] of map) {
    const { data: existing } = await supabase
      .from("user_merchant_categories")
      .select("hit_count")
      .eq("user_id", userId)
      .eq("merchant_pattern", pattern)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("user_merchant_categories")
        .update({
          category_id: categoryId,
          hit_count: existing.hit_count + 1,
          last_used_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("merchant_pattern", pattern);
    } else {
      await supabase.from("user_merchant_categories").insert({
        user_id: userId,
        merchant_pattern: pattern,
        category_id: categoryId,
        confidence: 1.0,
        hit_count: 1,
      });
    }
  }
}
