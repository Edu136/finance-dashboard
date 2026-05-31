"use client";

import { useTransition } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  PartyPopper,
  TrendingDown,
  TrendingUp,
  X,
  type LucideIcon,
} from "lucide-react";

import { dismissNotification } from "@/app/(app)/notifications-actions";
import { cn } from "@/lib/utils/cn";
import type { AppNotification } from "@/lib/notifications/types";

const ICONS: Record<string, LucideIcon> = {
  Calendar,
  Clock,
  PartyPopper,
  TrendingDown,
  TrendingUp,
};

const SEVERITY_STYLES = {
  info: {
    iconWrap: "bg-primary/10 text-primary",
  },
  success: {
    iconWrap: "bg-success/10 text-success",
  },
  warning: {
    iconWrap: "bg-warning/10 text-warning",
  },
  alert: {
    iconWrap: "bg-destructive/10 text-destructive",
  },
};

type Props = {
  notification: AppNotification;
  onDismissed: (key: string) => void;
  onClose: () => void;
};

export function NotificationItem({
  notification: n,
  onDismissed,
  onClose,
}: Props) {
  const [pending, startTransition] = useTransition();
  const Icon = ICONS[n.icon] ?? Calendar;
  const styles = SEVERITY_STYLES[n.severity];

  function handleDismiss(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      await dismissNotification(n.key);
      onDismissed(n.key);
    });
  }

  const content = (
    <div
      className={cn(
        "group relative flex gap-3 border-b p-3 transition-colors last:border-0 hover:bg-accent/50",
        n.href && "cursor-pointer"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          styles.iconWrap
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 pr-6">
        <p className="text-sm font-medium leading-tight">{n.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{n.message}</p>
        {n.ctaLabel && (
          <p className="mt-1.5 text-xs font-medium text-primary">
            {n.ctaLabel} →
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        disabled={pending}
        className="absolute right-2 top-2 rounded-sm p-1 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
        aria-label="Dispensar"
      >
        <X className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
    </div>
  );

  if (n.href) {
    return (
      <Link href={n.href} onClick={onClose} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
