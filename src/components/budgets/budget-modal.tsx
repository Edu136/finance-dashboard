"use client";

import { Modal } from "@/components/ui/modal";
import type { Budget, Category } from "@/types/domain";

import { BudgetForm } from "./budget-form";

type Props = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  budget?: Budget;
};

export function BudgetModal({ open, onClose, categories, budget }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={budget ? "Editar meta" : "Nova meta"}
      description={
        budget
          ? "Atualize os parâmetros da meta."
          : "Defina uma meta mensal por categoria."
      }
      className="max-w-lg"
    >
      <BudgetForm
        categories={categories}
        budget={budget}
        onSuccess={onClose}
        onCancel={onClose}
      />
    </Modal>
  );
}
