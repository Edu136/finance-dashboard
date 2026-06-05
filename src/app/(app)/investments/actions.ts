"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentPrice as getCurrentPriceData } from "@/lib/data/investments";
import { createClient } from "@/lib/supabase/server";
import { investmentSchema } from "@/lib/utils/validators";

export type ActionResult = { success: true; id?: string } | { error: string };

// CREATE
export async function createInvestment(input: unknown): Promise<ActionResult> {
  const parsed = investmentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados invalidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nao autenticado" };

  const base = {
    user_id: user.id,
    type: parsed.data.type,
    name: parsed.data.name,
    purchase_date: parsed.data.purchase_date,
    notes: parsed.data.notes ?? null,
    active: true,
  };

  const payload =
    parsed.data.type === "stock"
      ? {
          ...base,
          ticker: parsed.data.ticker,
          quantity: parsed.data.quantity,
          purchase_price: parsed.data.purchase_price,
          applied_amount: null,
          cdi_percentage: null,
        }
      : {
          ...base,
          ticker: null,
          quantity: null,
          purchase_price: null,
          applied_amount: parsed.data.applied_amount,
          cdi_percentage: parsed.data.cdi_percentage,
        };

  const { data, error } = await supabase
    .from("investments")
    // @ts-expect-error - Union type inference limitation with Supabase
    .insert(payload)
    .select("id")
    .single();

  if (error) return { error: "Erro ao criar: " + error.message };

  revalidatePath("/", "layout");
  return { success: true, id: data.id };
}

// UPDATE
const updateSchema = investmentSchema.and(z.object({ id: z.string().uuid() }));

export async function updateInvestment(input: unknown): Promise<ActionResult> {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados invalidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nao autenticado" };

  const { id } = parsed.data;
  const baseUpdate = {
    name: parsed.data.name,
    purchase_date: parsed.data.purchase_date,
    notes: parsed.data.notes ?? null,
  };

  const fullUpdate =
    parsed.data.type === "stock"
      ? {
          ...baseUpdate,
          type: "stock" as const,
          ticker: parsed.data.ticker,
          quantity: parsed.data.quantity,
          purchase_price: parsed.data.purchase_price,
          applied_amount: null,
          cdi_percentage: null,
        }
      : {
          ...baseUpdate,
          type: "fixed_income" as const,
          ticker: null,
          quantity: null,
          purchase_price: null,
          applied_amount: parsed.data.applied_amount,
          cdi_percentage: parsed.data.cdi_percentage,
        };

  const { error } = await supabase
    .from("investments")
    .update(fullUpdate)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Erro: " + error.message };

  revalidatePath("/", "layout");
  return { success: true, id };
}

// DELETE
export async function deleteInvestment(id: string): Promise<ActionResult> {
  if (!z.string().uuid().safeParse(id).success) return { error: "ID invalido" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nao autenticado" };

  const { error } = await supabase
    .from("investments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Erro ao excluir" };

  revalidatePath("/", "layout");
  return { success: true };
}

// LOOKUP
export async function lookupTicker(ticker: string) {
  if (!ticker || ticker.length < 2 || ticker.length > 10) {
    return { error: "Ticker invalido" };
  }

  const result = await getCurrentPriceData(ticker);
  if (!result) return { error: "Ticker nao encontrado" };
  return { success: true, data: result };
}
