import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import type { BudgetProgress } from "@/types/domain";

type Props = {
  progress: BudgetProgress[];
  currency: string;
  locale: string;
};

export function BudgetSummaryCard({ progress, currency, locale }: Props) {
  if (progress.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Saúde Financeira</CardTitle>
          <CardDescription>Defina metas para acompanhar</CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/budgets"
            className="flex items-center justify-center gap-2 rounded-md border border-dashed py-6 text-sm text-muted-foreground hover:bg-accent"
          >
            <Target className="h-4 w-4" />
            Criar primeira meta
            <ArrowRight className="h-3 w-3" />
          </Link>
        </CardContent>
      </Card>
    );
  }

  const exceeded = progress.filter((p) => p.status === "exceeded").length;
  const warning = progress.filter((p) => p.status === "warning").length;
  const safe = progress.filter((p) => p.status === "safe").length;
  const total = progress.length;
  const pctMet = total > 0 ? (safe / total) * 100 : 0;

  // Top 3 que precisam de atenção
  const attention = progress.filter((p) => p.status !== "safe").slice(0, 3);

  // Se tudo OK, mostra top 3 ativas
  const display = attention.length > 0 ? attention : progress.slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Saúde Financeira</CardTitle>
          <CardDescription>
            {exceeded > 0 ? (
              <span className="text-destructive">
                {exceeded} meta(s) excedida(s)
              </span>
            ) : warning > 0 ? (
              <span className="text-warning">
                {warning} meta(s) próxima(s) do limite
              </span>
            ) : (
              <span className="text-success">
                Tudo sob controle • {pctMet.toFixed(0)}% das metas OK
              </span>
            )}
          </CardDescription>
        </div>
        <Link
          href="/budgets"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Ver todas →
        </Link>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {display.map((p) => {
            const colorClass =
              p.status === "exceeded"
                ? "bg-destructive"
                : p.status === "warning"
                ? "bg-warning"
                : "bg-success";
            return (
              <li key={p.budget_id}>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate font-medium">
                    {p.category_name}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {formatCurrency(Number(p.spent), currency, locale)} /{" "}
                    {formatCurrency(Number(p.amount), currency, locale)}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full transition-all", colorClass)}
                    style={{ width: `${Math.min(Number(p.pct), 100)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
