"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Category } from "@/types/domain";

type Props = {
  categories: Category[];
};

export function TransactionsFilters({ categories }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const currentType = params.get("type") ?? "";
  const currentCategory = params.get("category") ?? "";
  const currentStart = params.get("start") ?? "";
  const currentEnd = params.get("end") ?? "";

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page"); // reset paginação ao filtrar
    router.push(`/transactions?${next.toString()}`);
  }

  function clearAll() {
    router.push("/transactions");
  }

  const hasFilters =
    Boolean(currentType) ||
    Boolean(currentCategory) ||
    Boolean(currentStart) ||
    Boolean(currentEnd);

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="filter-type">Tipo</Label>
          <Select
            id="filter-type"
            value={currentType}
            onChange={(e) => setParam("type", e.target.value)}
          >
            <option value="">Todos</option>
            <option value="income">Receita</option>
            <option value="expense">Gasto</option>
            <option value="investment">Investimento</option>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-category">Categoria</Label>
          <Select
            id="filter-category"
            value={currentCategory}
            onChange={(e) => setParam("category", e.target.value)}
          >
            <option value="">Todas</option>
            {categories
              .filter((c) => !currentType || c.type === currentType)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-start">De</Label>
          <Input
            id="filter-start"
            type="date"
            value={currentStart}
            onChange={(e) => setParam("start", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-end">Até</Label>
          <Input
            id="filter-end"
            type="date"
            value={currentEnd}
            onChange={(e) => setParam("end", e.target.value)}
          />
        </div>
      </div>

      {hasFilters && (
        <div className="mt-3">
          <Button size="sm" variant="ghost" onClick={clearAll}>
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
