"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { LogOut, User as UserIcon } from "lucide-react";

import { logoutAction } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils/cn";

type Props = {
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
};

export function UserMenu({ email, fullName, avatarUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = (fullName ?? email)
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border bg-secondary text-sm font-medium hover:ring-2 hover:ring-ring"
        aria-label="Menu do usuário"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div
          className={cn(
            "absolute right-0 mt-2 w-56 rounded-md border bg-card shadow-lg",
            "animate-in fade-in-0 zoom-in-95"
          )}
        >
          <div className="border-b px-3 py-2">
            <p className="truncate text-sm font-medium">
              {fullName ?? "Usuário"}
            </p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
          <div className="p-1">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
            >
              <UserIcon className="h-4 w-4" />
              Perfil
            </Link>
            <button
              onClick={handleLogout}
              disabled={pending}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              {pending ? "Saindo..." : "Sair"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
