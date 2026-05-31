"use client";

import { useEffect, useRef } from "react";

import { runMaterialization } from "@/app/(app)/materialize-actions";
import { notify } from "@/lib/utils/notify";

const SESSION_KEY = "materialize-checked";

export function MaterializeWatcher() {
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    // Só roda 1x por sessão
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");

    runMaterialization().then((result) => {
      if (result.created > 0) {
        notify.success(
          `${result.created} transação(ões) recorrentes criadas`,
          result.recurrings.map((r) => r.description).slice(0, 3).join(", ") +
            (result.recurrings.length > 3 ? "..." : "")
        );
      }
    });
  }, []);

  return null;
}
