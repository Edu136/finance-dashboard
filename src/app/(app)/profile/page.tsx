import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AccountInfo } from "@/components/profile/account-info";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { PasswordForm } from "@/components/profile/password-form";
import { PreferencesForm } from "@/components/profile/preferences-form";
import { ProfileForm } from "@/components/profile/profile-form";
import { getProfileData } from "@/lib/data/profile";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const data = await getProfileData();
  if (!data) return null;

  const { profile, stats } = data;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Perfil</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie suas informações e preferências
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações pessoais</CardTitle>
          <CardDescription>Foto e nome de exibição</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AvatarUpload
            currentUrl={profile.avatar_url}
            fullName={profile.full_name}
            email={profile.email}
          />
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferências</CardTitle>
          <CardDescription>
            Como os valores e datas são exibidos no app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PreferencesForm profile={profile} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados da conta</CardTitle>
          <CardDescription>Informações somente leitura</CardDescription>
        </CardHeader>
        <CardContent>
          <AccountInfo
            profile={profile}
            transactionCount={stats.transactionCount}
          />
        </CardContent>
      </Card>

      {profile.provider === "email" && (
        <Card>
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
            <CardDescription>Altere sua senha</CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
