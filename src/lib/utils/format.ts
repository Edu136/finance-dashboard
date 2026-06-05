export function formatCurrency(value: number, currency = "BRL", locale = "pt-BR") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}

function parseLocalDate(value: string): Date {
  // Parse YYYY-MM-DD sem aplicar UTC para evitar deslocamento de dia/mês.
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, year, month, day] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  return new Date(value);
}

export function formatDate(iso: string, locale = "pt-BR") {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parseLocalDate(iso));
}

export function formatMonth(iso: string, locale = "pt-BR") {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "2-digit",
  }).format(parseLocalDate(iso));
}
