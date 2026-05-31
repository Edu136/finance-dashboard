export function formatCurrency(value: number, currency = "BRL", locale = "pt-BR") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}

export function formatDate(iso: string, locale = "pt-BR") {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatMonth(iso: string, locale = "pt-BR") {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "2-digit",
  }).format(new Date(iso));
}
