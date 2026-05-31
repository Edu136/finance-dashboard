import type { DashboardPeriod } from "@/types/domain";

export type PeriodRange = {
  startDate: string; // YYYY-MM-DD
  endDate: string;
  label: string;
  shortLabel: string;
};

const ALL_TIME_START = "1970-01-01";

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function resolvePeriod(period: DashboardPeriod): PeriodRange {
  const today = new Date();
  const endDate = toISODate(today);

  switch (period) {
    case "30d": {
      const start = new Date();
      start.setDate(start.getDate() - 29);
      return {
        startDate: toISODate(start),
        endDate,
        label: "Últimos 30 dias",
        shortLabel: "30d",
      };
    }
    case "year": {
      const start = new Date(today.getFullYear(), 0, 1);
      return {
        startDate: toISODate(start),
        endDate,
        label: "Este ano",
        shortLabel: "ano",
      };
    }
    case "all":
      return {
        startDate: ALL_TIME_START,
        endDate,
        label: "Todo o período",
        shortLabel: "tudo",
      };
    case "month":
    default: {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        startDate: toISODate(start),
        endDate,
        label: "Este mês",
        shortLabel: "mês",
      };
    }
  }
}

export const ALLOWED_PERIODS: DashboardPeriod[] = [
  "month",
  "30d",
  "year",
  "all",
];

export function isValidPeriod(value: string | undefined): value is DashboardPeriod {
  return !!value && ALLOWED_PERIODS.includes(value as DashboardPeriod);
}
