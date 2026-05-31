import Papa from "papaparse";

import type { BankFormat, NormalizedTransaction, RawCSVRow } from "../types";
import { parseGeneric } from "./generic";
import { parseInter } from "./inter";
import { parseItau } from "./itau";
import { parseNubank } from "./nubank";

export type ParseResult = {
  format: BankFormat;
  rows: { raw: RawCSVRow; parsed: NormalizedTransaction | null; error?: string }[];
};

const BANK_PARSERS: Record<
  Exclude<BankFormat, "unknown" | "generic">,
  (rows: RawCSVRow[]) => ReturnType<typeof parseGeneric>
> = {
  nubank: parseNubank,
  inter: parseInter,
  itau: parseItau,
};

export async function parseCSVFile(file: File): Promise<ParseResult> {
  const text = await file.text();
  const format = detectFormat(text);

  // Re-parse já com delimiter correto (Itaú usa ;)
  const delimiter = format === "itau" ? ";" : ",";
  const result = Papa.parse<RawCSVRow>(text, {
    header: true,
    skipEmptyLines: true,
    delimiter,
    transformHeader: (h) => h.trim(),
  });

  const raws = result.data;

  if (format === "unknown" || format === "generic") {
    return { format: "generic", rows: parseGeneric(raws) };
  }

  return { format, rows: BANK_PARSERS[format](raws) };
}

/** Heurística: olha headers/primeiras linhas pra decidir o banco */
function detectFormat(text: string): BankFormat {
  const firstLine = text.split("\n")[0]?.toLowerCase() ?? "";

  // Nubank: "date,title,amount" ou "data,descrição,valor"
  if (firstLine.includes("title") && firstLine.includes("amount")) return "nubank";

  // Inter: "Data Lançamento,Histórico,Valor"
  if (firstLine.includes("data lançamento") || firstLine.includes("data lancamento"))
    return "inter";

  // Itaú: usa ; como delimitador, headers entre aspas
  if (firstLine.includes(";") && firstLine.includes("lançamento")) return "itau";

  return "generic";
}
