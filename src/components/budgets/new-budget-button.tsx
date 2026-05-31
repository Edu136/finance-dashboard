"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Category } from "@/types/domain";

import { BudgetModal } from "./budget-modal";

type Props = { categories: Category[] };

export function NewBudgetButton({ categories }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Nova meta
      </Button>
      <BudgetModal
        open={open}
        onClose={() => setOpen(false)}
        categories={categories}
      />
    </>
  );
}
