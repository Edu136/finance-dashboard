import Papa from "papaparse";

import type { Category, Transaction, TransactionType, TransactionStatus } from "@/types/domain";

// ─────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────
export function transactionsToCSV(
  transactions: Transaction[],
  categories: Category[]
): string {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const rows = transactions.map((t) => ({
    date: t.date,
    type: t.type,
    amount: t.amount.toFixed(2),
    description: t.description,
    category: t.category_id ? categoryMap.get(t.category_id) ?? "" : "",
    status: t.status,
    notes: t.notes ?? "",
  }));

  return Papa.unparse(rows, {
    header: true,
    columns: ["date", "type", "amount", "description", "category", "status", "notes"],
  });
}

export function downloadCSV(filename: string, content: string) {
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────
// IMPORT
// ─────────────────────────────────────────────────────────────
export type CSVRow = {
  date: string;
  type: string;
  amount: string;
  description: string;
  category?: string;
  status?: string;
  notes?: string;
};

export type ParsedRow = {
  lineNumber: number;
  raw: CSVRow;
  data?: {
    date: string;
    type: TransactionType;
    amount: number;
    description: string;
    category_id: string | null;
    status: TransactionStatus;
    notes: string | null;
  };
  error?: string;
};

const VALID_TYPES = ["income", "expense", "investment"];
const VALID_STATUS = ["confirmed", "pending", "cancelled"];

export function parseCSV(file: File): Promise<CSVRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    });
  });
}

export function validateRows(rows: CSVRow[], categories: Category[]): ParsedRow[] {
  const categoryByName = new Map(
    categories.map((c) => [c.name.toLowerCase().trim(), c])
  );

  return rows.map((raw, idx) => {
    const lineNumber = idx + 2; // +2 = header (1) + base 1
    const result: ParsedRow = { lineNumber, raw };

    // date
    if (!raw.date || !/^\d{4}-\d{2}-\d{2}$/.test(raw.date.trim())) {
      result.error = "Data inválida (use YYYY-MM-DD)";
      return result;
    }

    // type
    const type = raw.type?.trim().toLowerCase() as TransactionType;
    if (!VALID_TYPES.includes(type)) {
      result.error = `Tipo inválido (use: ${VALID_TYPES.join(", ")})`;
      return result;
    }

    // amount
    const amount = Number(String(raw.amount).replace(",", "."));
    if (!isFinite(amount) || amount <= 0) {
      result.error = "Valor inválido (deve ser número positivo)";
      return result;
    }

    // description
    const description = raw.description?.trim() ?? "";
    if (!description) {
      result.error = "Descrição obrigatória";
      return result;
    }
    if (description.length > 120) {
      result.error = "Descrição muito longa (máx 120 chars)";
      return result;
    }

    // category (opcional, mas se preenchida deve existir e bater com o type)
    let category_id: string | null = null;
    if (raw.category && raw.category.trim()) {
      const cat = categoryByName.get(raw.category.trim().toLowerCase());
      if (!cat) {
        result.error = `Categoria "${raw.category}" não encontrada`;
        return result;
      }
      if (cat.type !== type) {
        result.error = `Categoria "${cat.name}" não combina com tipo ${type}`;
        return result;
      }
      category_id = cat.id;
    }

    // status
    const status = (raw.status?.trim().toLowerCase() ||
      "confirmed") as TransactionStatus;
    if (!VALID_STATUS.includes(status)) {
      result.error = `Status inválido (use: ${VALID_STATUS.join(", ")})`;
      return result;
    }

    result.data = {
      date: raw.date.trim(),
      type,
      amount,
      description,
      category_id,
      status,
      notes: raw.notes?.trim() || null,
    };
    return result;
  });
}
