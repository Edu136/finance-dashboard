"use client";

import { Landmark, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils/cn";
import type { Investment, InvestmentType } from "@/types/domain";

import { FixedIncomeForm } from "./fixed-income-form";
import { StockForm } from "./stock-form";

type Props = {
  open: boolean;
  onClose: () => void;
  investment?: Investment;
};

export function InvestmentModal({ open, onClose, investment }: Props) {
  const initialType: InvestmentType = investment?.type ?? "stock";
  const [selected, setSelected] = useState<InvestmentType>(initialType);
  const isEdit = Boolean(investment);
  const type = isEdit ? initialType : selected;

  useEffect(() => {
    if (open) {
      setSelected(initialType);
    }
  }, [open, initialType]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar investimento" : "Novo investimento"}
      description={
        isEdit
          ? "Os valores na transacao serao atualizados automaticamente."
          : "Escolha o tipo e preencha os dados."
      }
      className="max-w-lg"
    >
      {!isEdit && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          <TypeButton
            active={selected === "stock"}
            onClick={() => setSelected("stock")}
            icon={<TrendingUp className="h-4 w-4" />}
            label="Renda Variavel"
            sub="Acoes, FIIs"
          />
          <TypeButton
            active={selected === "fixed_income"}
            onClick={() => setSelected("fixed_income")}
            icon={<Landmark className="h-4 w-4" />}
            label="Renda Fixa"
            sub="CDI, CDB, Tesouro"
          />
        </div>
      )}

      {type === "stock" ? (
        <StockForm investment={investment} onSuccess={onClose} onCancel={onClose} />
      ) : (
        <FixedIncomeForm
          investment={investment}
          onSuccess={onClose}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}

function TypeButton({
  active,
  onClick,
  icon,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-1 rounded-md border p-3 text-left transition-colors",
        active ? "border-primary bg-primary/5" : "border-border hover:bg-accent"
      )}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        {icon}
        {label}
      </div>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </button>
  );
}
