"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatMonth } from "@/lib/utils/format";
import type { BalanceTimelinePoint } from "@/types/domain";

type Props = {
  data: BalanceTimelinePoint[];
  currency: string;
  locale: string;
};

export function CashflowBarChart({ data, currency, locale }: Props) {
  const chartData = data.map((d) => ({
    label: formatMonth(d.month, locale),
    Receitas: Number(d.income),
    Gastos: Number(d.expense),
    Investimentos: Number(d.investment),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo de Caixa</CardTitle>
        <CardDescription>Receitas, gastos e investimentos por mês</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 px-2 sm:px-6">
        {chartData.length === 0 ? (
          <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
            Sem dados no período.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 4, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="label"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={60}
                tickFormatter={(v) =>
                  new Intl.NumberFormat(locale, {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(Number(v))
                }
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-md border bg-card p-3 text-sm shadow-lg">
                      <p className="mb-2 font-medium">{label}</p>
                      {payload.map((p) => (
                        <p
                          key={String(p.dataKey)}
                          className="flex items-center gap-2 text-muted-foreground"
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: p.color }}
                          />
                          {String(p.dataKey)}:{" "}
                          <span className="font-semibold text-foreground">
                            {formatCurrency(Number(p.value), currency, locale)}
                          </span>
                        </p>
                      ))}
                    </div>
                  );
                }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
              />
              <Bar dataKey="Receitas" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Gastos" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Investimentos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
