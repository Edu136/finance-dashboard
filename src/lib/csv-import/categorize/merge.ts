import type { Category, TransactionType } from "@/types/domain";

import type { ImportRow } from "../types";
import { suggestByRules } from "./rules";

type MemoryEntry = {
  merchant_pattern: string;
  category_id: string;
};

/**
 * Aplica categorização em duas camadas:
 * 1. Memória do usuário (alta prioridade)
 * 2. Regras de palavra-chave (fallback)
 */
export function applyCategorySuggestions(
  rows: ImportRow[],
  categories: Category[],
  memory: MemoryEntry[]
): ImportRow[] {
  // Index da memória por padrão (lowercase)
  const memoryByPattern = new Map(
    memory.map((m) => [m.merchant_pattern.toLowerCase(), m.category_id])
  );

  return rows.map((row) => {
    if (!row.parsed || row.status === "invalid") return row;

    const desc = row.parsed.description.toLowerCase();
    const type = row.parsed.type;

    // 1) Procura na memória
    for (const [pattern, categoryId] of memoryByPattern) {
      if (desc.includes(pattern)) {
        const cat = categories.find((c) => c.id === categoryId);
        // Só usa se o tipo bate (memória é por padrão, não por tipo)
        if (cat && cat.type === type) {
          return {
            ...row,
            suggestedCategoryId: categoryId,
            suggestedCategoryConfidence: "high",
            finalCategoryId: categoryId,
            status: "ready",
          };
        }
      }
    }

    // 2) Fallback: regras
    const ruleMatch = suggestByRules(row.parsed.description, type, categories);
    if (ruleMatch) {
      return {
        ...row,
        suggestedCategoryId: ruleMatch.categoryId,
        suggestedCategoryConfidence: ruleMatch.confidence,
        finalCategoryId: ruleMatch.categoryId,
        status: "ready",
      };
    }

    // 3) Sem sugestão = revisar
    return {
      ...row,
      suggestedCategoryId: null,
      suggestedCategoryConfidence: null,
      finalCategoryId: null,
      status: "needs-review",
    };
  });
}

/**
 * Extrai "padrão de comerciante" pra salvar na memória.
 * Pega as 2-3 primeiras palavras da descrição, normalizadas.
 *
 * "UBER *TRIP-5566 SAO PAULO" → "uber trip"
 * "iFood *Restaurante XYZ" → "ifood"
 * "PADARIA SÃO JOSÉ LTDA" → "padaria sao jose"
 */
export function extractMerchantPattern(description: string): string {
  return description
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 3)
    .join(" ");
}
