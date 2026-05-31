import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types/domain";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("categories")
    .select("*")
    .or(`user_id.eq.${user.id},user_id.is.null`)
    .order("type", { ascending: true })
    .order("sort_order", { ascending: true });

  return (data ?? []) as Category[];
}
