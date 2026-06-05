"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { InvestmentModal } from "./investment-modal";

export function NewInvestmentButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Novo investimento
      </Button>
      <InvestmentModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
