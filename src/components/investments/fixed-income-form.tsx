"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import {
  createInvestment,
  updateInvestment,
} from "@/app/(app)/investments/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { notify } from "@/lib/utils/notify";
import { fixedIncomeInvestmentSchema } from "@/lib/utils/validators";
import type { Investment } from "@/types/domain";

type FormData = z.infer<typeof fixedIncomeInvestmentSchema>;

type Props = {
  investment?: Investment;
  onSuccess: () => void;
  onCancel: () => void;
};

export function FixedIncomeForm({ investment, onSuccess, onCancel }: Props) {
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(investment);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(fixedIncomeInvestmentSchema),
    defaultValues: investment
      ? {
          type: "fixed_income",
          name: investment.name,
          applied_amount: Number(investment.applied_amount ?? 0),
          cdi_percentage: Number(investment.cdi_percentage ?? 100),
          purchase_date: investment.purchase_date,
          notes: investment.notes ?? "",
        }
      : {
          type: "fixed_income",
          name: "",
          applied_amount: 0,
          cdi_percentage: 100,
          purchase_date: new Date().toISOString().slice(0, 10),
          notes: "",
        },
  });

  const onSubmit = (values: FormData) => {
    startTransition(async () => {
      const result = isEdit
        ? await updateInvestment({ ...values, id: investment!.id })
        : await createInvestment(values);

      if ("error" in result) {
        notify.error("Erro", result.error);
      } else {
        notify.success(
          isEdit ? "Investimento atualizado" : "Investimento cadastrado"
        );
        onSuccess();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          placeholder="Ex: Tesouro Selic 2030, CDB Banco X"
          error={errors.name?.message}
          {...register("name")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="applied_amount">Valor aplicado (R$)</Label>
          <Input
            id="applied_amount"
            type="number"
            step="0.01"
            min="0"
            error={errors.applied_amount?.message}
            {...register("applied_amount", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cdi_percentage">Taxa (% do CDI)</Label>
          <Input
            id="cdi_percentage"
            type="number"
            step="0.01"
            min="0"
            max="500"
            error={errors.cdi_percentage?.message}
            {...register("cdi_percentage", { valueAsNumber: true })}
          />
          <p className="text-[11px] text-muted-foreground">
            Ex: 100 = 100% do CDI · 110 = 110% · 95 = 95%
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="purchase_date">Data da aplicacao</Label>
        <Input
          id="purchase_date"
          type="date"
          error={errors.purchase_date?.message}
          {...register("purchase_date")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observacoes</Label>
        <Textarea id="notes" placeholder="Vencimento, banco, etc..." {...register("notes")} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
          Cancelar
        </Button>
        <Button type="submit" loading={pending}>
          {isEdit ? "Salvar" : "Cadastrar"}
        </Button>
      </div>
    </form>
  );
}
