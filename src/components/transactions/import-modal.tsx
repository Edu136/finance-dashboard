"use client";

import { useRef, useState, useTransition } from "react";
import { AlertCircle, CheckCircle2, FileUp, Loader2 } from "lucide-react";

import { bulkImportTransactions } from "@/app/(app)/transactions/import-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { parseCSV, validateRows, type ParsedRow } from "@/lib/utils/csv";
import { notify } from "@/lib/utils/notify";
import type { Category } from "@/types/domain";

type Props = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
};

export function ImportModal({ open, onClose, categories }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, startImport] = useTransition();
  const [parsed, setParsed] = useState<ParsedRow[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const valid = parsed?.filter((r) => r.data) ?? [];
  const invalid = parsed?.filter((r) => r.error) ?? [];

  function reset() {
    setParsed(null);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleClose() {
    if (importing || parsing) return;
    reset();
    onClose();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      notify.error("Arquivo inválido", "Envie um arquivo .csv");
      return;
    }
    if (file.size > 1024 * 1024) {
      notify.error("Arquivo muito grande", "Máximo 1MB.");
      return;
    }

    setParsing(true);
    setFileName(file.name);
    try {
      const rows = await parseCSV(file);
      if (rows.length === 0) {
        notify.error("CSV vazio");
        reset();
        return;
      }
      if (rows.length > 1000) {
        notify.error("Muitas linhas", "Máximo 1000 por importação.");
        reset();
        return;
      }
      const validated = validateRows(rows, categories);
      setParsed(validated);
    } catch (err) {
      notify.error("Erro ao ler CSV", String(err));
      reset();
    } finally {
      setParsing(false);
    }
  }

  function handleImport() {
    if (valid.length === 0) {
      notify.info("Nada para importar", "Todas as linhas têm erro.");
      return;
    }

    startImport(async () => {
      const payload = valid.map((r) => r.data!);
      const result = await bulkImportTransactions(payload);

      if ("error" in result) {
        notify.error("Falha na importação", result.error);
        return;
      }

      notify.success(
        `${result.inserted} transações importadas`,
        invalid.length > 0
          ? `${invalid.length} linha(s) com erro foram ignoradas`
          : undefined
      );
      reset();
      onClose();
    });
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Importar CSV"
      description="Suba um arquivo CSV com transações para importar em lote."
      className="max-w-2xl"
    >
      {!parsed ? (
        <div className="space-y-4">
          <div className="rounded-md border bg-muted/40 p-4 text-xs">
            <p className="mb-2 font-medium">Formato esperado:</p>
            <code className="block whitespace-pre-wrap break-all text-muted-foreground">
              date,type,amount,description,category,status,notes{"\n"}
              2026-01-15,expense,89.90,Netflix,Assinaturas,confirmed,
            </code>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={parsing}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background p-8 transition-colors hover:border-primary hover:bg-accent/50 disabled:opacity-50"
          >
            {parsing ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Lendo arquivo...
                </p>
              </>
            ) : (
              <>
                <FileUp className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Clique para selecionar</p>
                <p className="text-xs text-muted-foreground">
                  Arquivo .csv até 1MB
                </p>
              </>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFile}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-md border bg-muted/40 p-3">
            <div>
              <p className="text-sm font-medium">{fileName}</p>
              <p className="text-xs text-muted-foreground">
                {parsed.length} linha(s) processada(s)
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {valid.length} válidas
              </Badge>
              {invalid.length > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {invalid.length} com erro
                </Badge>
              )}
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto rounded-md border">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                <tr>
                  <th className="px-2 py-1.5 text-left">#</th>
                  <th className="px-2 py-1.5 text-left">Data</th>
                  <th className="px-2 py-1.5 text-left">Tipo</th>
                  <th className="px-2 py-1.5 text-right">Valor</th>
                  <th className="px-2 py-1.5 text-left">Descrição</th>
                  <th className="px-2 py-1.5 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {parsed.map((r) => (
                  <tr
                    key={r.lineNumber}
                    className={
                      r.error
                        ? "border-t bg-destructive/5 text-destructive"
                        : "border-t"
                    }
                  >
                    <td className="px-2 py-1.5 text-muted-foreground">
                      {r.lineNumber}
                    </td>
                    <td className="px-2 py-1.5">{r.raw.date}</td>
                    <td className="px-2 py-1.5">{r.raw.type}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">
                      {r.raw.amount}
                    </td>
                    <td className="px-2 py-1.5 truncate max-w-[180px]">
                      {r.error ? (
                        <span title={r.error}>⚠️ {r.error}</span>
                      ) : (
                        r.raw.description
                      )}
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground">
                      {r.raw.status || "confirmed"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={reset}
              disabled={importing}
            >
              Trocar arquivo
            </Button>
            <Button
              onClick={handleImport}
              loading={importing}
              disabled={valid.length === 0}
            >
              Importar {valid.length} {valid.length === 1 ? "linha" : "linhas"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
