import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegisterForm } from "@/components/forms/register-form";
import { GoogleButton } from "@/components/forms/google-button";
import { AuthDivider } from "@/components/forms/auth-divider";

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Criar conta</CardTitle>
        <CardDescription>
          Cadastre-se gratuitamente para começar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        <AuthDivider />
        <GoogleButton />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
