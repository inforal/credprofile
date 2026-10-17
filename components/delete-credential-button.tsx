"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { dbErrorMessage, FormError } from "@/lib/errors";
import { CREDENTIAL_BUCKET, removeStoragePaths } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";

export function DeleteCredentialButton({
  id,
  paths,
  redirectTo,
  label = "Eliminar",
}: {
  id: string;
  paths: string[];
  redirectTo?: string;
  label?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    if (!window.confirm("¿Eliminar esta credencial? Esta acción no se puede deshacer.")) return;
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.from("credentials").delete().eq("id", id);
    if (error) {
      window.alert(new FormError(dbErrorMessage(error)).message);
      setPending(false);
      return;
    }
    if (paths.length > 0) {
      try {
        await removeStoragePaths(supabase, CREDENTIAL_BUCKET, paths);
      } catch {
        // La credencial ya se eliminó.
      }
    }
    if (redirectTo) {
      router.push(redirectTo);
    }
    router.refresh();
  }

  return (
    <button type="button" className="text-button danger" onClick={onClick} disabled={pending}>
      {pending ? "Eliminando…" : label}
    </button>
  );
}
