"use client";

import { useState, type FormEvent } from "react";
import { LocalPreview } from "@/components/local-preview";
import { useRouter } from "next/navigation";
import { Alert, Field } from "@/components/form-ui";
import { dbErrorMessage, FormError, formErrorMessage } from "@/lib/errors";
import { resolveMedia } from "@/lib/media";
import { AVATAR_BUCKET, avatarPath, removeStoragePaths } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { blankToNull, safeHttpUrl, usernameProblem } from "@/lib/validation";

const AVATAR_EXT = ["png", "jpg", "webp", "svg"];
const AVATAR_MAX = 5 * 1024 * 1024;

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name);
  const [username, setUsername] = useState(profile.username);
  const [headline, setHeadline] = useState(profile.headline ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [website, setWebsite] = useState(profile.website_url ?? "");
  const [linkedin, setLinkedin] = useState(profile.linkedin_url ?? "");
  const [isPublic, setIsPublic] = useState(profile.is_public);
  const [avatarMode, setAvatarMode] = useState<"none" | "upload" | "url">(
    profile.avatar_storage_path ? "upload" : profile.avatar_url ? "url" : "none",
  );
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_storage_path ? "" : (profile.avatar_url ?? ""));
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const avatarFallback =
    avatarMode === "upload"
      ? profile.avatar_storage_path
        ? profile.avatar_url
        : null
      : avatarMode === "url"
        ? safeHttpUrl(avatarUrl)
        : null;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    const name = fullName.trim();
    if (name.length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    const usernameError = usernameProblem(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }
    const websiteUrl = website.trim() ? safeHttpUrl(website) : null;
    if (website.trim() && !websiteUrl) {
      setError("La web debe empezar por http:// o https://.");
      return;
    }
    const linkedinUrl = linkedin.trim() ? safeHttpUrl(linkedin) : null;
    if (linkedin.trim() && !linkedinUrl) {
      setError("LinkedIn debe empezar por http:// o https://.");
      return;
    }

    setPending(true);
    const uploaded: string[] = [];
    const supabase = createClient();
    try {
      const avatar = await resolveMedia({
        supabase,
        bucket: AVATAR_BUCKET,
        mode: avatarMode,
        file: avatarFile,
        url: avatarUrl,
        allowed: AVATAR_EXT,
        maxBytes: AVATAR_MAX,
        existingSource: profile.avatar_storage_path ? "upload" : profile.avatar_url ? "url" : null,
        existingUrl: profile.avatar_url,
        existingPath: profile.avatar_storage_path,
        pathForExtension: (extension) => avatarPath(profile.id, extension),
        required: false,
        missingMessage: "Sube una foto o pega su URL.",
      });
      if (avatar.justUploaded) uploaded.push(avatar.justUploaded);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: name,
          username: username.trim(),
          headline: blankToNull(headline),
          bio: blankToNull(bio),
          website_url: websiteUrl,
          linkedin_url: linkedinUrl,
          is_public: isPublic,
          avatar_url: avatar.url,
          avatar_storage_path: avatar.path,
        })
        .eq("id", profile.id);
      if (updateError) throw new FormError(dbErrorMessage(updateError));

      if (avatar.remove.length > 0) {
        try {
          await removeStoragePaths(supabase, AVATAR_BUCKET, avatar.remove);
        } catch {
          // El perfil ya quedó guardado.
        }
      }
      setSaved(true);
      setAvatarFile(null);
      router.refresh();
    } catch (caught) {
      if (uploaded.length > 0) {
        try {
          await removeStoragePaths(supabase, AVATAR_BUCKET, uploaded);
        } catch {
          // El archivo nuevo queda sin uso si el guardado falló.
        }
      }
      setError(formErrorMessage(caught, "No se pudo guardar el perfil."));
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="card pad stack" onSubmit={onSubmit} noValidate>
      <div>
        <h2>Perfil</h2>
        <p className="muted">Correo de acceso: {profile.email}</p>
      </div>
      {error ? <Alert>{error}</Alert> : null}
      {saved ? <Alert kind="ok">Perfil guardado.</Alert> : null}
      <div className="form-grid two">
        <Field label="Nombre completo">
          <input value={fullName} onChange={(event) => setFullName(event.target.value)} required maxLength={160} />
        </Field>
        <Field label="Usuario" hint="Forma parte de la dirección pública del perfil.">
          <input value={username} onChange={(event) => setUsername(event.target.value)} required maxLength={40} />
        </Field>
        <Field label="Titular">
          <input value={headline} onChange={(event) => setHeadline(event.target.value)} maxLength={160} />
        </Field>
        <Field label="Web">
          <input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://" />
        </Field>
      </div>
      <Field label="LinkedIn">
        <input value={linkedin} onChange={(event) => setLinkedin(event.target.value)} placeholder="https://www.linkedin.com/in/" />
      </Field>
      <Field label="Resumen">
        <textarea value={bio} onChange={(event) => setBio(event.target.value)} maxLength={4000} />
      </Field>
      <fieldset className="control">
        <legend>Foto</legend>
        <div className="choices">
          {(
            [
              ["none", "Sin foto"],
              ["upload", "Subir archivo"],
              ["url", "Pegar URL"],
            ] as const
          ).map(([value, label]) => (
            <label key={value}>
              <input
                type="radio"
                name="avatar-mode"
                checked={avatarMode === value}
                onChange={() => setAvatarMode(value)}
              />
              {label}
            </label>
          ))}
        </div>
        {avatarMode === "upload" ? (
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)}
          />
        ) : null}
        {avatarMode === "url" ? (
          <input value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="https://" />
        ) : null}
        <div className="avatar-preview">
          <LocalPreview
            file={avatarMode === "upload" ? avatarFile : null}
            fallback={avatarFallback}
            alt="Vista previa de la foto"
          />
        </div>
      </fieldset>
      <label className="check">
        <input type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} />
        Mostrar mi perfil públicamente
      </label>
      <div className="actions">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar perfil"}
        </button>
      </div>
    </form>
  );
}
