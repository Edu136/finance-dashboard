import type { Transaction } from "@/types/domain";

import type { AppNotification } from "./types";

export type GeneratorContext = {
  today: Date;
  monthKey: string; // "2026-02"
  daysSinceMonthStart: number; // 1-31
  daysSinceLastTransaction: number; // 0+
  transactionsThisMonth: Transaction[];
  transactionsLastMonth: Transaction[];
  averageMonthlyExpense: number; // média dos últimos 3 meses
  totalExpenseThisMonth: number;
  totalIncomeThisMonth: number;
};

// ─────────────────────────────────────────────────────────────
// Generator 1: Mês novo, ainda não lançou nada significativo
// ─────────────────────────────────────────────────────────────
export function newMonthGenerator(ctx: GeneratorContext): AppNotification | null {
  // Só dispara entre dia 1 e 7 do mês
  if (ctx.daysSinceMonthStart > 7) return null;
  // Se já tem 5+ transações no mês, não enche o saco
  if (ctx.transactionsThisMonth.length >= 5) return null;

  return {
    key: `new-month:${ctx.monthKey}`,
    category: "new-month",
    severity: "info",
    title: "Novo mês começou!",
    message:
      ctx.transactionsThisMonth.length === 0
        ? "Já é hora de lançar suas receitas e contas fixas."
        : `Você lançou ${ctx.transactionsThisMonth.length} transação(ões) este mês. Falta algo?`,
    icon: "Calendar",
    href: "/transactions",
    ctaLabel: "Ver transações",
    createdAt: ctx.today.toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────
// Generator 2: Receita não lançada (provavelmente salário)
// ─────────────────────────────────────────────────────────────
export function missingIncomeGenerator(
  ctx: GeneratorContext
): AppNotification | null {
  // Só dispara após dia 5
  if (ctx.daysSinceMonthStart < 5) return null;
  if (ctx.totalIncomeThisMonth > 0) return null;
  // Se mês passado também não tinha receita, não chama atenção
  if (ctx.transactionsLastMonth.filter((t) => t.type === "income").length === 0) {
    return null;
  }

  return {
    key: `missing-income:${ctx.monthKey}`,
    category: "missing-income",
    severity: "warning",
    title: "Cadê sua receita?",
    message: "Você normalmente lança receita até esta data. Já recebeu este mês?",
    icon: "TrendingUp",
    href: "/transactions",
    ctaLabel: "Lançar receita",
    createdAt: ctx.today.toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────
// Generator 3: Gasto este mês acima da média
// ─────────────────────────────────────────────────────────────
export function highSpendingGenerator(
  ctx: GeneratorContext
): AppNotification | null {
  if (ctx.averageMonthlyExpense <= 0) return null;
  if (ctx.totalExpenseThisMonth <= 0) return null;

  const ratio = ctx.totalExpenseThisMonth / ctx.averageMonthlyExpense;
  if (ratio < 1.2) return null; // 20%+ acima da média

  // Não alerta nos primeiros 5 dias (cedo demais)
  if (ctx.daysSinceMonthStart < 5) return null;

  const pct = Math.round((ratio - 1) * 100);
  return {
    key: `high-spending:${ctx.monthKey}`,
    category: "high-spending",
    severity: "alert",
    title: `Gastos ${pct}% acima da média`,
    message: `Você já gastou mais que a média dos últimos 3 meses. Quer revisar?`,
    icon: "TrendingDown",
    href: "/analytics",
    ctaLabel: "Ver análise",
    createdAt: ctx.today.toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────
// Generator 4: Sem atividade há muitos dias
// ─────────────────────────────────────────────────────────────
export function noActivityGenerator(
  ctx: GeneratorContext
): AppNotification | null {
  if (ctx.daysSinceLastTransaction < 7) return null;
  if (ctx.daysSinceLastTransaction > 60) return null; // muito tempo = usuário abandonou

  return {
    key: `no-activity:${ctx.daysSinceLastTransaction}d`,
    category: "no-activity",
    severity: "info",
    title: "Sentimos sua falta",
    message: `Faz ${ctx.daysSinceLastTransaction} dias que você não atualiza o app. Bora pôr em dia?`,
    icon: "Clock",
    href: "/transactions",
    ctaLabel: "Atualizar",
    createdAt: ctx.today.toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────
// Generator 5: Boas notícias — economizou (gasto < 80% da média)
// ─────────────────────────────────────────────────────────────
export function goodSavingsGenerator(
  ctx: GeneratorContext
): AppNotification | null {
  // Só ao final do mês (dia 25+)
  if (ctx.daysSinceMonthStart < 25) return null;
  if (ctx.averageMonthlyExpense <= 0) return null;
  if (ctx.totalExpenseThisMonth <= 0) return null;

  const ratio = ctx.totalExpenseThisMonth / ctx.averageMonthlyExpense;
  if (ratio > 0.85) return null; // economizou pelo menos 15%

  const pct = Math.round((1 - ratio) * 100);
  return {
    key: `good-savings:${ctx.monthKey}`,
    category: "high-spending",
    severity: "success",
    title: `Você economizou ${pct}% este mês 🎉`,
    message: "Continue assim! Suas finanças agradecem.",
    icon: "PartyPopper",
    href: "/analytics",
    ctaLabel: "Ver detalhes",
    createdAt: ctx.today.toISOString(),
  };
}

export const ALL_GENERATORS = [
  newMonthGenerator,
  missingIncomeGenerator,
  highSpendingGenerator,
  noActivityGenerator,
  goodSavingsGenerator,
];
