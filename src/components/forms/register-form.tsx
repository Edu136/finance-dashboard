"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  registerSchema,
  type RegisterInput,
} from "@/lib/utils/validators";
import { registerAction } from "@/app/(auth)/actions";
import { notify } from "@/lib/utils/notify";

export function RegisterForm() {
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: RegisterInput) => {
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.set(k, v));

    startTransition(async () => {
      const result = await registerAction(fd);
      if (result && "error" in result) {
        const isInfo = result.error.toLowerCase().includes("verifique");
        if (isInfo) notify.info(result.error);
        else notify.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nome completo</Label>
        <Input
          id="fullName"
          autoComplete="name"
          placeholder="Maria Silva"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          error={errors.email?.message}
          {...register("email")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
      </div>

      <Button type="submit" className="w-full" loading={pending}>
        Criar conta
      </Button>
    </form>
  );
}
