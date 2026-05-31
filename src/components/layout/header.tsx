import { createClient } from "@/lib/supabase/server";
import { getNotifications } from "@/lib/data/notifications";
import { NotificationBell } from "./notification-bell";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profileRes, notifications] = await Promise.all([
    user
      ? supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", user.id)
          .single()
      : Promise.resolve({ data: null }),
    user ? getNotifications() : Promise.resolve([]),
  ]);

  const profile = profileRes.data;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end gap-1 border-b bg-background/80 px-4 pl-16 backdrop-blur md:pl-6">
      {user && <NotificationBell initialNotifications={notifications} />}
      <ThemeToggle />
      {user && (
        <UserMenu
          email={user.email ?? ""}
          fullName={profile?.full_name ?? null}
          avatarUrl={profile?.avatar_url ?? null}
        />
      )}
    </header>
  );
}
