import type { Category, TransactionType } from "@/types/domain";

/**
 * Regras de categorização por palavras-chave.
 * Cada categoria tem array de strings que, se aparecerem na descrição
 * (case insensitive), associam à categoria.
 */

type RuleSet = Record<string, { type: TransactionType; keywords: string[] }>;

const RULES: RuleSet = {
  Alimentação: {
    type: "expense",
    keywords: [
      "ifood", "rappi", "uber eats", "ubereats",
      "supermercado", "mercado", "padaria", "padoca",
      "restaurante", "lanchonete", "pizzaria", "burguer", "burger",
      "açai", "sorveteria", "cafeteria", "starbucks",
      "carrefour", "extra", "pão de açúcar", "pao de acucar",
      "assai", "sams club", "atacadão", "atacadao",
    ],
  },
  Transporte: {
    type: "expense",
    keywords: [
      "uber", "99", "99app", "cabify", "indriver",
      "posto", "shell", "ipiranga", "petrobras", "br mania",
      "combustivel", "combustível", "gasolina", "etanol",
      "estacionamento", "zona azul", "metro", "metrô",
      "bilhete unico", "bilhete único", "pedagio", "pedágio",
      "viaoeste", "ccr", "ecorodovias",
    ],
  },
  Moradia: {
    type: "expense",
    keywords: [
      "aluguel", "condominio", "condomínio", "iptu",
      "luz", "energia", "enel", "cpfl", "light",
      "agua", "água", "sabesp", "saneago",
      "gas", "gás", "comgas", "comgás",
      "internet", "vivo fibra", "claro net", "oi fibra",
    ],
  },
  Saúde: {
    type: "expense",
    keywords: [
      "farmacia", "farmácia", "drogaria", "raia", "drogasil", "panvel",
      "hospital", "clinica", "clínica", "consultorio", "consultório",
      "laboratorio", "laboratório", "exame",
      "dentista", "psicologo", "psicóloga", "fisio",
      "unimed", "amil", "bradesco saude",
    ],
  },
  Educação: {
    type: "expense",
    keywords: [
      "escola", "faculdade", "universidade", "curso",
      "udemy", "alura", "rocketseat", "coursera", "edx",
      "livraria", "amazon kindle", "estante virtual",
    ],
  },
  Lazer: {
    type: "expense",
    keywords: [
      "cinema", "cinemark", "kinoplex",
      "ingresso", "show", "teatro",
      "steam", "playstation", "nintendo", "xbox",
      "bar ", " bar", "pub", "balada",
      "viagem", "hotel", "airbnb", "booking", "decolar",
    ],
  },
  Assinaturas: {
    type: "expense",
    keywords: [
      "netflix", "spotify", "disney+", "disney plus",
      "youtube premium", "amazon prime", "prime video",
      "hbo max", "globoplay", "deezer", "apple music",
      "icloud", "google one", "dropbox",
      "chatgpt", "openai", "anthropic", "claude",
      "github", "vercel", "supabase", "figma",
    ],
  },
  Compras: {
    type: "expense",
    keywords: [
      "amazon", "mercadolivre", "mercado livre",
      "magazine luiza", "magalu", "americanas", "casas bahia",
      "shopee", "aliexpress", "shein",
      "renner", "c&a", "riachuelo", "zara",
      "decathlon", "centauro", "netshoes",
    ],
  },
  Salário: {
    type: "income",
    keywords: ["salario", "salário", "folha de pagamento", "remuneração"],
  },
  Freelance: {
    type: "income",
    keywords: ["freela", "freelance", "pj ", "prestação de servico"],
  },
  Rendimentos: {
    type: "income",
    keywords: ["rendimento", "dividendo", "juros sobre", "tesouro"],
  },
};

/**
 * Tenta encontrar categoria por keyword.
 * Retorna { categoryId, confidence } ou null.
 */
export function suggestByRules(
  description: string,
  type: TransactionType,
  categories: Category[]
): { categoryId: string; confidence: "high" | "medium" } | null {
  const desc = description.toLowerCase();

  for (const [categoryName, rule] of Object.entries(RULES)) {
    if (rule.type !== type) continue;

    const matched = rule.keywords.find((kw) => desc.includes(kw));
    if (!matched) continue;

    // Encontra a categoria no banco (do sistema OU do usuário)
    const cat = categories.find(
      (c) =>
        c.type === type &&
        c.name.toLowerCase().trim() === categoryName.toLowerCase().trim()
    );
    if (!cat) continue;

    // Match longo = mais confiança (>= 5 chars = high)
    const confidence = matched.length >= 5 ? "high" : "medium";
    return { categoryId: cat.id, confidence };
  }

  return null;
}
