"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function dismissNotification(key: string) {
  if (!key || typeof key !== "string") return { error: "Chave inválida" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  await supabase
    .from("dismissed_notifications")
    .upsert(
      { user_id: user.id, notification_key: key },
      { onConflict: "user_id,notification_key" }
    );

  revalidatePath("/", "layout");
  return { success: true };
}

export async function dismissAllNotifications(keys: string[]) {
  if (!Array.isArray(keys) || keys.length === 0) {
    return { error: "Nenhuma chave" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const rows = keys.map((k) => ({
    user_id: user.id,
    notification_key: k,
  }));

  await supabase
    .from("dismissed_notifications")
    .upsert(rows, { onConflict: "user_id,notification_key" });

  revalidatePath("/", "layout");
  return { success: true };
}
