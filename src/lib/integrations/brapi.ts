import "server-only";

const BRAPI_BASE = "https://brapi.dev/api";

export type BrapiQuote = {
  ticker: string;
  current_price: number;
  previous_close: number | null;
  change_pct: number | null;
  short_name: string | null;
  long_name: string | null;
};

type BrapiResponse = {
  results: Array<{
    symbol: string;
    regularMarketPrice: number;
    regularMarketPreviousClose?: number;
    regularMarketChangePercent?: number;
    shortName?: string;
    longName?: string;
  }>;
  error?: boolean;
  message?: string;
};

/**
 * Busca cotacoes de multiplos tickers numa so chamada (mais eficiente).
 * Brapi free: 500 req/dia.
 */
export async function fetchBrapiQuotes(
  tickers: string[]
): Promise<BrapiQuote[]> {
  if (tickers.length === 0) return [];

  const token = process.env.BRAPI_TOKEN;
  if (!token) {
    console.warn("[brapi] BRAPI_TOKEN nao configurado");
    return [];
  }

  const symbols = tickers.map((t) => t.toUpperCase()).join(",");
  const url = `${BRAPI_BASE}/quote/${symbols}?token=${token}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.warn("[brapi] HTTP", res.status);
      return [];
    }

    const json = (await res.json()) as BrapiResponse;
    if (json.error || !json.results) {
      console.warn("[brapi] erro", json.message);
      return [];
    }

    return json.results
      .filter((r) => typeof r.regularMarketPrice === "number")
      .map((r) => ({
        ticker: r.symbol.toUpperCase(),
        current_price: r.regularMarketPrice,
        previous_close: r.regularMarketPreviousClose ?? null,
        change_pct: r.regularMarketChangePercent ?? null,
        short_name: r.shortName ?? null,
        long_name: r.longName ?? null,
      }));
  } catch (err) {
    console.error("[brapi] fetch falhou", err);
    return [];
  }
}

/**
 * Busca cotacao de um ticker (pra autocomplete no form).
 */
export async function fetchSingleQuote(
  ticker: string
): Promise<BrapiQuote | null> {
  const results = await fetchBrapiQuotes([ticker]);
  return results[0] ?? null;
}
