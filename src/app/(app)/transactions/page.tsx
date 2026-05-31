import { ExportButton } from "@/components/transactions/export-button";
import { ImportButton } from "@/components/transactions/import-button";
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Transações</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Gerencie todas as suas movimentações
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <ImportButton categories={categories} />
          <ExportButton categories={categories} />
          <NewTransactionButton categories={categories} />
        </div>
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
