"use client";

import { useState, useTransition } from "react";
import {
  Calendar,
  Pause,
  Pencil,
  Play,
  Trash2,
  TrendingDown,
  TrendingUp,
  PiggyBank,
} from "lucide-react";

import {
  deleteRecurring,
  toggleRecurring,
} from "@/app/(app)/recurring/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { notify } from "@/lib/utils/notify";
import type { Category, RecurringTransaction } from "@/types/domain";

import { RecurringModal } from "./recurring-modal";

type Props = {
  recurring: RecurringTransaction;
  category?: Category;
  allCategories: Category[];
  currency: string;
  locale: string;
};

const TYPE_META = {
  income: { icon: TrendingUp, color: "text-success", label: "Receita" },
  expense: { icon: TrendingDown, color: "text-destructive", label: "Gasto" },
  investment: { icon: PiggyBank, color: "text-primary", label: "Investimento" },
};

export function RecurringCard({ recurring, category, allCategories, currency, locale }: Props) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  const meta = TYPE_META[recurring.type];
  const Icon = meta.icon;

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleRecurring(recurring.id, !recurring.active);
      if ("error" in result) notify.error("Erro", result.error);
      else
        notify.success(
          !recurring.active ? "Recorrência ativada" : "Recorrência pausada"
        );
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteRecurring(recurring.id);
      if ("error" in result) notify.error("Erro", result.error);
      else {
        notify.success("Recorrência removida");
        setConfirmDelete(false);
      }
    });
  }

  return (
    <>
      <div
        className={cn(
          "rounded-lg border bg-card p-4 transition-opacity",
          !recurring.active && "opacity-60"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted",
                meta.color
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">{recurring.description}</p>
              <p className={cn("text-lg font-bold tabular-nums", meta.color)}>
                {formatCurrency(recurring.amount, currency, locale)}
              </p>
            </div>
          </div>
          <Badge variant={recurring.active ? "success" : "outline"}>
            {recurring.active ? "Ativa" : "Pausada"}
          </Badge>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3 text-xs">
          <div>
            <p className="text-muted-foreground">Dia</p>
            <p className="mt-0.5 flex items-center gap-1 font-medium">
              <Calendar className="h-3 w-3" />
              Todo dia {recurring.day_of_month}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Próxima</p>
            <p className="mt-0.5 font-medium">
              {formatDate(recurring.next_due_date, locale)}
            </p>
          </div>
          {category && (
            <div>
              <p className="text-muted-foreground">Categoria</p>
              <p className="mt-0.5 flex items-center gap-1 font-medium">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground">Histórico</p>
            <p className="mt-0.5 font-medium">
              {recurring.total_runs} execuções
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleToggle}
            disabled={pending}
          >
            {recurring.active ? (
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

      <RecurringModal
        open={editing}
        onClose={() => setEditing(false)}
        recurring={recurring}
        categories={allCategories}
      />

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Excluir recorrência"
        description={`A recorrência "${recurring.description}" será removida. Transações já criadas no histórico não serão afetadas.`}
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
