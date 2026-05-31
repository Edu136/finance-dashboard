"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";
import type { CategoryExpense } from "@/types/domain";

type Props = {
  data: CategoryExpense[];
  currency: string;
  locale: string;
};

export function CategoryPieChart({ data, currency, locale }: Props) {
  const total = data.reduce((s, d) => s + Number(d.total), 0);
  const chartData = data.map((d) => ({
    name: d.category_name,
    value: Number(d.total),
    color: d.category_color,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por Categoria</CardTitle>
        <CardDescription>
          Distribuição percentual no período selecionado
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        {chartData.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            Sem gastos no período.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={110}
                paddingAngle={2}
                strokeWidth={2}
                stroke="hsl(var(--card))"
              >
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0];
                  const value = Number(p.value);
                  const pct = total > 0 ? (value / total) * 100 : 0;
                  return (
                    <div className="rounded-md border bg-card p-3 text-sm shadow-lg">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-muted-foreground">
                        {formatCurrency(value, currency, locale)} ·{" "}
                        <span className="font-semibold text-foreground">
                          {pct.toFixed(1)}%
                        </span>
                      </p>
                    </div>
                  );
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
