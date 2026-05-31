import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email obrigatório").email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Nome muito curto").max(80, "Nome muito longo"),
    email: z.string().min(1, "Email obrigatório").email("Email inválido"),
    password: z
      .string()
      .min(6, "Mínimo 6 caracteres")
      .max(72, "Máximo 72 caracteres"),
    confirmPassword: z.string().min(1, "Confirme a senha"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export const transactionSchema = z.object({
  type: z.enum(["income", "expense", "investment"], {
    message: "Selecione um tipo",
  }),
  amount: z
    .number({ message: "Valor obrigatório" })
    .positive("Valor deve ser maior que zero"),
  description: z
    .string()
    .min(1, "Descrição obrigatória")
    .max(120, "Máximo 120 caracteres"),
  date: z.string().min(1, "Data obrigatória"),
  category_id: z.string().uuid().nullable().optional(),
  status: z.enum(["confirmed", "pending", "cancelled"]),
  notes: z.string().max(500).nullable().optional(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export const profileNameSchema = z.object({
  full_name: z.string().min(2, "Nome muito curto").max(80, "Nome muito longo"),
});

export const profilePreferencesSchema = z.object({
  currency: z.enum(["BRL", "USD", "EUR"]),
});

export const passwordChangeSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, "Mínimo 6 caracteres")
      .max(72, "Máximo 72 caracteres"),
    confirmPassword: z.string().min(1, "Confirme a senha"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type ProfileNameInput = z.infer<typeof profileNameSchema>;
export type ProfilePreferencesInput = z.infer<typeof profilePreferencesSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;

export const recurringSchema = z.object({
  type: z.enum(["income", "expense", "investment"]),
  amount: z.number().positive("Valor deve ser maior que zero"),
  description: z.string().min(1, "Descrição obrigatória").max(120),
  day_of_month: z
    .number()
    .int()
    .min(1, "Dia deve ser entre 1 e 31")
    .max(31, "Dia deve ser entre 1 e 31"),
  category_id: z.string().uuid().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
  active: z.boolean(),
});

export type RecurringInput = z.infer<typeof recurringSchema>;