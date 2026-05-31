import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MaterializeWatcher } from "@/components/layout/materialize-watcher";
import { materializePendingRecurrings } from "@/lib/data/materialize-recurrings";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Materializa silenciosamente (não trava render)
  await materializePendingRecurrings();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
      <MaterializeWatcher />
    </div>
  );
}
