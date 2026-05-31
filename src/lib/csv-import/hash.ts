/**
 * Hash determinístico para detectar duplicatas.
 * Mesma data + valor + descrição normalizada = mesmo hash.
 */

function normalizeDescription(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // remove acentos
    .replace(/[^a-z0-9\s]/g, " ")     // remove especiais
    .replace(/\s+/g, " ")              // collapse spaces
    .trim();
}

/** Hash síncrono leve via FNV-1a (suficiente pra detectar duplicatas) */
function fnv1a(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

export function computeHash(
  date: string,
  amount: number,
  description: string
): string {
  const key = `${date}|${amount.toFixed(2)}|${normalizeDescription(description)}`;
  return fnv1a(key);
}
