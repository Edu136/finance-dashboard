"use client";

import { useRef, useTransition } from "react";
import { Camera, Trash2, User as UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { removeAvatar, updateAvatar } from "@/app/(app)/profile/actions";
import { notify } from "@/lib/utils/notify";

type Props = {
  currentUrl: string | null;
  fullName: string | null;
  email: string;
};

export function AvatarUpload({ currentUrl, fullName, email }: Props) {
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = (fullName ?? email)
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function handlePick() {
    fileInputRef.current?.click();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.set("file", file);

    startTransition(async () => {
      const result = await updateAvatar(fd);
      if ("error" in result) notify.error(result.error);
      else notify.success("Foto atualizada!");
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeAvatar();
      if ("error" in result) notify.error(result.error);
      else notify.success("Foto removida!");
    });
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="relative">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-secondary text-2xl font-medium">
          {currentUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentUrl}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : initials ? (
            initials
          ) : (
            <UserIcon className="h-10 w-10 text-muted-foreground" />
          )}
        </div>
      </div>

      <div className="flex-1 space-y-3">
        <div>
          <p className="text-sm font-medium">Foto de perfil</p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG ou WEBP. Máximo 2MB.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handlePick}
            loading={pending}
          >
            <Camera className="h-4 w-4" />
            {currentUrl ? "Trocar foto" : "Enviar foto"}
          </Button>
          {currentUrl && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleRemove}
              disabled={pending}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Remover
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </div>
  );
}
