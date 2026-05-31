import type { NormalizedTransaction, RawCSVRow } from "../types";

export function parseNubank(rows: RawCSVRow[]) {
  return rows.map((raw) => {
    const date = raw.date?.trim();
    const title = raw.title?.trim() ?? raw["descrição"]?.trim() ?? "";
    const amount = Number(raw.amount?.replace(",", "."));

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { raw, parsed: null, error: "Data inválida" };
    }
    if (!isFinite(amount)) {
      return { raw, parsed: null, error: "Valor inválido" };
    }
    if (!title) return { raw, parsed: null, error: "Descrição vazia" };

    // No Nubank fatura, valores positivos = compras (gastos)
    // Valores negativos = estornos/pagamentos = receitas
    const parsed: NormalizedTransaction = {
      date,
      amount: Math.abs(amount),
      type: amount >= 0 ? "expense" : "income",
      description: title,
      rawDescription: title,
    };
    return { raw, parsed };
  });
}
