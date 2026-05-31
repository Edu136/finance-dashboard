import { BudgetHistory } from "@/components/budgets/budget-history";
import { BudgetList } from "@/components/budgets/budget-list";
import { NewBudgetButton } from "@/components/budgets/new-budget-button";
import { getCategories } from "@/lib/data/categories";
import { getBudgetsHistory, getBudgetsList } from "@/lib/data/budgets";

export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  const [data, categories, history] = await Promise.all([
    getBudgetsList(),
    getCategories(),
    getBudgetsHistory(6),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Metas
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Defina limites mensais e acompanhe seu progresso
          </p>
        </div>
        <NewBudgetButton categories={categories} />
      </div>

      <BudgetList
        budgets={data.budgets}
        progress={data.progress}
        categories={categories}
        currency={data.currency}
        locale={data.locale}
      />

      <BudgetHistory
        history={history}
        currency={data.currency}
        locale={data.locale}
      />
    </div>
  );
}
