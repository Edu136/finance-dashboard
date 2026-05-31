import { AnalyticsSkeleton } from "@/components/analytics/analytics-skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Análise detalhada das suas finanças
        </p>
      </div>
      <AnalyticsSkeleton />
    </div>
  );
}
