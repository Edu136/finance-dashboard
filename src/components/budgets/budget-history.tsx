import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatMonth } from "@/lib/utils/format";
import type { BudgetHistoryEntry } from "@/types/domain";

type Props = {
  history: BudgetHistoryEntry[];
  currency: string;
  locale: string;
};

export function BudgetHistory({ history, currency, locale }: Props) {
  if (history.length === 0 || history.every((h) => h.total_budgets === 0)) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Histórico de metas</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {history.map((h) => {
            const ratio =
              h.total_budgets > 0 ? h.met_budgets / h.total_budgets : 0;
            const color =
              ratio >= 0.8
                ? "text-success"
                : ratio >= 0.5
                ? "text-warning"
                : "text-destructive";

            return (
              <li
                key={h.month}
                className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm"
              >
                <span className="font-medium capitalize">
                  {formatMonth(h.month, locale)}
                </span>
                <div className="flex items-center gap-3 text-right">
                  <span className={color}>
                    {h.met_budgets} de {h.total_budgets} batidas
                  </span>
                  {Number(h.exceeded) > 0 && (
                    <span className="text-xs text-destructive">
                      +{formatCurrency(Number(h.exceeded), currency, locale)}{" "}
                      excedido
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
