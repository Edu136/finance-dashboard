"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
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

export function BalanceChart({ data, currency, locale }: Props) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatMonth(d.month, locale),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução do Saldo</CardTitle>
        <CardDescription>Últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 px-2 sm:px-6">
        {chartData.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            Sem dados para exibir.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
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
                tickFormatter={(v) =>
                  new Intl.NumberFormat(locale, {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(Number(v))
                }
                width={60}
              />
              <Tooltip
                cursor={{ stroke: "hsl(var(--border))" }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const point = payload[0].payload as BalanceTimelinePoint & {
                    label: string;
                  };
                  return (
                    <div className="rounded-md border bg-card p-3 text-sm shadow-lg">
                      <p className="font-medium">{label}</p>
                      <p className="mt-1 text-muted-foreground">
                        Saldo acumulado:{" "}
                        <span className="font-semibold text-foreground">
                          {formatCurrency(
                            point.cumulative_net,
                            currency,
                            locale
                          )}
                        </span>
                      </p>
                      <p className="text-muted-foreground">
                        Mês:{" "}
                        <span className="font-semibold text-foreground">
                          {formatCurrency(point.net, currency, locale)}
                        </span>
                      </p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulative_net"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#balanceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
