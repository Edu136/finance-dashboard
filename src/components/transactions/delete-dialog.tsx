"use client";

import { useTransition, useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { deleteTransaction } from "@/app/(app)/transactions/actions";

type Props = {
  open: boolean;
  onClose: () => void;
  transactionId: string;
  description: string;
};

export function DeleteDialog({
  open,
  onClose,
  transactionId,
  description,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteTransaction(transactionId);
      if ("error" in result) setError(result.error);
      else onClose();
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Excluir transação"
      description={`Esta ação não pode ser desfeita. "${description}" será removida permanentemente.`}
    >
      {error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={pending}>
          Cancelar
        </Button>
        <Button variant="destructive" loading={pending} onClick={handleDelete}>
          Excluir
        </Button>
      </div>
    </Modal>
  );
}
