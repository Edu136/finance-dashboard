"use client";

import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRealtimeTransactions } from "@/lib/hooks/use-realtime-transactions";
import type { Transaction } from "@/types/domain";

import { EmptyState } from "./empty-state";
import { TransactionRow } from "./transaction-row";

type Props = {
  userId: string;
  initialData: Transaction[];
  currency: string;
  locale: string;
};

export function RecentTransactions({
  userId,
  initialData,
  currency,
  locale,
}: Props) {
  const transactions = useRealtimeTransactions({
    userId,
    initialData,
    limit: 5,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Últimas transações</CardTitle>
          <CardDescription>Atualiza em tempo real</CardDescription>
        </div>
        <Link
          href="/transactions"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Ver todas →
        </Link>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <EmptyState
            title="Nenhuma transação ainda"
            description="Crie sua primeira transação na aba Transações."
          />
        ) : (
          <ul className="divide-y">
            {transactions.map((t) => (
              <TransactionRow
                key={t.id}
                transaction={t}
                currency={currency}
                locale={locale}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
