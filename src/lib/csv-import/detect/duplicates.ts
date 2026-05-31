import type { ImportRow } from "../types";

/**
 * Compara hashes do CSV com hashes já existentes no banco.
 * Marca rows como "duplicate" se já existirem.
 */
export function flagDuplicates(
  rows: ImportRow[],
  existingHashes: Set<string>
): ImportRow[] {
  return rows.map((row) => {
    if (!row.hash || row.status === "invalid" || row.status === "card-payment") {
      return row;
    }

    if (existingHashes.has(row.hash)) {
      return {
        ...row,
        status: "duplicate",
        reason: "Já existe uma transação com mesma data, valor e descrição",
      };
    }

    return row;
  });
}
