"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createBudget, updateBudget } from "@/app/(app)/budgets/actions";
import { budgetSchema, type BudgetInput } from "@/lib/utils/validators";
import { notify } from "@/lib/utils/notify";
import type { Budget, Category } from "@/types/domain";

type Props = {
  categories: Category[];
  budget?: Budget;
  onSuccess: () => void;
  onCancel: () => void;
};

export function BudgetForm({ categories, budget, onSuccess, onCancel }: Props) {
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(budget);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<BudgetInput>({
    resolver: zodResolver(budgetSchema),
    defaultValues: budget
      ? {
          type: budget.type,
          amount: budget.amount,
          category_id: budget.category_id,
          active: budget.active,
        }
      : {
          type: "expense",
          amount: 0,
          category_id: null,
          active: true,
        },
  });

  const selectedType = watch("type");
  const filteredCategories = categories.filter((c) => c.type === selectedType);

  const onSubmit = (values: BudgetInput) => {
    const payload = {
      ...values,
      category_id: values.category_id || null,
    };

    startTransition(async () => {
      const result = isEdit
        ? await updateBudget({ ...payload, id: budget!.id })
        : await createBudget(payload);

      if ("error" in result) {
        notify.error("Erro", result.error);
      } else {
        notify.success(isEdit ? "Meta atualizada" : "Meta criada");
        onSuccess();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Tipo</Label>
        <Select id="type" {...register("type")} disabled={isEdit}>
          <option value="expense">Limite de Gasto</option>
          <option value="income">Meta de Receita</option>
          <option value="investment">Meta de Investimento</option>
        </Select>
        <p className="text-[11px] text-muted-foreground">
          {selectedType === "expense" && "Você quer NÃO PASSAR de um valor"}
          {selectedType === "income" && "Você quer ATINGIR um valor de receita"}
          {selectedType === "investment" &&
            "Você quer INVESTIR pelo menos um valor"}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category_id">Categoria</Label>
        <Controller
          control={control}
          name="category_id"
          render={({ field }) => (
            <Select
              id="category_id"
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value || null)}
            >
              <option value="">Geral (todas as categorias)</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          )}
        />
        <p className="text-[11px] text-muted-foreground">
          &quot;Geral&quot; considera o total do tipo no mês.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Valor mensal</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          error={errors.amount?.message}
          {...register("amount", { valueAsNumber: true })}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="active"
          type="checkbox"
          {...register("active")}
          className="h-4 w-4 cursor-pointer"
        />
        <Label htmlFor="active" className="cursor-pointer">
          Ativa
        </Label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={pending}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={pending}>
          {isEdit ? "Salvar" : "Criar meta"}
        </Button>
      </div>
    </form>
  );
}
