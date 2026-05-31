"use client";

import { Modal } from "@/components/ui/modal";
import type { Category, Transaction } from "@/types/domain";

import { TransactionForm } from "./transaction-form";

type Props = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  transaction?: Transaction;
};

export function TransactionModal({
  open,
  onClose,
  categories,
  transaction,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={transaction ? "Editar transação" : "Nova transação"}
      description={
        transaction
          ? "Atualize os dados abaixo."
          : "Preencha os dados para criar."
      }
      className="max-w-lg"
    >
      <TransactionForm
        categories={categories}
        transaction={transaction}
        onSuccess={onClose}
        onCancel={onClose}
      />
    </Modal>
  );
}
