"use client";

import { useState, useTransition } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Landmark,
  Pencil,
  Trash2,
  TrendingUp,
} from "lucide-react";

import { deleteInvestment } from "@/app/(app)/investments/actions";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { notify } from "@/lib/utils/notify";
import type { InvestmentWithCurrent } from "@/types/domain";

import { InvestmentModal } from "./investment-modal";

type Props = {
  investment: InvestmentWithCurrent;
  currency: string;
  locale: string;
};

export function InvestmentCard({ investment: i, currency, locale }: Props) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  const isProfit = i.profit >= 0;
  const Icon = i.type === "stock" ? TrendingUp : Landmark;

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteInvestment(i.id);
      if ("error" in result) notify.error("Erro", result.error);
      else {
        notify.success("Investimento removido");
        setConfirmDelete(false);
      }
    });
  }

  const title =
    i.type === "stock"
      ? `${i.ticker} · ${Number(i.quantity).toString().replace(".", ",")} ${
          Number(i.quantity) === 1 ? "acao" : "acoes"
        }`
      : `${i.name} · ${Number(i.cdi_percentage)}% CDI`;

  const subtitle =
    i.type === "stock"
      ? `Medio: ${formatCurrency(Number(i.purchase_price), currency, locale)} ${
          i.current_unit_price
            ? `· Atual: ${formatCurrency(i.current_unit_price, currency, locale)}`
            : "· (sem cotacao)"
        }`
      : `Aplicado em ${formatDate(i.purchase_date, locale)}`;

  return (
    <>
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{title}</p>
              <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Valor atual
            </p>
            <p className="text-base font-bold tabular-nums">
              {formatCurrency(i.current_value, currency, locale)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Rentabilidade
            </p>
            <p
              className={cn(
                "flex items-center justify-end gap-1 text-base font-bold tabular-nums",
                isProfit ? "text-success" : "text-destructive"
              )}
            >
              {isProfit ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {isProfit ? "+" : ""}
              {formatCurrency(i.profit, currency, locale)}
            </p>
            <p
              className={cn(
                "text-[10px] tabular-nums",
                isProfit ? "text-success" : "text-destructive"
              )}
            >
              {isProfit ? "+" : ""}
              {i.profit_pct.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1 border-t pt-3">
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

      <InvestmentModal
        open={editing}
        onClose={() => setEditing(false)}
        investment={i}
      />

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Excluir investimento"
        description="A transacao associada tambem sera removida. Esta acao nao pode ser desfeita."
      >
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => setConfirmDelete(false)}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} loading={pending}>
            Excluir
          </Button>
        </div>
      </Modal>
    </>
  );
}
