import { Suspense } from "react";

import { InvestmentsSection } from "@/components/investments/investments-section";
import { InvestmentsSkeleton } from "@/components/investments/investments-skeleton";
import { NewInvestmentButton } from "@/components/investments/new-investment-button";
import { SummaryCards } from "@/components/investments/summary-cards";
import { Card } from "@/components/ui/card";
import { getInvestmentsPageData } from "@/lib/data/investments";

export const dynamic = "force-dynamic";

export default function InvestmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Investimentos
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Acompanhe rentabilidade em tempo real
          </p>
        </div>
        <NewInvestmentButton />
      </div>

      <Suspense fallback={<InvestmentsSkeleton />}>
        <InvestmentsContent />
      </Suspense>
    </div>
  );
}

async function InvestmentsContent() {
  const data = await getInvestmentsPageData();
  if (!data) return null;

  if (data.investments.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-sm font-medium">Nenhum investimento ainda</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre suas acoes ou aplicacoes em renda fixa para comecar a
          acompanhar.
        </p>
      </Card>
    );
  }

  const stocks = data.investments.filter((i) => i.type === "stock");
  const fixed = data.investments.filter((i) => i.type === "fixed_income");

  return (
    <>
      <SummaryCards
        summary={data.summary}
        currency={data.currency}
        locale={data.locale}
      />

      <InvestmentsSection
        title="Renda Variavel"
        description="Acoes e FIIs com cotacao atualizada via Brapi"
        items={stocks}
        currency={data.currency}
        locale={data.locale}
      />

      <InvestmentsSection
        title="Renda Fixa"
        description="CDI calculado com taxas oficiais do Banco Central"
        items={fixed}
        currency={data.currency}
        locale={data.locale}
      />
    </>
  );
}
