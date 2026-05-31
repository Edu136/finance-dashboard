"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { deleteTransaction } from "@/app/(app)/transactions/actions";
import { notify } from "@/lib/utils/notify";

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

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteTransaction(transactionId);
      if ("error" in result) {
        notify.error(result.error);
      } else {
        notify.success("Transação excluída!");
        onClose();
      }
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Excluir transação"
      description={`Esta ação não pode ser desfeita. "${description}" será removida permanentemente.`}
    >
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
