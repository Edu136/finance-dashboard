"use client";

import { useRef, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";

import { notify } from "@/lib/utils/notify";

type Props = {
  onFileReady: (file: File) => void;
  pending: boolean;
};

export function UploadStep({ onFileReady, pending }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function validateAndForward(file: File) {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      notify.error("Arquivo inválido", "Envie um .csv");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      notify.error("Arquivo muito grande", "Máximo 2MB.");
      return;
    }
    onFileReady(file);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-muted/40 p-4 text-xs text-muted-foreground">
        <p className="mb-1 font-medium text-foreground">
          Bancos suportados:
        </p>
        <p>Nubank · Inter · Itaú · ou qualquer CSV com colunas Data, Valor e Descrição</p>
      </div>

      <button
        type="button"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files[0];
          if (f) validateAndForward(f);
        }}
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-10 transition-colors disabled:opacity-50 ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border bg-background hover:border-primary hover:bg-accent/50"
        }`}
      >
        {pending ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Processando...</p>
          </>
        ) : (
          <>
            <FileUp className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">Clique ou arraste o arquivo</p>
            <p className="text-xs text-muted-foreground">.csv até 2MB</p>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) validateAndForward(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
