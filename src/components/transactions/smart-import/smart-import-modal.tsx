"use client";

import { useState, useTransition } from "react";

import { Modal } from "@/components/ui/modal";
import {
  getExistingHashes,
  getUserMemory,
  smartImportTransactions,
} from "@/app/(app)/transactions/import-actions";
import { applyCategorySuggestions, extractMerchantPattern } from "@/lib/csv-import/categorize/merge";
import { flagCardPayments } from "@/lib/csv-import/detect/card-payment";
import { flagDuplicates } from "@/lib/csv-import/detect/duplicates";
import { computeHash } from "@/lib/csv-import/hash";
import { parseCSVFile } from "@/lib/csv-import/parsers";
import type {
  BankFormat,
  ImportRow,
  ImportSummary,
} from "@/lib/csv-import/types";
import { notify } from "@/lib/utils/notify";
import type { Category } from "@/types/domain";

import { ReviewStep } from "./review-step";
import { UploadStep } from "./upload-step";

type Props = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
};

type Step = "upload" | "review";

export function SmartImportModal({ open, onClose, categories }: Props) {
  const [step, setStep] = useState<Step>("upload");
  const [bankFormat, setBankFormat] = useState<BankFormat>("unknown");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [analyzing, startAnalyze] = useTransition();
  const [importing, startImport] = useTransition();

  function reset() {
    setStep("upload");
    setBankFormat("unknown");
    setRows([]);
  }

  function handleClose() {
    if (analyzing || importing) return;
    reset();
    onClose();
  }

  function handleFileReady(file: File) {
    startAnalyze(async () => {
      try {
        // 1) Parse CSV
        const result = await parseCSVFile(file);
        setBankFormat(result.format);

        // 2) Cria ImportRow[] com hash
        let importRows: ImportRow[] = result.rows.map((r, i) => {
          const hash = r.parsed
            ? computeHash(r.parsed.date, r.parsed.amount, r.parsed.description)
            : null;

          return {
            id: crypto.randomUUID(),
            lineNumber: i + 1,
            raw: r.raw,
            parsed: r.parsed,
            hash,
            suggestedCategoryId: null,
            suggestedCategoryConfidence: null,
            finalCategoryId: null,
            status: r.parsed ? "needs-review" : "invalid",
            reason: r.error,
          };
        });

        // 3) Detecta pagamentos de fatura
        importRows = flagCardPayments(importRows);

        // 4) Detecta duplicatas (busca hashes no banco)
        const allHashes = importRows
          .map((r) => r.hash)
          .filter((h): h is string => Boolean(h));

        const existingHashes = await getExistingHashes(allHashes);
        importRows = flagDuplicates(importRows, new Set(existingHashes));

        // 5) Categoriza (memória + regras)
        const memory = await getUserMemory();
        importRows = applyCategorySuggestions(importRows, categories, memory);

        setRows(importRows);
        setStep("review");
      } catch (err) {
        notify.error("Erro ao processar", "Verifique se o arquivo é um CSV válido.");
        console.error(err);
      }
    });
  }

  function handleRowChange(id: string, patch: Partial<ImportRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function handleImport() {
    const toImport = rows.filter(
      (r) => r.status === "ready" && r.parsed && r.hash
    );

    if (toImport.length === 0) {
      notify.info("Nada pra importar");
      return;
    }

    startImport(async () => {
      // Monta payload
      const payloadRows = toImport.map((r) => ({
        date: r.parsed!.date,
        type: r.parsed!.type,
        amount: r.parsed!.amount,
        description: r.parsed!.description,
        category_id: r.finalCategoryId,
        hash: r.hash!,
      }));

      // Monta memória: extrai merchant patterns de quem teve categoria confirmada
      const memoryUpserts: { merchant_pattern: string; category_id: string }[] = [];
      for (const r of toImport) {
        if (r.finalCategoryId && r.parsed) {
          const pattern = extractMerchantPattern(r.parsed.description);
          if (pattern.length >= 3) {
            memoryUpserts.push({
              merchant_pattern: pattern,
              category_id: r.finalCategoryId,
            });
          }
        }
      }

      const result = await smartImportTransactions({
        rows: payloadRows,
        memoryUpserts,
      });

      if ("error" in result) {
        notify.error("Erro na importação", result.error);
      } else {
        const msg = result.skipped > 0
          ? `${result.inserted} importadas, ${result.skipped} duplicatas ignoradas`
          : `${result.inserted} transações importadas!`;
        notify.success("Importação concluída", msg);
        reset();
        onClose();
      }
    });
  }

  // Computed: summary
  const summary: ImportSummary = {
    total: rows.length,
    ready: rows.filter((r) => r.status === "ready").length,
    needsReview: rows.filter((r) => r.status === "needs-review").length,
    duplicates: rows.filter((r) => r.status === "duplicate").length,
    cardPayments: rows.filter((r) => r.status === "card-payment").length,
    invalid: rows.filter((r) => r.status === "invalid").length,
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Importar CSV"
      description={
        step === "upload"
          ? "Envie o extrato do seu banco"
          : "Revise as transações antes de importar"
      }
      className="max-w-3xl"
    >
      {step === "upload" ? (
        <UploadStep onFileReady={handleFileReady} pending={analyzing} />
      ) : (
        <ReviewStep
          bankFormat={bankFormat}
          rows={rows}
          categories={categories}
          summary={summary}
          pending={importing}
          onChange={handleRowChange}
          onConfirm={handleImport}
          onBack={() => {
            reset();
            setStep("upload");
          }}
        />
      )}
    </Modal>
  );
}
