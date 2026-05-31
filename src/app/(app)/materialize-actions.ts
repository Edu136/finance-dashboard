"use server";

import { revalidatePath } from "next/cache";

import { materializePendingRecurrings } from "@/lib/data/materialize-recurrings";

export async function runMaterialization() {
  const result = await materializePendingRecurrings();

  if (result.created > 0) {
    revalidatePath("/", "layout");
  }

  return result;
}
