"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRealtimeTransactions } from "@/lib/hooks/use-realtime-transactions";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { Category, Transaction } from "@/types/domain";

import { DeleteDialog } from "./delete-dialog";
import { TransactionModal } from "./transaction-modal";

type Props = {
  userId: string;
  initialData: Transaction[];
  categories: Category[];
  currency: string;
  locale: string;
};

const TYPE_LABEL: Record<Transaction["type"], string> = {
  income: "Receita",
  expense: "Gasto",
  investment: "Investimento",
};

export function TransactionsTable({
  userId,
  initialData,
  categories,
  currency,
  locale,
}: Props) {
  const transactions = useRealtimeTransactions({ userId, initialData });

  const categoriesById = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);

  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <Th>Descrição</Th>
              <Th>Tipo</Th>
              <Th>Categoria</Th>
              <Th>Data</Th>
              <Th className="text-right">Valor</Th>
              <Th>Status</Th>
              <Th className="w-24 text-right">Ações</Th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground">
                  Nenhuma transação encontrada.
                </td>
              </tr>
            ) : (
              transactions.map((t) => {
                const cat = t.category_id
                  ? categoriesById.get(t.category_id)
                  : null;
                const colorClass =
                  t.type === "income"
                    ? "text-success"
                    : t.type === "expense"
                    ? "text-destructive"
                    : "text-primary";
                return (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30">
                    <Td className="font-medium">{t.description}</Td>
                    <Td>
                      <Badge
                        variant={
                          t.type === "income"
                            ? "success"
                            : t.type === "expense"
                            ? "destructive"
                            : "default"
                        }
                      >
                        {TYPE_LABEL[t.type]}
                      </Badge>
                    </Td>
                    <Td>
                      {cat ? (
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </Td>
                    <Td>{formatDate(t.date, locale)}</Td>
                    <Td className={cn("text-right font-semibold tabular-nums", colorClass)}>
                      {t.type === "income" ? "+" : "-"}
                      {formatCurrency(t.amount, currency, locale)}
                    </Td>
                    <Td>
                      {t.status === "pending" && <Badge variant="warning">Pendente</Badge>}
                      {t.status === "confirmed" && <Badge variant="outline">Confirmada</Badge>}
                      {t.status === "cancelled" && <Badge variant="outline">Cancelada</Badge>}
                    </Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditing(t)}
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleting(t)}
                          aria-label="Excluir"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <TransactionModal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        categories={categories}
        transaction={editing ?? undefined}
      />

      <DeleteDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        transactionId={deleting?.id ?? ""}
        description={deleting?.description ?? ""}
      />
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground",
        className
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("px-4 py-3 align-middle", className)}>{children}</td>;
}
