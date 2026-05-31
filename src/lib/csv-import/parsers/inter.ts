import type { NormalizedTransaction, RawCSVRow } from "../types";

export function parseInter(rows: RawCSVRow[]) {
  return rows.map((raw) => {
    const dateStr = (raw["Data Lançamento"] ?? raw["Data Lancamento"] ?? "").trim();
    const description = (raw["Histórico"] ?? raw["Historico"] ?? "").trim();
    const valueStr = (raw["Valor"] ?? "").trim();

    // Inter: 15/01/2026 → 2026-01-15
    const m = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return { raw, parsed: null, error: "Data inválida" };
    const date = `${m[3]}-${m[2]}-${m[1]}`;

    // Inter: "-30,50" ou "1.234,56"
    const amount = Number(valueStr.replace(/\./g, "").replace(",", "."));
    if (!isFinite(amount)) return { raw, parsed: null, error: "Valor inválido" };
    if (!description) return { raw, parsed: null, error: "Descrição vazia" };

    const parsed: NormalizedTransaction = {
      date,
      amount: Math.abs(amount),
      type: amount < 0 ? "expense" : "income",
      description,
      rawDescription: description,
    };
    return { raw, parsed };
  });
}
