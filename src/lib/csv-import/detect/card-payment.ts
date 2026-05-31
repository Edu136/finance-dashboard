import type { ImportRow } from "../types";

const CARD_PAYMENT_KEYWORDS = [
  "pagamento de fatura",
  "pgto fatura",
  "pgto. fatura",
  "pagto fatura",
  "pagamento recebido",
  "pagamento on line",
  "pagto cartao",
  "pagto cartão",
  "credito de pagamento",
];

/**
 * Marca pagamentos da própria fatura como "card-payment".
 * Esses não devem ser importados (duplicariam).
 */
export function flagCardPayments(rows: ImportRow[]): ImportRow[] {
  return rows.map((row) => {
    if (!row.parsed || row.status === "invalid") return row;

    const desc = row.parsed.description.toLowerCase();
    const isCardPayment = CARD_PAYMENT_KEYWORDS.some((kw) => desc.includes(kw));

    if (isCardPayment) {
      return {
        ...row,
        status: "card-payment",
        reason: "Pagamento da própria fatura — ignorado",
      };
    }

    return row;
  });
}
