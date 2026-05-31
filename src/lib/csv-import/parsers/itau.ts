import type { NormalizedTransaction, RawCSVRow } from "../types";

export function parseItau(rows: RawCSVRow[]) {
  return rows.map((raw) => {
    const dateStr = (raw["Data"] ?? "").trim().replace(/^"|"$/g, "");
    const description = (raw["Lançamento"] ?? raw["Lancamento"] ?? "")
      .trim()
      .replace(/^"|"$/g, "");
    const valueStr = (raw["Valor (R$)"] ?? raw["Valor"] ?? "")
      .trim()
      .replace(/^"|"$/g, "");

    const m = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return { raw, parsed: null, error: "Data inválida" };
    const date = `${m[3]}-${m[2]}-${m[1]}`;

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
