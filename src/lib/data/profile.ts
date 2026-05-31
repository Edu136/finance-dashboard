import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/domain";

export type ProfileData = {
  profile: Profile;
  stats: {
    transactionCount: number;
    accountCreatedAt: string;
  };
};

export async function getProfileData(): Promise<ProfileData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profileRes, countRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  if (!profileRes.data) return null;

  return {
    profile: profileRes.data as Profile,
    stats: {
      transactionCount: countRes.count ?? 0,
      accountCreatedAt: profileRes.data.created_at,
    },
  };
}
