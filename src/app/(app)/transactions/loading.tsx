import { TransactionsSkeleton } from "@/components/transactions/transactions-skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transações</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie todas as suas movimentações
        </p>
      </div>
      <TransactionsSkeleton />
    </div>
  );
}
