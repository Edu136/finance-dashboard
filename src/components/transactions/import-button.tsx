"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Category } from "@/types/domain";

import { ImportModal } from "./import-modal";

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
        <Upload className="h-4 w-4" />
        Importar CSV
      </Button>
      <ImportModal
        open={open}
        onClose={() => setOpen(false)}
        categories={categories}
      />
    </>
  );
}
