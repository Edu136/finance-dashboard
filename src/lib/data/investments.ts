import { ensureCdiCache, ensureStockPrices } from "@/lib/integrations/price-cache";
import { createClient } from "@/lib/supabase/server";
import type {
  Investment,
  InvestmentWithCurrent,
  InvestmentsSummary,
} from "@/types/domain";

export type InvestmentsPageData = {
  investments: InvestmentWithCurrent[];
  summary: InvestmentsSummary;
  currency: string;
  locale: string;
};

export async function getInvestmentsPageData(): Promise<InvestmentsPageData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: invsRaw } = await supabase
    .from("investments")
    .select("*")
    .eq("user_id", user.id)
    .eq("active", true)
    .order("purchase_date", { ascending: false });

  const investments = (invsRaw ?? []) as Investment[];

  const tickers = investments
    .filter((i) => i.type === "stock" && i.ticker)
    .map((i) => i.ticker as string);

  const hasFixedIncome = investments.some((i) => i.type === "fixed_income");

  const [stockPrices] = await Promise.all([
    ensureStockPrices(tickers),
    hasFixedIncome ? ensureCdiCache() : Promise.resolve(),
  ]);

  const enriched: InvestmentWithCurrent[] = await Promise.all(
    investments.map(async (inv) => {
      if (inv.type === "stock") {
        const currentPrice = stockPrices.get(inv.ticker as string) ?? null;
        const invested = Number(inv.quantity) * Number(inv.purchase_price);
        const current = currentPrice
          ? Number(inv.quantity) * currentPrice
          : invested;
        const profit = current - invested;
        const profitPct = invested > 0 ? (profit / invested) * 100 : 0;

        return {
          ...inv,
          current_value: current,
          current_unit_price: currentPrice,
          profit,
          profit_pct: profitPct,
        };
      }

      const { data: calcResult } = await supabase.rpc(
        "calculate_fixed_income_value",
        {
          p_applied_amount: inv.applied_amount,
          p_cdi_percentage: inv.cdi_percentage,
          p_purchase_date: inv.purchase_date,
        }
      );

      const current = Number(calcResult ?? inv.applied_amount);
      const invested = Number(inv.applied_amount);
      const profit = current - invested;
      const profitPct = invested > 0 ? (profit / invested) * 100 : 0;

      return {
        ...inv,
        current_value: current,
        current_unit_price: null,
        profit,
        profit_pct: profitPct,
      };
    })
  );

  const { data: summaryData } = await supabase.rpc("get_investments_summary", {
    p_user_id: user.id,
  });

  const summaryRow = summaryData?.[0] ?? {
    total_invested: 0,
    current_value: 0,
    profit: 0,
    profit_pct: 0,
  };

  const { data: profile } = await supabase
    .from("profiles")
    .select("currency, locale")
    .eq("id", user.id)
    .single();

  return {
    investments: enriched,
    summary: {
      total_invested: Number(summaryRow.total_invested),
      current_value: Number(summaryRow.current_value),
      profit: Number(summaryRow.profit),
      profit_pct: Number(summaryRow.profit_pct),
    },
    currency: profile?.currency ?? "BRL",
    locale: profile?.locale ?? "pt-BR",
  };
}

export async function getCurrentPrice(ticker: string): Promise<{
  ticker: string;
  current_price: number;
  short_name: string | null;
} | null> {
  const map = await ensureStockPrices([ticker.toUpperCase()]);
  const price = map.get(ticker.toUpperCase());
  if (!price) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("asset_prices")
    .select("short_name")
    .eq("ticker", ticker.toUpperCase())
    .maybeSingle();

  return {
    ticker: ticker.toUpperCase(),
    current_price: price,
    short_name: data?.short_name ?? null,
  };
}
