"use client";

import { Modal } from "@/components/ui/modal";
import type { Category, RecurringTransaction } from "@/types/domain";

import { RecurringForm } from "./recurring-form";

type Props = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  recurring?: RecurringTransaction;
};

export function RecurringModal({ open, onClose, categories, recurring }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={recurring ? "Editar recorrência" : "Nova recorrência"}
      description={
        recurring
          ? "Atualize os dados da recorrência."
          : "Configure uma transação que se repete todo mês."
      }
      className="max-w-lg"
    >
      <RecurringForm
        categories={categories}
        recurring={recurring}
        onSuccess={onClose}
        onCancel={onClose}
      />
    </Modal>
  );
}
