"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/utils/validators";

export type ActionResult = { error: string } | { success: true };

// Mapa de erros do Supabase → mensagens em PT-BR
function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Confirme seu email antes de entrar.";
  if (m.includes("user already registered")) return "Este email já está cadastrado.";
  if (m.includes("password should be")) return "Senha não atende aos requisitos.";
  if (m.includes("rate limit")) return "Muitas tentativas. Aguarde um momento.";
  return "Algo deu errado. Tente novamente.";
}

// ─────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────
export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: mapAuthError(error.message) };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// ─────────────────────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────────────────────
export async function registerAction(formData: FormData): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
    },
  });
  if (error) return { error: mapAuthError(error.message) };

  // Se "Confirm email" estiver desligado, já cria sessão e segue
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  // Caso contrário, mostra mensagem
  return { error: "Verifique seu email para confirmar a conta." };
}

// ─────────────────────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────────────────────
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
