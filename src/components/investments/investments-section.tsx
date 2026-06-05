import type { InvestmentWithCurrent } from "@/types/domain";

import { InvestmentCard } from "./investment-card";

type Props = {
  title: string;
  description: string;
  items: InvestmentWithCurrent[];
  currency: string;
  locale: string;
};

export function InvestmentsSection({
  title,
  description,
  items,
  currency,
  locale,
}: Props) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <InvestmentCard
            key={i.id}
            investment={i}
            currency={currency}
            locale={locale}
          />
        ))}
      </div>
    </section>
  );
}
