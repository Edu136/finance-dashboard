import type { NormalizedTransaction, RawCSVRow } from "../types";

const DATE_KEYS = ["date", "data", "data lançamento", "data lancamento"];
const AMOUNT_KEYS = ["amount", "valor", "valor (r$)", "value"];
const DESC_KEYS = [
  "description",
  "descrição",
  "descricao",
  "title",
  "histórico",
  "historico",
  "lançamento",
  "lancamento",
];

function findKey(row: RawCSVRow, candidates: string[]): string | null {
  const keys = Object.keys(row).map((k) => k.toLowerCase().trim());
  for (const c of candidates) {
    const idx = keys.indexOf(c);
    if (idx >= 0) return Object.keys(row)[idx];
  }
  return null;
}

function parseDate(s: string): string | null {
  s = s.trim();
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // DD/MM/YYYY
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return null;
}

function parseAmount(s: string): number {
  // Aceita "1.234,56" (BR) ou "1234.56" (US) ou "-30,50"
  const cleaned = s.trim();
  // Se tem vírgula como decimal (BR)
  if (/,\d{1,2}$/.test(cleaned)) {
    return Number(cleaned.replace(/\./g, "").replace(",", "."));
  }
  return Number(cleaned);
}

export function parseGeneric(rows: RawCSVRow[]) {
  return rows.map((raw) => {
    const dateKey = findKey(raw, DATE_KEYS);
    const amountKey = findKey(raw, AMOUNT_KEYS);
    const descKey = findKey(raw, DESC_KEYS);

    if (!dateKey || !amountKey || !descKey) {
      return {
        raw,
        parsed: null,
        error: "Não consegui identificar colunas (precisa: data, valor, descrição)",
      };
    }

    const date = parseDate(raw[dateKey] ?? "");
    if (!date) return { raw, parsed: null, error: "Data inválida" };

    const amount = parseAmount(raw[amountKey] ?? "");
    if (!isFinite(amount)) return { raw, parsed: null, error: "Valor inválido" };

    const description = (raw[descKey] ?? "").trim();
    if (!description) return { raw, parsed: null, error: "Descrição vazia" };

    const parsed: NormalizedTransaction = {
      date,
      amount: Math.abs(amount),
      type: amount < 0 ? "expense" : amount > 0 ? "income" : "expense",
      description,
      rawDescription: description,
    };

    // No CSV genérico, valores positivos sem contexto de banco
    // são ambíguos. Default = expense (usuário pode mudar na review).
    if (amount > 0) parsed.type = "expense";

    return { raw, parsed };
  });
}
