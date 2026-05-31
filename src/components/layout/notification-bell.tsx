"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Bell, BellOff } from "lucide-react";

import { dismissAllNotifications } from "@/app/(app)/notifications-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { AppNotification } from "@/lib/notifications/types";

import { NotificationItem } from "./notification-item";

type Props = {
  initialNotifications: AppNotification[];
};

export function NotificationBell({ initialNotifications }: Props) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<AppNotification[]>(initialNotifications);
  const [clearing, startClear] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  // Sincroniza quando server manda nova lista (após revalidatePath)
  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  // Click fora pra fechar
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleDismissed(key: string) {
    setNotifications((curr) => curr.filter((n) => n.key !== key));
  }

  function handleClearAll() {
    startClear(async () => {
      await dismissAllNotifications(notifications.map((n) => n.key));
      setNotifications([]);
    });
  }

  const count = notifications.length;
  const hasNotifications = count > 0;

  return (
    <div ref={ref} className="relative">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notificações${count > 0 ? ` (${count})` : ""}`}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </Button>

      {open && (
        <div
          className={cn(
            "absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-md border bg-card shadow-lg",
            "animate-in fade-in-0 zoom-in-95"
          )}
        >
          <div className="flex items-center justify-between border-b px-3 py-2">
            <p className="text-sm font-semibold">Notificações</p>
            {hasNotifications && (
              <button
                type="button"
                onClick={handleClearAll}
                disabled={clearing}
                className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                Limpar tudo
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {!hasNotifications ? (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Tudo certo!</p>
                <p className="text-xs text-muted-foreground">
                  Nenhuma notificação no momento.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n.key}
                  notification={n}
                  onDismissed={handleDismissed}
                  onClose={() => setOpen(false)}
                />
              ))
            )}
          </div>

          {hasNotifications && (
            <div className="border-t px-3 py-2">
              <p className="text-[10px] text-muted-foreground">
                Notificações são geradas automaticamente com base nas suas
                finanças.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
