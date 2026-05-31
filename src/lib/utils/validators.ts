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