"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Category } from "@/types/domain";

import { SmartImportModal } from "./smart-import/smart-import-modal";

type Props = { categories: Category[] };

export function ImportButton({ categories }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Sparkles className="h-4 w-4" />
        Importar CSV
      </Button>
      <SmartImportModal
        open={open}
        onClose={() => setOpen(false)}
        categories={categories}
      />
    </>
  );
}
