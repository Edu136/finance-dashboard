import { createClient } from "@/lib/supabase/server";
import type { RecurringTransaction } from "@/types/domain";

export type MaterializeResult = {
  created: number;
  recurrings: { description: string; amount: number; type: string }[];
};

/**
 * Verifica recurrings com next_due_date <= hoje e materializa transactions.
 * Idempotente: pode rodar várias vezes sem duplicar.
 */
export async function materializePendingRecurrings(): Promise<MaterializeResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { created: 0, recurrings: [] };

  const today = new Date().toISOString().slice(0, 10);

  // 1) Busca recurrings ativos com data vencida
  const { data: pending } = await supabase
    .from("recurring_transactions")
    .select("*")
    .eq("user_id", user.id)
    .eq("active", true)
    .lte("next_due_date", today);

  if (!pending || pending.length === 0) {
    return { created: 0, recurrings: [] };
  }

  const created: MaterializeResult["recurrings"] = [];

  // 2) Pra cada um, cria transaction e atualiza next_due_date
  for (const r of pending as RecurringTransaction[]) {
    let dueDate = r.next_due_date;
    let runCount = 0;

    // Loop pra cobrir caso o usuário ficou meses sem entrar (cria todas as faltantes)
    while (dueDate <= today && runCount < 12) {
      // Insere transaction (com hash pra evitar duplicata se recriar)
      const importHash = `recurring:${r.id}:${dueDate}`;

      const { error: insertError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          type: r.type,
          amount: r.amount,
          description: r.description,
          date: dueDate,
          category_id: r.category_id,
          status: "confirmed",
          notes: r.notes,
          import_hash: importHash,
          is_recurring: true,
          recurrence_note: `Gerada pela recorrência "${r.description}"`,
        });

      // Se já existir (constraint unique), apenas pula
      if (insertError && insertError.code !== "23505") {
        console.error("Erro ao materializar recurring:", insertError);
        break;
      }

      if (!insertError) {
        created.push({
          description: r.description,
          amount: Number(r.amount),
          type: r.type,
        });
      }

      // Calcula próximo
      const { data: nextDate } = await supabase.rpc(
        "calculate_next_due_date",
        {
          p_from_date: dueDate,
          p_day_of_month: r.day_of_month,
        }
      );

      if (!nextDate) break;
      dueDate = nextDate as unknown as string;
      runCount++;
    }

    // Atualiza recurring com novo next_due_date
    if (dueDate !== r.next_due_date) {
      await supabase
        .from("recurring_transactions")
        .update({
          next_due_date: dueDate,
          last_run_at: new Date().toISOString(),
          total_runs: r.total_runs + runCount,
        })
        .eq("id", r.id);
    }
  }

  return { created: created.length, recurrings: created };
}
