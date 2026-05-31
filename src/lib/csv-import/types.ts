import type { TransactionType, TransactionStatus } from "@/types/domain";

export type BankFormat = "nubank" | "inter" | "itau" | "generic" | "unknown";

export type RawCSVRow = Record<string, string>;

/** Linha já parseada e normalizada (independente do banco) */
export type NormalizedTransaction = {
  date: string;            // YYYY-MM-DD
  amount: number;          // sempre positivo
  type: TransactionType;   // detectado pelo sinal original
  description: string;     // limpa, sem códigos
  rawDescription: string;  // original (pra mostrar no review)
};

export type ImportRowStatus =
  | "ready"              // verde — pronto pra importar
  | "needs-review"       // amarelo — sem categoria sugerida
  | "duplicate"          // cinza — já existe no banco
  | "card-payment"       // cinza — pagamento da própria fatura
  | "ignored"            // cinza — usuário marcou pra ignorar
  | "invalid";           // vermelho — erro de parsing

export type ImportRow = {
  id: string;                          // gerado no client (uuid)
  lineNumber: number;
  raw: RawCSVRow;
  parsed: NormalizedTransaction | null;
  hash: string | null;
  suggestedCategoryId: string | null;
  suggestedCategoryConfidence: "high" | "medium" | "low" | null;
  finalCategoryId: string | null;      // o que o user escolheu (pode = sugerida)
  status: ImportRowStatus;
  reason?: string;                     // motivo se invalid/duplicate/card-payment
};

export type ImportSummary = {
  total: number;
  ready: number;
  needsReview: number;
  duplicates: number;
  cardPayments: number;
  invalid: number;
};
