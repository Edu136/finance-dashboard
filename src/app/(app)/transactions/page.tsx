import { NewTransactionButton } from "@/components/transactions/new-transaction-button";
import { Pagination } from "@/components/transactions/pagination";
import { TransactionsFilters } from "@/components/transactions/transactions-filters";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { getCategories } from "@/lib/data/categories";
import { getTransactionsList } from "@/lib/data/transactions";
import type { TransactionType } from "@/types/domain";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  type?: string;
  category?: string;
  start?: string;
  end?: string;
  page?: string;
}>;

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  const validTypes: TransactionType[] = ["income", "expense", "investment"];
  const type = validTypes.includes(sp.type as TransactionType)
    ? (sp.type as TransactionType)
    : undefined;

  const [list, categories] = await Promise.all([
    getTransactionsList({
      type,
      categoryId: sp.category,
      startDate: sp.start,
      endDate: sp.end,
      page: sp.page ? Number(sp.page) : 1,
    }),
    getCategories(),
  ]);

  if (!list) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transações</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie todas as suas movimentações
          </p>
        </div>
        <NewTransactionButton categories={categories} />
      </div>

      <TransactionsFilters categories={categories} />

      <TransactionsTable
        userId={list.userId}
        initialData={list.rows}
        categories={categories}
        currency={list.currency}
        locale={list.locale}
      />

      <Pagination
        page={list.page}
        totalPages={list.totalPages}
        total={list.total}
      />
    </div>
  );
}
