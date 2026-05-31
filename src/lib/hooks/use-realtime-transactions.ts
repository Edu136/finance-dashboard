"use client";

import { useEffect, useState } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import type { Transaction } from "@/types/domain";

type Options = {
  userId: string;
  initialData: Transaction[];
  /** Quantas linhas manter no array (mais recentes). Default: sem limite. */
  limit?: number;
};

/**
 * Mantém uma lista de transações sincronizada em tempo real.
 * Recebe `initialData` do server (RSC) e aplica patches do Realtime.
 */
export function useRealtimeTransactions({
  userId,
  initialData,
  limit,
}: Options) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialData);

  useEffect(() => {
    setTransactions(initialData);
  }, [initialData]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`transactions:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Transaction>) => {
          setTransactions((curr) => {
            switch (payload.eventType) {
              case "INSERT": {
                const newTx = payload.new as Transaction;
                if (curr.some((t) => t.id === newTx.id)) return curr;
                const next = [newTx, ...curr];
                return limit ? next.slice(0, limit) : next;
              }
              case "UPDATE":
                return curr.map((t) =>
                  t.id === (payload.new as Transaction).id
                    ? (payload.new as Transaction)
                    : t
                );
              case "DELETE":
                return curr.filter(
                  (t) => t.id !== (payload.old as Transaction).id
                );
              default:
                return curr;
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, limit]);

  return transactions;
}
