import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/forms/login-form";
import { GoogleButton } from "@/components/forms/google-button";
import { AuthDivider } from "@/components/forms/auth-divider";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Bem-vindo de volta</CardTitle>
        <CardDescription>Entre na sua conta para continuar</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
        <AuthDivider />
        <GoogleButton />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Criar agora
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
