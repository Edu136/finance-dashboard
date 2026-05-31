"use client";

import { useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAllTransactionsForExport } from "@/app/(app)/transactions/export-actions";
import { downloadCSV, transactionsToCSV } from "@/lib/utils/csv";
import { notify } from "@/lib/utils/notify";
import type { Category, TransactionType } from "@/types/domain";

const VALID_TYPES: TransactionType[] = ["income", "expense", "investment"];

type Props = {
  categories: Category[];
};

export function ExportButton({ categories }: Props) {
  const [pending, startTransition] = useTransition();
  const params = useSearchParams();

  function handleExport() {
    startTransition(async () => {
      try {
        const typeParam = params.get("type");
        const type = VALID_TYPES.includes(typeParam as TransactionType)
          ? (typeParam as TransactionType)
          : undefined;

        const data = await getAllTransactionsForExport({
          type,
          categoryId: params.get("category") ?? undefined,
          startDate: params.get("start") ?? undefined,
          endDate: params.get("end") ?? undefined,
        });

        if (data.length === 0) {
          notify.info("Nada para exportar", "Nenhuma transação no filtro atual.");
          return;
        }

        const csv = transactionsToCSV(data, categories);
        const date = new Date().toISOString().slice(0, 10);
        downloadCSV(`transacoes-${date}.csv`, csv);
        notify.success(`Exportadas ${data.length} transações`);
      } catch {
        notify.error("Erro ao gerar CSV");
      }
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} loading={pending}>
      <Download className="h-4 w-4" />
      Exportar CSV
    </Button>
  );
}
