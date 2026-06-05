"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Search } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import {
  createInvestment,
  lookupTicker,
  updateInvestment,
} from "@/app/(app)/investments/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils/format";
import { notify } from "@/lib/utils/notify";
import { stockInvestmentSchema } from "@/lib/utils/validators";
import type { Investment } from "@/types/domain";

type FormData = z.infer<typeof stockInvestmentSchema>;

type Props = {
  investment?: Investment;
  onSuccess: () => void;
  onCancel: () => void;
};

export function StockForm({ investment, onSuccess, onCancel }: Props) {
  const [pending, startTransition] = useTransition();
  const [lookingUp, startLookup] = useTransition();
  const [marketPrice, setMarketPrice] = useState<number | null>(null);
  const [shortName, setShortName] = useState<string | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const isEdit = Boolean(investment);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(stockInvestmentSchema),
    defaultValues: investment
      ? {
          type: "stock",
          name: investment.name,
          ticker: investment.ticker ?? "",
          quantity: Number(investment.quantity ?? 0),
          purchase_price: Number(investment.purchase_price ?? 0),
          purchase_date: investment.purchase_date,
          notes: investment.notes ?? "",
        }
      : {
          type: "stock",
          name: "",
          ticker: "",
          quantity: 1,
          purchase_price: 0,
          purchase_date: new Date().toISOString().slice(0, 10),
          notes: "",
        },
  });

  const ticker = watch("ticker");
  const purchasePrice = watch("purchase_price");

  const priceDiffPct =
    marketPrice && purchasePrice
      ? ((Number(purchasePrice) - marketPrice) / marketPrice) * 100
      : 0;
  const showPriceWarning = marketPrice && Math.abs(priceDiffPct) > 30;

  async function handleLookup() {
    if (!ticker || ticker.length < 2) {
      setLookupError("Digite um ticker valido");
      return;
    }
    setLookupError(null);

    startLookup(async () => {
      const result = await lookupTicker(ticker);
      if ("error" in result) {
        setLookupError(result.error || "Erro ao buscar ticker");
        setMarketPrice(null);
        setShortName(null);
      } else if (result.success) {
        setMarketPrice(result.data.current_price);
        setShortName(result.data.short_name);

        if (!purchasePrice || purchasePrice === 0) {
          setValue("purchase_price", result.data.current_price);
        }

        if (!watch("name")) {
          setValue("name", result.data.short_name ?? ticker);
        }
      }
    });
  }

  useEffect(() => {
    setMarketPrice(null);
    setLookupError(null);
  }, [ticker]);

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
        <Label htmlFor="ticker">Ticker (B3)</Label>
        <div className="flex gap-2">
          <Input
            id="ticker"
            placeholder="Ex: PETR4"
            error={errors.ticker?.message}
            {...register("ticker", {
              setValueAs: (v) => (typeof v === "string" ? v.toUpperCase() : v),
            })}
            onBlur={handleLookup}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleLookup}
            loading={lookingUp}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        {lookupError && <p className="text-xs text-destructive">{lookupError}</p>}
        {marketPrice !== null && (
          <p className="text-xs text-success">
            {shortName ?? ticker} · Cotacao atual:{" "}
            <strong>{formatCurrency(marketPrice, "BRL", "pt-BR")}</strong>
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nome / Apelido</Label>
        <Input
          id="name"
          placeholder="Ex: Petrobras PN"
          error={errors.name?.message}
          {...register("name")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade</Label>
          <Input
            id="quantity"
            type="number"
            step="0.000001"
            min="0"
            error={errors.quantity?.message}
            {...register("quantity", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchase_price">Preco unitario (R$)</Label>
          <Input
            id="purchase_price"
            type="number"
            step="0.0001"
            min="0"
            error={errors.purchase_price?.message}
            {...register("purchase_price", { valueAsNumber: true })}
          />
        </div>
      </div>

      {showPriceWarning && (
        <div className="flex gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p>
            Preco {priceDiffPct > 0 ? "acima" : "abaixo"} do mercado em{" "}
            {Math.abs(priceDiffPct).toFixed(1)}%. Confira se o valor esta correto.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="purchase_date">Data da compra</Label>
        <Input
          id="purchase_date"
          type="date"
          error={errors.purchase_date?.message}
          {...register("purchase_date")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observacoes</Label>
        <Textarea id="notes" placeholder="Detalhes adicionais..." {...register("notes")} />
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
