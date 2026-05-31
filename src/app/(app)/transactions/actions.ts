"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { transactionSchema } from "@/lib/utils/validators";

export type ActionResult =
  | { success: true; id?: string }
  | { error: string };

function mapError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("violates row-level security")) return "Sem permissão.";
  if (m.includes("violates check constraint")) return "Dados inválidos.";
  return "Erro ao salvar. Tente novamente.";
}

// ─────────────────────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────────────────────
export async function createTransaction(
  input: unknown
): Promise<ActionResult> {
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      type: parsed.data.type,
      amount: parsed.data.amount,
      description: parsed.data.description,
      date: parsed.data.date,
      category_id: parsed.data.category_id ?? null,
      status: parsed.data.status,
      notes: parsed.data.notes ?? null,
    })
    .select("id")
    .single();

  if (error) return { error: mapError(error.message) };

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/analytics");
  return { success: true, id: data.id };
}

// ─────────────────────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────────────────────
const updateSchema = transactionSchema.extend({
  id: z.string().uuid(),
});

export async function updateTransaction(
  input: unknown
): Promise<ActionResult> {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { id, ...rest } = parsed.data;
  const { error } = await supabase
    .from("transactions")
    .update({
      type: rest.type,
      amount: rest.amount,
      description: rest.description,
      date: rest.date,
      category_id: rest.category_id ?? null,
      status: rest.status,
      notes: rest.notes ?? null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: mapError(error.message) };

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/analytics");
  return { success: true, id };
}

// ─────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────
export async function deleteTransaction(id: string): Promise<ActionResult> {
  if (!z.string().uuid().safeParse(id).success) {
    return { error: "ID inválido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: mapError(error.message) };

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/analytics");
  return { success: true };
}
