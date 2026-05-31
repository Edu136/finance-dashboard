"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { recurringSchema } from "@/lib/utils/validators";

export type ActionResult = { success: true; id?: string } | { error: string };

// Helpers
async function calcNextDue(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dayOfMonth: number
): Promise<string> {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase.rpc("calculate_next_due_date", {
    p_from_date: today,
    p_day_of_month: dayOfMonth,
  });
  return (data as unknown as string) ?? today;
}

// ─────────────────────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────────────────────
export async function createRecurring(input: unknown): Promise<ActionResult> {
  const parsed = recurringSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const nextDue = await calcNextDue(supabase, parsed.data.day_of_month);

  const { data, error } = await supabase
    .from("recurring_transactions")
    .insert({
      user_id: user.id,
      type: parsed.data.type,
      amount: parsed.data.amount,
      description: parsed.data.description,
      category_id: parsed.data.category_id ?? null,
      notes: parsed.data.notes ?? null,
      day_of_month: parsed.data.day_of_month,
      active: parsed.data.active,
      next_due_date: nextDue,
    })
    .select("id")
    .single();

  if (error) return { error: "Erro ao criar: " + error.message };

  revalidatePath("/recurring");
  return { success: true, id: data.id };
}

// ─────────────────────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────────────────────
const updateSchema = recurringSchema.extend({ id: z.string().uuid() });

export async function updateRecurring(input: unknown): Promise<ActionResult> {
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

  // Recalcula next_due_date se mudou o dia
  const nextDue = await calcNextDue(supabase, rest.day_of_month);

  const { error } = await supabase
    .from("recurring_transactions")
    .update({
      type: rest.type,
      amount: rest.amount,
      description: rest.description,
      category_id: rest.category_id ?? null,
      notes: rest.notes ?? null,
      day_of_month: rest.day_of_month,
      active: rest.active,
      next_due_date: nextDue,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Erro ao atualizar: " + error.message };

  revalidatePath("/recurring");
  return { success: true, id };
}

// ─────────────────────────────────────────────────────────────
// TOGGLE ACTIVE
// ─────────────────────────────────────────────────────────────
export async function toggleRecurring(
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
    .from("recurring_transactions")
    .update({ active })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Erro ao atualizar" };

  revalidatePath("/recurring");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────
export async function deleteRecurring(id: string): Promise<ActionResult> {
  if (!z.string().uuid().safeParse(id).success) return { error: "ID inválido" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { error } = await supabase
    .from("recurring_transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Erro ao excluir" };

  revalidatePath("/recurring");
  return { success: true };
}
