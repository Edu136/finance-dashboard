"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  passwordChangeSchema,
  profileNameSchema,
  profilePreferencesSchema,
} from "@/lib/utils/validators";

export type ActionResult = { success: true } | { error: string };

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// ─────────────────────────────────────────────────────────────
// UPDATE PROFILE NAME
// ─────────────────────────────────────────────────────────────
export async function updateProfileName(input: unknown): Promise<ActionResult> {
  const parsed = profileNameSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.full_name })
    .eq("id", user.id);

  if (error) return { error: "Erro ao atualizar perfil." };

  revalidatePath("/", "layout");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// UPDATE PREFERENCES
// ─────────────────────────────────────────────────────────────
export async function updateProfilePreferences(
  input: unknown
): Promise<ActionResult> {
  const parsed = profilePreferencesSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { error } = await supabase
    .from("profiles")
    .update({
      currency: parsed.data.currency,
    })
    .eq("id", user.id);

  if (error) return { error: "Erro ao atualizar preferências." };

  revalidatePath("/", "layout");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// UPLOAD AVATAR
// ─────────────────────────────────────────────────────────────
export async function updateAvatar(formData: FormData): Promise<ActionResult> {
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Arquivo inválido." };
  if (file.size === 0) return { error: "Arquivo vazio." };
  if (file.size > MAX_AVATAR_BYTES)
    return { error: "Arquivo muito grande (máx. 2MB)." };
  if (!ALLOWED_TYPES.includes(file.type))
    return { error: "Formato inválido. Use JPG, PNG ou WEBP." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${user.id}/avatar-${Date.now()}.${ext}`;

  // Apaga arquivos antigos do usuário
  const { data: oldFiles } = await supabase.storage
    .from("avatars")
    .list(user.id);
  if (oldFiles && oldFiles.length > 0) {
    await supabase.storage
      .from("avatars")
      .remove(oldFiles.map((f) => `${user.id}/${f.name}`));
  }

  // Upload novo
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
  if (uploadError) return { error: "Falha ao enviar imagem." };

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  // Atualiza profile
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (updateError) return { error: "Falha ao salvar avatar no perfil." };

  revalidatePath("/", "layout");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// REMOVE AVATAR
// ─────────────────────────────────────────────────────────────
export async function removeAvatar(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { data: files } = await supabase.storage
    .from("avatars")
    .list(user.id);
  if (files && files.length > 0) {
    await supabase.storage
      .from("avatars")
      .remove(files.map((f) => `${user.id}/${f.name}`));
  }

  await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", user.id);

  revalidatePath("/", "layout");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// CHANGE PASSWORD
// ─────────────────────────────────────────────────────────────
export async function changePassword(input: unknown): Promise<ActionResult> {
  const parsed = passwordChangeSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  });
  if (error) return { error: "Erro ao trocar senha." };

  return { success: true };
}
