import type { Transaction } from "@/types/domain";

import { ALL_GENERATORS, type GeneratorContext } from "./generators";
import type { AppNotification } from "./types";

type ComputeInput = {
  today: Date;
  allTransactions: Transaction[];
  dismissedKeys: Set<string>;
};

export function computeNotifications({
  today,
  allTransactions,
  dismissedKeys,
}: ComputeInput): AppNotification[] {
  const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const daysSinceMonthStart =
    Math.floor((today.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Transações deste mês
  const transactionsThisMonth = allTransactions.filter((t) => {
    const d = new Date(t.date + "T00:00:00");
    return d >= monthStart && d <= today && t.status === "confirmed";
  });

  // Transações do mês passado
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
  const transactionsLastMonth = allTransactions.filter((t) => {
    const d = new Date(t.date + "T00:00:00");
    return d >= lastMonthStart && d <= lastMonthEnd && t.status === "confirmed";
  });

  // Média de gastos últimos 3 meses (excluindo o atual)
  const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1);
  const last3MonthsExpenses = allTransactions.filter((t) => {
    const d = new Date(t.date + "T00:00:00");
    return (
      d >= threeMonthsAgo &&
      d < monthStart &&
      t.status === "confirmed" &&
      t.type === "expense"
    );
  });

  const averageMonthlyExpense =
    last3MonthsExpenses.length > 0
      ? last3MonthsExpenses.reduce((s, t) => s + Number(t.amount), 0) / 3
      : 0;

  const totalExpenseThisMonth = transactionsThisMonth
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  const totalIncomeThisMonth = transactionsThisMonth
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);

  // Dias desde a última transação
  const lastTransaction = allTransactions[0]; // já vem ordenado desc
  const daysSinceLastTransaction = lastTransaction
    ? Math.floor(
        (today.getTime() -
          new Date(lastTransaction.date + "T00:00:00").getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 999;

  const ctx: GeneratorContext = {
    today,
    monthKey,
    daysSinceMonthStart,
    daysSinceLastTransaction,
    transactionsThisMonth,
    transactionsLastMonth,
    averageMonthlyExpense,
    totalExpenseThisMonth,
    totalIncomeThisMonth,
  };

  return ALL_GENERATORS.map((gen) => gen(ctx))
    .filter((n): n is AppNotification => n !== null)
    .filter((n) => !dismissedKeys.has(n.key));
}
