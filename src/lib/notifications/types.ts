export type NotificationSeverity = "info" | "success" | "warning" | "alert";

export type NotificationCategory =
  | "new-month"
  | "missing-income"
  | "high-spending"
  | "no-activity"
  | "stale-data";

export type AppNotification = {
  /** chave única que inclui contexto temporal */
  key: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  message: string;
  icon: string; // nome do ícone lucide
  href?: string; // pra onde leva ao clicar
  ctaLabel?: string; // texto do botão de ação
  createdAt: string; // ISO
};
