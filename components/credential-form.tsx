"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert, Field } from "@/components/form-ui";
import { LocalPreview } from "@/components/local-preview";
import { dbErrorMessage, FormError, formErrorMessage } from "@/lib/errors";
import { resolveMedia } from "@/lib/media";
import {
  badgePath,
  certificatePath,
  CREDENTIAL_BUCKET,
  issuerLogoPath,
  removeStoragePaths,
} from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import type { Credential, ExtraField } from "@/lib/types";
import { RichTextEditor } from "@/components/rich-text-editor";
import { normalizeStoredDescription } from "@/lib/rich-text";
import { blankToNull, parseSkills, safeHttpUrl, slugify, slugProblem } from "@/lib/validation";

const IMAGE_EXT = ["png", "jpg", "webp", "svg"];
const LOGO_EXT = ["png", "jpg", "webp", "svg", "ico"];
const FILE_MAX = 20 * 1024 * 1024;

type DraftField = { label: string; value: string; url: string };
type LogoMode = "none" | "upload" | "url";

function draftFields(fields: ExtraField[] | undefined): DraftField[] {
  if (!fields || fields.length === 0) return [];
  return fields.map((field) => ({
    label: field.label ?? "",
    value: field.value ?? "",
    url: field.url ?? "",
  }));
}

export function CredentialForm({
  credential,
  username,
  holderFallback,
}: {
  credential?: Credential;
  username: string;
  holderFallback: string;
}) {
  const router = useRouter();
  const [typeLabel, setTypeLabel] = useState(credential?.credential_type_label ?? "Certificación profesional");
  const [title, setTitle] = useState(credential?.title ?? "");
  const [heroTitle, setHeroTitle] = useState(credential?.hero_title ?? "");
  const [slug, setSlug] = useState(credential?.slug ?? "");
  const [slugDirty, setSlugDirty] = useState(Boolean(credential));
  const [holderOverride, setHolderOverride] = useState(credential?.holder_name_override ?? "");
  const [issuerName, setIssuerName] = useState(credential?.issuer_name ?? "");
  const [issuerShort, setIssuerShort] = useState(credential?.issuer_short_name ?? "");
  const [issuerUrl, setIssuerUrl] = useState(credential?.issuer_url ?? "");
  const [logoMode, setLogoMode] = useState<LogoMode>(credential?.issuer_logo_source ?? "none");
  const [logoUrl, setLogoUrl] = useState(
    credential?.issuer_logo_source === "url" ? (credential.issuer_logo_url ?? "") : "",
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [issuedDate, setIssuedDate] = useState(credential?.issued_date ?? "");
  const [issuedText, setIssuedText] = useState(credential?.issued_date_text ?? "");
  const [expiration, setExpiration] = useState(credential?.expiration_date ?? "");
  const [code, setCode] = useState(credential?.credential_code ?? "");
  const [secondaryLabel, setSecondaryLabel] = useState(credential?.secondary_code_label ?? "");
  const [secondaryValue, setSecondaryValue] = useState(credential?.secondary_code_value ?? "");
  const [verificationUrl, setVerificationUrl] = useState(credential?.verification_url ?? "");
  const [verificationText, setVerificationText] = useState(credential?.verification_label ?? "");
  const [extras, setExtras] = useState<DraftField[]>(draftFields(credential?.extra_fields));
  const [description, setDescription] = useState(credential?.description ?? "");
  const [skills, setSkills] = useState((credential?.skills ?? []).join("\n"));
  const [badgeMode, setBadgeMode] = useState<LogoMode>(credential?.badge_source ?? "none");
  const [badgeUrl, setBadgeUrl] = useState(credential?.badge_source === "url" ? (credential.badge_image_url ?? "") : "");
  const [badgeFile, setBadgeFile] = useState<File | null>(null);
  const [badgeTitleText, setBadgeTitleText] = useState(credential?.badge_title ?? "");
  const [pdfMode, setPdfMode] = useState<"upload" | "url">(credential?.pdf_source ?? "upload");
  const [pdfUrl, setPdfUrl] = useState(credential?.pdf_source === "url" ? credential.pdf_url : "");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfSubtitleText, setPdfSubtitleText] = useState(credential?.pdf_subtitle ?? "");
  const [published, setPublished] = useState(credential?.is_published ?? true);
  const [sortOrder, setSortOrder] = useState(String(credential?.sort_order ?? 0));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const badgeFallback =
    badgeMode === "upload"
      ? credential?.badge_source === "upload"
        ? credential.badge_image_url
        : null
      : badgeMode === "url"
        ? safeHttpUrl(badgeUrl)
        : null;
  const logoFallback =
    logoMode === "upload"
      ? credential?.issuer_logo_source === "upload"
        ? credential.issuer_logo_url
        : null
      : logoMode === "url"
        ? safeHttpUrl(logoUrl)
        : null;

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugDirty) setSlug(slugify(value));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const cleanTitle = title.trim();
    const cleanIssuer = issuerName.trim();
    const cleanSlug = (slugDirty ? slug : slug || slugify(title)).trim();
    if (!cleanTitle) {
      setError("Escribe el nombre de la certificación.");
      return;
    }
    if (!cleanIssuer) {
      setError("Escribe la entidad emisora.");
      return;
    }
    const slugError = slugProblem(cleanSlug);
    if (slugError) {
      setError(slugError);
      return;
    }
    const secondaryLabelClean = secondaryLabel.trim();
    const secondaryValueClean = secondaryValue.trim();
    if ((secondaryLabelClean && !secondaryValueClean) || (!secondaryLabelClean && secondaryValueClean)) {
      setError("El identificador secundario necesita etiqueta y valor.");
      return;
    }
    const issuerLink = issuerUrl.trim() ? safeHttpUrl(issuerUrl) : null;
    if (issuerUrl.trim() && !issuerLink) {
      setError("La web del emisor debe empezar por http:// o https://.");
      return;
    }
    const verifyLink = verificationUrl.trim() ? safeHttpUrl(verificationUrl) : null;
    if (verificationUrl.trim() && !verifyLink) {
      setError("El enlace de verificación debe empezar por http:// o https://.");
      return;
    }
    const storedDescription = normalizeStoredDescription(description);
    if (storedDescription && storedDescription.length > 8000) {
      setError("La descripción supera el máximo de 8000 caracteres.");
      return;
    }
    const sort = Number.parseInt(sortOrder, 10);

    setPending(true);
    const uploaded: string[] = [];
    const supabase = createClient();
    try {
      const { data: claims, error: claimsError } = await supabase.auth.getClaims();
      const userId = claims?.claims?.sub;
      if (claimsError || !userId) throw new FormError("La sesión ha caducado. Entra de nuevo.");
      const credentialId = credential?.id ?? crypto.randomUUID();

      const badge = await resolveMedia({
        supabase,
        bucket: CREDENTIAL_BUCKET,
        mode: badgeMode,
        file: badgeFile,
        url: badgeUrl,
        allowed: IMAGE_EXT,
        maxBytes: FILE_MAX,
        existingSource: credential?.badge_source ?? null,
        existingUrl: credential?.badge_image_url ?? null,
        existingPath: credential?.badge_storage_path ?? null,
        pathForExtension: (extension) => badgePath(userId, credentialId, extension),
        required: false,
        missingMessage: "Sube la insignia o pega su URL.",
      });
      if (badge.justUploaded) uploaded.push(badge.justUploaded);

      const pdf = await resolveMedia({
        supabase,
        bucket: CREDENTIAL_BUCKET,
        mode: pdfMode,
        file: pdfFile,
        url: pdfUrl,
        allowed: ["pdf"],
        maxBytes: FILE_MAX,
        existingSource: credential?.pdf_source ?? null,
        existingUrl: credential?.pdf_url ?? null,
        existingPath: credential?.pdf_storage_path ?? null,
        pathForExtension: () => certificatePath(userId, credentialId),
        required: true,
        missingMessage: "El PDF es obligatorio: sube el archivo o pega una URL.",
      });
      if (pdf.justUploaded) uploaded.push(pdf.justUploaded);

      const logo = await resolveMedia({
        supabase,
        bucket: CREDENTIAL_BUCKET,
        mode: logoMode,
        file: logoFile,
        url: logoUrl,
        allowed: LOGO_EXT,
        maxBytes: FILE_MAX,
        existingSource: credential?.issuer_logo_source ?? null,
        existingUrl: credential?.issuer_logo_url ?? null,
        existingPath: credential?.issuer_logo_storage_path ?? null,
        pathForExtension: (extension) => issuerLogoPath(userId, credentialId, extension),
        required: false,
        missingMessage: "Sube el logo o pega su URL.",
      });
      if (logo.justUploaded) uploaded.push(logo.justUploaded);

      if (!pdf.url || !pdf.source) {
        throw new FormError("Falta el PDF.");
      }

      const extraFields: ExtraField[] = [];
      for (const field of extras) {
        const label = field.label.trim();
        const value = field.value.trim();
        const rawUrl = field.url.trim();
        if (!label && !value && !rawUrl) continue;
        if (rawUrl && !safeHttpUrl(rawUrl)) {
          throw new FormError("Los enlaces de los datos extra deben empezar por http:// o https://.");
        }
        const item: ExtraField = {};
        if (label) item.label = label;
        if (value) item.value = value;
        const url = safeHttpUrl(rawUrl);
        if (url) item.url = url;
        extraFields.push(item);
      }

      const payload = {
        slug: cleanSlug,
        credential_type_label: typeLabel.trim() || "Certificación profesional",
        title: cleanTitle,
        hero_title: blankToNull(heroTitle),
        holder_name_override: blankToNull(holderOverride),
        show_hero_seal: credential?.show_hero_seal ?? true,
        issuer_name: cleanIssuer,
        issuer_short_name: blankToNull(issuerShort),
        issuer_url: issuerLink,
        issuer_logo_source: logo.source,
        issuer_logo_url: logo.url,
        issuer_logo_storage_path: logo.path,
        issued_date: issuedDate || null,
        issued_date_text: blankToNull(issuedText),
        expiration_date: expiration || null,
        credential_code: blankToNull(code),
        secondary_code_label: blankToNull(secondaryLabelClean),
        secondary_code_value: blankToNull(secondaryValueClean),
        verification_url: verifyLink,
        verification_label: blankToNull(verificationText),
        extra_fields: extraFields,
        description: storedDescription,
        skills: parseSkills(skills),
        badge_source: badge.source,
        badge_image_url: badge.url,
        badge_storage_path: badge.path,
        badge_title: blankToNull(badgeTitleText),
        badge_description: null,
        pdf_source: pdf.source,
        pdf_url: pdf.url,
        pdf_storage_path: pdf.path,
        pdf_subtitle: blankToNull(pdfSubtitleText),
        is_published: published,
        sort_order: Number.isFinite(sort) ? sort : 0,
      };

      const { error: saveError } = credential
        ? await supabase.from("credentials").update(payload).eq("id", credential.id)
        : await supabase.from("credentials").insert({ ...payload, id: credentialId, user_id: userId });
      if (saveError) throw new FormError(dbErrorMessage(saveError));

      const obsolete = [...badge.remove, ...pdf.remove, ...logo.remove];
      if (obsolete.length > 0) {
        try {
          await removeStoragePaths(supabase, CREDENTIAL_BUCKET, obsolete);
        } catch {
          // La ficha ya quedó guardada.
        }
      }
      router.push("/panel");
      router.refresh();
    } catch (caught) {
      if (uploaded.length > 0) {
        try {
          await removeStoragePaths(supabase, CREDENTIAL_BUCKET, uploaded);
        } catch {
          // El archivo nuevo queda sin uso si el guardado falló.
        }
      }
      setError(formErrorMessage(caught, "No se pudo guardar la credencial."));
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="stack" onSubmit={onSubmit} noValidate>
      {error ? <Alert>{error}</Alert> : null}
      <section className="card pad stack">
        <h2>Ficha</h2>
        <div className="form-grid two">
          <Field label="Tipo" hint="Aparece encima del título.">
            <input value={typeLabel} onChange={(event) => setTypeLabel(event.target.value)} maxLength={80} />
          </Field>
          <Field label="Enlace" hint={`La ficha se publica en /${username}/${slug || "enlace"}`}>
            <input
              value={slug}
              onChange={(event) => {
                setSlugDirty(true);
                setSlug(event.target.value);
              }}
              required
              maxLength={80}
            />
          </Field>
        </div>
        <Field label="Nombre oficial de la certificación">
          <input value={title} onChange={(event) => onTitleChange(event.target.value)} required maxLength={220} />
        </Field>
        <div className="form-grid two">
          <Field label="Título del hero" hint="Opcional. Si lo dejas vacío se usa el nombre oficial. Sirve para añadir unas siglas.">
            <input value={heroTitle} onChange={(event) => setHeroTitle(event.target.value)} maxLength={240} />
          </Field>
          <Field label="Nombre del titular en esta ficha" hint={`Si lo dejas vacío se usa ${holderFallback}.`}>
            <input value={holderOverride} onChange={(event) => setHolderOverride(event.target.value)} maxLength={160} />
          </Field>
        </div>
        <div className="form-grid two">
          <label className="check">
            <input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} />
            Publicada
          </label>
          <Field label="Orden en el perfil" hint="Los números más bajos aparecen primero.">
            <input value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} inputMode="numeric" />
          </Field>
        </div>
      </section>

      <section className="card pad stack">
        <h2>Entidad emisora</h2>
        <Field label="Nombre">
          <input value={issuerName} onChange={(event) => setIssuerName(event.target.value)} required maxLength={220} />
        </Field>
        <div className="form-grid two">
          <Field label="Nombre corto" hint="Si lo dejas vacío, el pie usa el nombre completo.">
            <input value={issuerShort} onChange={(event) => setIssuerShort(event.target.value)} maxLength={160} />
          </Field>
          <Field label="Web">
            <input value={issuerUrl} onChange={(event) => setIssuerUrl(event.target.value)} placeholder="https://" />
          </Field>
        </div>
        <fieldset className="control">
          <legend>Logo</legend>
          <div className="choices">
            {(
              [
                ["none", "Sin logo"],
                ["upload", "Subir archivo"],
                ["url", "Pegar URL"],
              ] as const
            ).map(([value, label]) => (
              <label key={value}>
                <input type="radio" name="logo-mode" checked={logoMode === value} onChange={() => setLogoMode(value)} />
                {label}
              </label>
            ))}
          </div>
          {logoMode === "upload" ? (
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,.ico"
              onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)}
            />
          ) : null}
          {logoMode === "url" ? (
            <input value={logoUrl} onChange={(event) => setLogoUrl(event.target.value)} placeholder="https://" />
          ) : null}
          <LocalPreview file={logoMode === "upload" ? logoFile : null} fallback={logoFallback} alt="Vista previa del logo" />
          <small>Si no hay logo, el pie de la ficha solo muestra el nombre.</small>
        </fieldset>
      </section>

      <section className="card pad stack">
        <h2>Datos</h2>
        <div className="form-grid two">
          <Field label="Fecha de obtención">
            <input type="date" value={issuedDate} onChange={(event) => setIssuedDate(event.target.value)} />
          </Field>
          <Field label="Fecha en texto" hint="Opcional. Si la escribes, se muestra en lugar de la fecha.">
            <input value={issuedText} onChange={(event) => setIssuedText(event.target.value)} maxLength={80} />
          </Field>
          <Field label="Fecha de caducidad">
            <input type="date" value={expiration} onChange={(event) => setExpiration(event.target.value)} />
          </Field>
          <Field label="Identificación de la credencial">
            <input value={code} onChange={(event) => setCode(event.target.value)} maxLength={160} />
          </Field>
          <Field label="Etiqueta del segundo identificador">
            <input value={secondaryLabel} onChange={(event) => setSecondaryLabel(event.target.value)} maxLength={120} />
          </Field>
          <Field label="Valor del segundo identificador">
            <input value={secondaryValue} onChange={(event) => setSecondaryValue(event.target.value)} maxLength={160} />
          </Field>
          <Field label="Enlace de verificación">
            <input value={verificationUrl} onChange={(event) => setVerificationUrl(event.target.value)} placeholder="https://" />
          </Field>
          <Field label="Texto del enlace" hint="Si lo dejas vacío: Verificar en el emisor.">
            <input value={verificationText} onChange={(event) => setVerificationText(event.target.value)} maxLength={80} />
          </Field>
        </div>
        <div className="stack">
          <div className="section-head">
            <h2>Datos extra</h2>
            <button
              className="btn secondary"
              type="button"
              onClick={() => setExtras((current) => [...current, { label: "", value: "", url: "" }])}
            >
              Añadir fila
            </button>
          </div>
          {extras.map((field, index) => (
            <div className="extra-row" key={index}>
              <input
                aria-label="Etiqueta"
                placeholder="Etiqueta"
                value={field.label}
                onChange={(event) =>
                  setExtras((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, label: event.target.value } : item,
                    ),
                  )
                }
              />
              <input
                aria-label="Valor"
                placeholder="Valor"
                value={field.value}
                onChange={(event) =>
                  setExtras((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, value: event.target.value } : item,
                    ),
                  )
                }
              />
              <input
                aria-label="Enlace"
                placeholder="https://"
                value={field.url}
                onChange={(event) =>
                  setExtras((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, url: event.target.value } : item,
                    ),
                  )
                }
              />
              <button className="text-button danger" type="button" onClick={() => setExtras((current) => current.filter((_, item) => item !== index))}>
                Quitar
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="card pad stack">
        <h2>Descripción y skills</h2>
        <div className="control">
          <span>Acerca de esta certificación</span>
          <RichTextEditor value={description} onChange={setDescription} />
          <small>Negrita, cursiva, listas y enlaces. Si lo dejas vacío, esa tarjeta no se muestra.</small>
        </div>
        <Field label="Skills" hint="Una competencia por línea. Si no hay ninguna, la sección no se muestra.">
          <textarea value={skills} onChange={(event) => setSkills(event.target.value)} />
        </Field>
      </section>

      <section className="card pad stack">
        <h2>Insignia</h2>
        <fieldset className="control">
          <legend>Imagen</legend>
          <div className="choices">
            {(
              [
                ["none", "Sin insignia"],
                ["upload", "Subir archivo"],
                ["url", "Pegar URL"],
              ] as const
            ).map(([value, label]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="badge-mode"
                  checked={badgeMode === value}
                  onChange={() => setBadgeMode(value)}
                />
                {label}
              </label>
            ))}
          </div>
          {badgeMode === "upload" ? (
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={(event) => setBadgeFile(event.target.files?.[0] ?? null)}
            />
          ) : null}
          {badgeMode === "url" ? (
            <input value={badgeUrl} onChange={(event) => setBadgeUrl(event.target.value)} placeholder="https://" />
          ) : null}
          <LocalPreview file={badgeMode === "upload" ? badgeFile : null} fallback={badgeFallback} alt="Vista previa de la insignia" />
          <small>Si no hay imagen, el hero no muestra sello. Si la hay, sustituye al escudo.</small>
        </fieldset>
        <Field label="Título de la insignia" hint="Se guarda con la ficha. En la página pública se ve la imagen, no este texto.">
          <input value={badgeTitleText} onChange={(event) => setBadgeTitleText(event.target.value)} maxLength={220} />
        </Field>
      </section>

      <section className="card pad stack">
        <h2>Certificado original</h2>
        <ModeChoice name="pdf-mode" mode={pdfMode} onChange={setPdfMode} fileLabel="Subir PDF" />
        {pdfMode === "upload" ? (
          <>
            <input type="file" accept="application/pdf,.pdf" onChange={(event) => setPdfFile(event.target.files?.[0] ?? null)} />
            {credential?.pdf_source === "upload" && credential.pdf_url ? (
              <a href={credential.pdf_url} target="_blank" rel="noopener noreferrer">
                Ver PDF actual
              </a>
            ) : null}
          </>
        ) : (
          <input value={pdfUrl} onChange={(event) => setPdfUrl(event.target.value)} placeholder="https://" required />
        )}
        <Field label="Subtítulo" hint="Si lo dejas vacío: Certificación {nombre} · PDF original.">
          <input value={pdfSubtitleText} onChange={(event) => setPdfSubtitleText(event.target.value)} maxLength={240} />
        </Field>
      </section>

      <div className="actions">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar credencial"}
        </button>
        <Link className="btn secondary" href="/panel">
          Volver
        </Link>
      </div>
    </form>
  );
}

function ModeChoice({
  name,
  mode,
  onChange,
  fileLabel = "Subir archivo",
}: {
  name: string;
  mode: "upload" | "url";
  onChange: (mode: "upload" | "url") => void;
  fileLabel?: string;
}) {
  return (
    <div className="choices">
      <label>
        <input type="radio" name={name} checked={mode === "upload"} onChange={() => onChange("upload")} />
        {fileLabel}
      </label>
      <label>
        <input type="radio" name={name} checked={mode === "url"} onChange={() => onChange("url")} />
        Pegar URL
      </label>
    </div>
  );
}
