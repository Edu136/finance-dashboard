"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createRecurring,
  updateRecurring,
} from "@/app/(app)/recurring/actions";
import { recurringSchema, type RecurringInput } from "@/lib/utils/validators";
import { notify } from "@/lib/utils/notify";
import type { Category, RecurringTransaction } from "@/types/domain";

type Props = {
  categories: Category[];
  recurring?: RecurringTransaction;
  onSuccess: () => void;
  onCancel: () => void;
};

export function RecurringForm({
  categories,
  recurring,
  onSuccess,
  onCancel,
}: Props) {
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(recurring);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<RecurringInput>({
    resolver: zodResolver(recurringSchema),
    defaultValues: recurring
      ? {
          type: recurring.type,
          amount: recurring.amount,
          description: recurring.description,
          day_of_month: recurring.day_of_month,
          category_id: recurring.category_id ?? null,
          notes: recurring.notes ?? "",
          active: recurring.active,
        }
      : {
          type: "expense",
          amount: 0,
          description: "",
          day_of_month: 5,
          category_id: null,
          notes: "",
          active: true,
        },
  });

  const selectedType = watch("type");
  const filteredCategories = categories.filter((c) => c.type === selectedType);

  const onSubmit = (values: RecurringInput) => {
    const payload = {
      ...values,
      category_id: values.category_id || null,
      notes: values.notes || null,
    };

    startTransition(async () => {
      const result = isEdit
        ? await updateRecurring({ ...payload, id: recurring!.id })
        : await createRecurring(payload);

      if ("error" in result) {
        notify.error("Erro ao salvar", result.error);
      } else {
        notify.success(isEdit ? "Recorrência atualizada" : "Recorrência criada");
        onSuccess();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Select id="type" error={errors.type?.message} {...register("type")}>
            <option value="income">Receita</option>
            <option value="expense">Gasto</option>
            <option value="investment">Investimento</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Valor</Label>
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          placeholder="Ex: Aluguel"
          error={errors.description?.message}
          {...register("description")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="day_of_month">Dia do mês</Label>
          <Input
            id="day_of_month"
            type="number"
            min="1"
            max="31"
            error={errors.day_of_month?.message}
            {...register("day_of_month", { valueAsNumber: true })}
          />
          <p className="text-[11px] text-muted-foreground">
            Se o dia não existir no mês (ex: 31 em fevereiro), usa o último dia.
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
                <option value="">Sem categoria</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações (opcional)</Label>
        <Textarea
          id="notes"
          placeholder="Detalhes adicionais..."
          {...register("notes")}
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
        <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
          Cancelar
        </Button>
        <Button type="submit" loading={pending}>
          {isEdit ? "Salvar" : "Criar"}
        </Button>
      </div>
    </form>
  );
}
