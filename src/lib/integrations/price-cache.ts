import "server-only";

import { createClient } from "@supabase/supabase-js";

import { fetchRecentCdi } from "./bcb";
import { fetchBrapiQuotes } from "./brapi";

const STOCK_CACHE_TTL_MS = 15 * 60 * 1000;
const CDI_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Garante que tickers tenham preco fresco no cache.
 * Retorna mapa ticker -> current_price.
 */
export async function ensureStockPrices(
  tickers: string[]
): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  if (tickers.length === 0) return result;

  const supabase = createServiceClient();
  if (!supabase) {
    console.warn("[price-cache] SUPABASE_SERVICE_ROLE_KEY nao configurada");
    return result;
  }

  const uniqueTickers = Array.from(new Set(tickers.map((t) => t.toUpperCase())));

  const { data: cached } = await supabase
    .from("asset_prices")
    .select("ticker, current_price, fetched_at")
    .in("ticker", uniqueTickers);

  const now = Date.now();
  const cachedMap = new Map((cached ?? []).map((c) => [c.ticker, c]));

  const stale: string[] = [];
  for (const ticker of uniqueTickers) {
    const c = cachedMap.get(ticker);
    if (!c || now - new Date(c.fetched_at).getTime() > STOCK_CACHE_TTL_MS) {
      stale.push(ticker);
    } else {
      result.set(ticker, Number(c.current_price));
    }
  }

  if (stale.length > 0) {
    const fresh = await fetchBrapiQuotes(stale);

    if (fresh.length > 0) {
      const upserts = fresh.map((q) => ({
        ticker: q.ticker,
        current_price: q.current_price,
        previous_close: q.previous_close,
        change_pct: q.change_pct,
        short_name: q.short_name,
        long_name: q.long_name,
        fetched_at: new Date().toISOString(),
      }));

      await supabase.from("asset_prices").upsert(upserts);

      for (const q of fresh) {
        result.set(q.ticker, q.current_price);
      }
    }

    for (const t of stale) {
      if (!result.has(t)) {
        const c = cachedMap.get(t);
        if (c) result.set(t, Number(c.current_price));
      }
    }
  }

  return result;
}

/**
 * Garante CDI atualizado no cache.
 */
export async function ensureCdiCache(): Promise<void> {
  const supabase = createServiceClient();
  if (!supabase) {
    console.warn("[price-cache] SUPABASE_SERVICE_ROLE_KEY nao configurada");
    return;
  }

  const { data: latest } = await supabase
    .from("cdi_rates")
    .select("date, fetched_at")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const now = Date.now();
  if (latest && now - new Date(latest.fetched_at).getTime() < CDI_CACHE_TTL_MS) {
    return;
  }

  const rates = await fetchRecentCdi(365);
  if (rates.length === 0) return;

  const upserts = rates.map((r) => ({
    date: r.date,
    rate: r.rate,
    fetched_at: new Date().toISOString(),
  }));

  await supabase.from("cdi_rates").upsert(upserts, { onConflict: "date" });
}
