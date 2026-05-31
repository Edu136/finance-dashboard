"use client";

import { useTransition, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  transactionSchema,
  type TransactionInput,
} from "@/lib/utils/validators";
import {
  createTransaction,
  updateTransaction,
} from "@/app/(app)/transactions/actions";
import type { Category, Transaction } from "@/types/domain";

type Props = {
  categories: Category[];
  /** Se passar `transaction`, o form entra em modo edição. */
  transaction?: Transaction;
  onSuccess: () => void;
  onCancel: () => void;
};

export function TransactionForm({
  categories,
  transaction,
  onSuccess,
  onCancel,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = Boolean(transaction);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction
      ? {
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          date: transaction.date,
          category_id: transaction.category_id ?? null,
          status: transaction.status,
          notes: transaction.notes ?? "",
        }
      : {
          type: "expense",
          amount: 0,
          description: "",
          date: new Date().toISOString().slice(0, 10),
          category_id: null,
          status: "confirmed",
          notes: "",
        },
  });

  const selectedType = watch("type");
  const filteredCategories = categories.filter((c) => c.type === selectedType);

  const onSubmit = (values: TransactionInput) => {
    setServerError(null);
    const payload = {
      ...values,
      category_id: values.category_id || null,
      notes: values.notes || null,
    };

    startTransition(async () => {
      const result = isEdit
        ? await updateTransaction({ ...payload, id: transaction!.id })
        : await createTransaction(payload);

      if ("error" in result) setServerError(result.error);
      else onSuccess();
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
          placeholder="Ex: Supermercado"
          error={errors.description?.message}
          {...register("description")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input
            id="date"
            type="date"
            error={errors.date?.message}
            {...register("date")}
          />
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
        <Label htmlFor="status">Status</Label>
        <Select id="status" {...register("status")}>
          <option value="confirmed">Confirmada</option>
          <option value="pending">Pendente</option>
          <option value="cancelled">Cancelada</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações (opcional)</Label>
        <Textarea
          id="notes"
          placeholder="Detalhes adicionais..."
          {...register("notes")}
        />
      </div>

      {serverError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

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
          {isEdit ? "Salvar" : "Criar"}
        </Button>
      </div>
    </form>
  );
}
