import { NewRecurringButton } from "@/components/recurring/new-recurring-button";
import { RecurringList } from "@/components/recurring/recurring-list";
import { getCategories } from "@/lib/data/categories";
import { getRecurringTransactions } from "@/lib/data/recurring";

export const dynamic = "force-dynamic";

export default async function RecurringPage() {
  const [data, categories] = await Promise.all([
    getRecurringTransactions(),
    getCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Recorrências
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Transações que se repetem todo mês — criadas automaticamente
          </p>
        </div>
        <NewRecurringButton categories={categories} />
      </div>

      <RecurringList
        recurrings={data.rows}
        categories={categories}
        currency={data.currency}
        locale={data.locale}
      />
    </div>
  );
}
