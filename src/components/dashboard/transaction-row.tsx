import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { Transaction, TransactionType } from "@/types/domain";

type Props = {
  transaction: Transaction;
  currency: string;
  locale: string;
};

const META: Record<
  TransactionType,
  { icon: LucideIcon; sign: "+" | "-"; colorClass: string; label: string }
> = {
  income: {
    icon: ArrowDownLeft,
    sign: "+",
    colorClass: "text-success bg-success/10",
    label: "Receita",
  },
  expense: {
    icon: ArrowUpRight,
    sign: "-",
    colorClass: "text-destructive bg-destructive/10",
    label: "Gasto",
  },
  investment: {
    icon: TrendingUp,
    sign: "-",
    colorClass: "text-primary bg-primary/10",
    label: "Investimento",
  },
};

export function TransactionRow({ transaction, currency, locale }: Props) {
  const meta = META[transaction.type];
  const Icon = meta.icon;

  return (
    <li className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full",
            meta.colorClass
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {transaction.description}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(transaction.date, locale)}
            {transaction.status === "pending" && (
              <Badge variant="warning" className="ml-2">
                Pendente
              </Badge>
            )}
          </p>
        </div>
      </div>
      <div
        className={cn(
          "text-sm font-semibold tabular-nums",
          transaction.type === "income"
            ? "text-success"
            : transaction.type === "expense"
            ? "text-destructive"
            : "text-primary"
        )}
      >
        {meta.sign}
        {formatCurrency(transaction.amount, currency, locale)}
      </div>
    </li>
  );
}
