"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { updateProfilePreferences } from "@/app/(app)/profile/actions";
import {
  profilePreferencesSchema,
  type ProfilePreferencesInput,
} from "@/lib/utils/validators";
import { notify } from "@/lib/utils/notify";
import type { Profile } from "@/types/domain";

type Props = { profile: Profile };

export function PreferencesForm({ profile }: Props) {
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = useForm<ProfilePreferencesInput>({
    resolver: zodResolver(profilePreferencesSchema),
    defaultValues: {
      currency: (profile.currency ?? "BRL") as ProfilePreferencesInput["currency"],
    },
  });

  const onSubmit = (values: ProfilePreferencesInput) => {
    startTransition(async () => {
      const result = await updateProfilePreferences(values);
      if ("error" in result) {
        notify.error(result.error);
      } else {
        notify.success("Preferências salvas!");
        reset(values);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currency">Moeda</Label>
        <Select id="currency" {...register("currency")}>
          <option value="BRL">Real (BRL)</option>
          <option value="USD">Dólar (USD)</option>
          <option value="EUR">Euro (EUR)</option>
        </Select>
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={pending} disabled={!isDirty}>
          Salvar preferências
        </Button>
      </div>
    </form>
  );
}
