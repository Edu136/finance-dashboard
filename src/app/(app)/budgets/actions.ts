"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { budgetSchema } from "@/lib/utils/validators";

export type ActionResult = { success: true; id?: string } | { error: string };

function mapError(message: string): string {
  if (message.includes("budgets_unique_user_category"))
    return "Já existe uma meta para esta categoria.";
  return "Erro ao salvar: " + message;
}

// ─────────────────────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────────────────────
export async function createBudget(input: unknown): Promise<ActionResult> {
  const parsed = budgetSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { data, error } = await supabase
    .from("budgets")
    .insert({
      user_id: user.id,
      category_id: parsed.data.category_id ?? null,
      amount: parsed.data.amount,
      type: parsed.data.type,
      active: parsed.data.active,
    })
    .select("id")
    .single();

  if (error) return { error: mapError(error.message) };

  revalidatePath("/", "layout");
  return { success: true, id: data.id };
}

// ─────────────────────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────────────────────
const updateSchema = budgetSchema.extend({ id: z.string().uuid() });

export async function updateBudget(input: unknown): Promise<ActionResult> {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { id, ...rest } = parsed.data;
  const { error } = await supabase
    .from("budgets")
    .update({
      category_id: rest.category_id ?? null,
      amount: rest.amount,
      type: rest.type,
      active: rest.active,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: mapError(error.message) };

  revalidatePath("/", "layout");
  return { success: true, id };
}

// ─────────────────────────────────────────────────────────────
// TOGGLE
// ─────────────────────────────────────────────────────────────
export async function toggleBudget(
  id: string,
  active: boolean
): Promise<ActionResult> {
  if (!z.string().uuid().safeParse(id).success) return { error: "ID inválido" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { error } = await supabase
    .from("budgets")
    .update({ active })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Erro ao atualizar" };

  revalidatePath("/", "layout");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────
export async function deleteBudget(id: string): Promise<ActionResult> {
  if (!z.string().uuid().safeParse(id).success) return { error: "ID inválido" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { error } = await supabase
    .from("budgets")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Erro ao excluir" };

  revalidatePath("/", "layout");
  return { success: true };
}
