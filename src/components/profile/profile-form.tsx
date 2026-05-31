"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileName } from "@/app/(app)/profile/actions";
import {
  profileNameSchema,
  type ProfileNameInput,
} from "@/lib/utils/validators";
import { notify } from "@/lib/utils/notify";
import type { Profile } from "@/types/domain";

type Props = { profile: Profile };

export function ProfileForm({ profile }: Props) {
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileNameInput>({
    resolver: zodResolver(profileNameSchema),
    defaultValues: {
      full_name: profile.full_name ?? "",
    },
  });

  const onSubmit = (values: ProfileNameInput) => {
    startTransition(async () => {
      const result = await updateProfileName(values);
      if ("error" in result) {
        notify.error(result.error);
      } else {
        notify.success("Perfil atualizado!");
        reset(values);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Nome completo</Label>
        <Input
          id="full_name"
          autoComplete="name"
          error={errors.full_name?.message}
          {...register("full_name")}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={pending} disabled={!isDirty}>
          Salvar alterações
        </Button>
      </div>
    </form>
  );
}
