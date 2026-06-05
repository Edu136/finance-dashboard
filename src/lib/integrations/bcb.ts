import "server-only";

const BCB_BASE = "https://api.bcb.gov.br/dados/serie";
const SERIES_CDI = 12;

type BcbRate = {
  data: string;
  valor: string;
};

/**
 * Busca ultimos N dias de CDI.
 * Free, sem token.
 */
export async function fetchRecentCdi(
  daysBack = 90
): Promise<{ date: string; rate: number }[]> {
  const url = `${BCB_BASE}/bcdata.sgs.${SERIES_CDI}/dados/ultimos/${daysBack}?formato=json`;

  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) {
      console.warn("[bcb] HTTP", res.status);
      return [];
    }

    const json = (await res.json()) as BcbRate[];
    return json.map((r) => ({
      date: brToISO(r.data),
      // BCB retorna em % (ex: 0.04492 = 0.04492%). Converte pra decimal.
      rate: Number(r.valor) / 100,
    }));
  } catch (err) {
    console.error("[bcb] fetch falhou", err);
    return [];
  }
}

/**
 * 15/01/2026 -> 2026-01-15
 */
function brToISO(brDate: string): string {
  const [d, m, y] = brDate.split("/");
  return `${y}-${m}-${d}`;
}
