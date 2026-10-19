"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteEmptyCategories } from "@/lib/categories";
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
    try {
      const { data } = await supabase.auth.getClaims();
      const userId = data?.claims?.sub;
      if (userId) await deleteEmptyCategories(supabase, userId);
    } catch {
      // La credencial ya se eliminó.
    }
    if (paths.length > 0) {
      try {
        let removable = paths;
        const { data: claims } = await supabase.auth.getClaims();
        const userId = claims?.claims?.sub;
        if (userId) {
          const { data: remaining } = await supabase
            .from("credentials")
            .select("badge_storage_path, pdf_storage_path, issuer_logo_storage_path")
            .eq("user_id", userId);
          const stillUsed = new Set(
            (remaining ?? []).flatMap((row) =>
              [row.badge_storage_path, row.pdf_storage_path, row.issuer_logo_storage_path].filter(
                (path): path is string => Boolean(path),
              ),
            ),
          );
          removable = paths.filter((path) => !stillUsed.has(path));
        }
        await removeStoragePaths(supabase, CREDENTIAL_BUCKET, removable);
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
