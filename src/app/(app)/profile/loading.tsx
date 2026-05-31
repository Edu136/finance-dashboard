import { ProfileSkeleton } from "@/components/profile/profile-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Perfil</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie suas informações e preferências
        </p>
      </div>
      <ProfileSkeleton />
    </div>
  );
}
