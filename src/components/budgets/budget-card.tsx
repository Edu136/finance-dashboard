"use client";

import { useState, useTransition } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Pause,
  Pencil,
  Play,
  Target,
  Trash2,
  TrendingUp,
} from "lucide-react";

import { deleteBudget, toggleBudget } from "@/app/(app)/budgets/actions";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { notify } from "@/lib/utils/notify";
import type { Budget, BudgetProgress, Category } from "@/types/domain";

import { BudgetModal } from "./budget-modal";

type Props = {
  budget: Budget;
  progress: BudgetProgress | null;
  categories: Category[];
  currency: string;
  locale: string;
};

const STATUS_STYLES = {
  safe: {
    bar: "bg-success",
    text: "text-success",
    bg: "bg-success/10",
    label: "Tranquilo",
    icon: CheckCircle2,
  },
  warning: {
    bar: "bg-warning",
    text: "text-warning",
    bg: "bg-warning/10",
    label: "Atenção",
    icon: AlertCircle,
  },
  exceeded: {
    bar: "bg-destructive",
    text: "text-destructive",
    bg: "bg-destructive/10",
    label: "Excedido",
    icon: AlertCircle,
  },
};

export function BudgetCard({
  budget,
  progress,
  categories,
  currency,
  locale,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  const status = progress?.status ?? "safe";
  const styles = STATUS_STYLES[status];
  const StatusIcon = styles.icon;
  const pct = progress?.pct ?? 0;
  const spent = progress?.spent ?? 0;
  const remaining = progress?.remaining ?? budget.amount;

  // Pra meta de income/investment, "exceeded" é bom (atingiu/passou)
  const isPositiveGoal = budget.type !== "expense";
  const displayStatus = isPositiveGoal && status === "exceeded" ? "safe" : status;
  const displayStyles = STATUS_STYLES[displayStatus];

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleBudget(budget.id, !budget.active);
      if ("error" in result) notify.error("Erro", result.error);
      else
        notify.success(!budget.active ? "Meta ativada" : "Meta pausada");
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteBudget(budget.id);
      if ("error" in result) notify.error("Erro", result.error);
      else {
        notify.success("Meta removida");
        setConfirmDelete(false);
      }
    });
  }

  const TypeIcon = budget.type === "expense" ? Target : TrendingUp;

  return (
    <>
      <div
        className={cn(
          "rounded-lg border bg-card p-4 transition-opacity",
          !budget.active && "opacity-60"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: progress
                  ? `${progress.category_color}20`
                  : "hsl(var(--muted))",
              }}
            >
              <TypeIcon
                className="h-5 w-5"
                style={{ color: progress?.category_color }}
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {progress?.category_name ?? "Geral"}
              </p>
              <p className="text-xs text-muted-foreground">
                {budget.type === "expense" && "Limite de gasto"}
                {budget.type === "income" && "Meta de receita"}
                {budget.type === "investment" && "Meta de investimento"}
              </p>
            </div>
          </div>
          {budget.active ? (
            <div
              className={cn(
                "flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                displayStyles.bg,
                displayStyles.text
              )}
            >
              <StatusIcon className="h-3 w-3" />
              {displayStyles.label}
            </div>
          ) : (
            <span className="rounded-full border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              Pausada
            </span>
          )}
        </div>

        {/* Progresso */}
        {budget.active && progress && (
          <div className="mt-4 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className={cn("text-sm font-semibold", displayStyles.text)}>
                {formatCurrency(spent, currency, locale)}
              </span>
              <span className="text-xs text-muted-foreground">
                de {formatCurrency(budget.amount, currency, locale)}
              </span>
            </div>

            {/* Barra de progresso */}
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  displayStyles.bar
                )}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className={displayStyles.text}>{pct.toFixed(1)}%</span>
              <span className="text-muted-foreground">
                {budget.type === "expense" ? (
                  remaining >= 0 ? (
                    <>Restam {formatCurrency(remaining, currency, locale)}</>
                  ) : (
                    <>
                      Excedeu{" "}
                      {formatCurrency(Math.abs(remaining), currency, locale)}
                    </>
                  )
                ) : isPositiveGoal && pct >= 100 ? (
                  "Meta atingida! 🎉"
                ) : (
                  <>
                    Faltam{" "}
                    {formatCurrency(Math.max(0, remaining), currency, locale)}
                  </>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="mt-4 flex flex-wrap gap-1 border-t pt-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleToggle}
            disabled={pending}
          >
            {budget.active ? (
              <>
                <Pause className="h-3 w-3" />
                Pausar
              </>
            ) : (
              <>
                <Play className="h-3 w-3" />
                Ativar
              </>
            )}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            <Pencil className="h-3 w-3" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setConfirmDelete(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
            Excluir
          </Button>
        </div>
      </div>

      <BudgetModal
        open={editing}
        onClose={() => setEditing(false)}
        budget={budget}
        categories={categories}
      />

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Excluir meta"
        description={`A meta de ${
          progress?.category_name ?? "Geral"
        } será removida.`}
      >
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => setConfirmDelete(false)}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            loading={pending}
          >
            Excluir
          </Button>
        </div>
      </Modal>
    </>
  );
}
