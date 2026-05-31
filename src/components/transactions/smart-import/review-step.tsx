"use client";

import { useMemo, useState } from "react";
import { AlertCircle, AlertTriangle, Ban, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import type {
  ImportRow,
  ImportRowStatus,
  ImportSummary,
} from "@/lib/csv-import/types";
import type { BankFormat } from "@/lib/csv-import/types";
import type { Category } from "@/types/domain";

type Props = {
  bankFormat: BankFormat;
  rows: ImportRow[];
  categories: Category[];
  summary: ImportSummary;
  pending: boolean;
  onChange: (id: string, patch: Partial<ImportRow>) => void;
  onConfirm: () => void;
  onBack: () => void;
};

const STATUS_BADGE: Record<
  ImportRowStatus,
  { label: string; variant: "success" | "warning" | "outline" | "destructive"; icon: React.ReactNode }
> = {
  ready: {
    label: "Pronta",
    variant: "success",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  "needs-review": {
    label: "Revisar",
    variant: "warning",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  duplicate: {
    label: "Duplicada",
    variant: "outline",
    icon: <Ban className="h-3 w-3" />,
  },
  "card-payment": {
    label: "Pgto fatura",
    variant: "outline",
    icon: <Ban className="h-3 w-3" />,
  },
  ignored: { label: "Ignorada", variant: "outline", icon: <Ban className="h-3 w-3" /> },
  invalid: {
    label: "Inválida",
    variant: "destructive",
    icon: <AlertCircle className="h-3 w-3" />,
  },
};

const FILTERS: { id: ImportRowStatus | "all"; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "needs-review", label: "Revisar" },
  { id: "ready", label: "Prontas" },
  { id: "duplicate", label: "Duplicadas" },
  { id: "card-payment", label: "Pgto fatura" },
  { id: "invalid", label: "Inválidas" },
];

export function ReviewStep({
  bankFormat,
  rows,
  categories,
  summary,
  pending,
  onChange,
  onConfirm,
  onBack,
}: Props) {
  const [filter, setFilter] = useState<ImportRowStatus | "all">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((r) => r.status === filter);
  }, [rows, filter]);

  const willImport = rows.filter(
    (r) => r.status === "ready" && r.finalCategoryId !== null
  ).length;

  const readyWithoutCategory = rows.filter(
    (r) => r.status === "ready" && !r.finalCategoryId
  ).length;

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  return (
    <div className="space-y-4">
      {/* Header com info do banco */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/30 p-3">
        <div className="text-sm">
          Formato detectado:{" "}
          <span className="font-semibold capitalize">
            {bankFormat === "generic" ? "CSV genérico" : bankFormat}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">{summary.ready} prontas</Badge>
          {summary.needsReview > 0 && (
            <Badge variant="warning">{summary.needsReview} revisar</Badge>
          )}
          {summary.duplicates > 0 && (
            <Badge variant="outline">{summary.duplicates} duplicadas</Badge>
          )}
          {summary.cardPayments > 0 && (
            <Badge variant="outline">{summary.cardPayments} pgto</Badge>
          )}
          {summary.invalid > 0 && (
            <Badge variant="destructive">{summary.invalid} erros</Badge>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              filter === f.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="max-h-[420px] overflow-y-auto rounded-md border">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-muted/90 backdrop-blur">
            <tr>
              <th className="w-10 px-2 py-2"></th>
              <th className="px-2 py-2 text-left">Data</th>
              <th className="px-2 py-2 text-left">Descrição</th>
              <th className="px-2 py-2 text-right">Valor</th>
              <th className="px-2 py-2 text-left">Tipo</th>
              <th className="px-2 py-2 text-left">Categoria</th>
              <th className="px-2 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhuma linha com esse filtro.
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                const meta = STATUS_BADGE[row.status];
                const isActive = row.status === "ready" || row.status === "needs-review";
                const catName = row.finalCategoryId
                  ? categoryMap.get(row.finalCategoryId)?.name ?? "—"
                  : "—";

                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-t",
                      !isActive && "opacity-50"
                    )}
                  >
                    {/* Toggle ignore */}
                    <td className="px-2 py-2">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => {
                          if (isActive) {
                            onChange(row.id, { status: "ignored" });
                          } else if (row.status === "ignored") {
                            onChange(row.id, {
                              status: row.finalCategoryId ? "ready" : "needs-review",
                            });
                          }
                        }}
                        disabled={row.status === "invalid" || row.status === "duplicate" || row.status === "card-payment"}
                        className="h-3.5 w-3.5 rounded border-gray-300"
                      />
                    </td>
                    {/* Data */}
                    <td className="whitespace-nowrap px-2 py-2">
                      {row.parsed?.date ?? "—"}
                    </td>
                    {/* Descrição */}
                    <td className="max-w-[200px] truncate px-2 py-2" title={row.parsed?.rawDescription}>
                      {row.parsed?.description ?? row.reason ?? "Erro"}
                    </td>
                    {/* Valor */}
                    <td className="whitespace-nowrap px-2 py-2 text-right">
                      {row.parsed ? formatCurrency(row.parsed.amount) : "—"}
                    </td>
                    {/* Tipo */}
                    <td className="px-2 py-2">
                      {row.parsed?.type === "income" ? (
                        <span className="text-emerald-600">Receita</span>
                      ) : row.parsed?.type === "expense" ? (
                        <span className="text-red-500">Despesa</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    {/* Categoria */}
                    <td className="px-2 py-2">
                      {isActive ? (
                        <select
                          value={row.finalCategoryId ?? ""}
                          onChange={(e) => {
                            const catId = e.target.value || null;
                            onChange(row.id, {
                              finalCategoryId: catId,
                              status: catId ? "ready" : "needs-review",
                            });
                          }}
                          className="h-7 w-full max-w-[140px] rounded border bg-background px-1 text-xs"
                        >
                          <option value="">Selecionar...</option>
                          {categories
                            .filter((c) => c.type === row.parsed?.type)
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                        </select>
                      ) : (
                        <span className="text-muted-foreground">{catName}</span>
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-2 py-2">
                      <Badge variant={meta.variant} className="gap-1">
                        {meta.icon}
                        {meta.label}
                      </Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer com info + botões */}
      <div className="flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {willImport === 0 ? (
            readyWithoutCategory > 0 ? (
              <span>Selecione categorias para as linhas prontas.</span>
            ) : (
              <span>Nenhuma linha pronta para importar.</span>
            )
          ) : (
            <span>
              <strong>{willImport}</strong> {willImport === 1 ? "transação será importada" : "transações serão importadas"}
            </span>
          )}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onBack} disabled={pending}>
            Voltar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={pending || willImport === 0}
          >
            {pending ? "Importando..." : `Importar ${willImport}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
