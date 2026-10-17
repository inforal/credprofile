import Link from "next/link";
import type { ReactNode } from "react";
import {
  formatSpanishDate,
  holderName,
  issuedLabel,
  issuerShortName,
  pdfSubtitle,
  pdfViewerSrc,
  verificationLabel,
} from "@/lib/format";
import { safeHttpUrl } from "@/lib/validation";
import type { Credential, ExtraField, Profile } from "@/lib/types";

function VerifyLink({ href, label }: { href: string; label: string }) {
  return (
    <a className="verify" href={href} target="_blank" rel="noopener noreferrer">
      {label} ↗
    </a>
  );
}

function extraNodes(field: ExtraField) {
  const value = field.value?.trim() ?? "";
  const url = safeHttpUrl(field.url);
  if (!value && !url) return null;
  return (
    <>
      {value}
      {url ? (
        <>
          {value ? <br /> : null}
          <VerifyLink href={url} label="Abrir enlace" />
        </>
      ) : null}
    </>
  );
}

export function CredentialSheet({
  username,
  profile,
  credential,
}: {
  username: string;
  profile: Profile;
  credential: Credential;
}) {
  const hero = credential.hero_title?.trim() || credential.title;
  const holder = holderName(profile.full_name, credential.holder_name_override);
  const issued = issuedLabel(credential);
  const expiration = formatSpanishDate(credential.expiration_date);
  const secondaryValue = credential.secondary_code_value?.trim() ?? "";
  const secondaryLabel = credential.secondary_code_label?.trim() || "Identificador";
  const verifyUrl = safeHttpUrl(credential.verification_url);
  const verify = verifyUrl ? <VerifyLink href={verifyUrl} label={verificationLabel(credential)} /> : null;
  const code = credential.credential_code?.trim() ?? "";
  const description = credential.description?.trim() ?? "";
  const skills = credential.skills.map((skill) => skill.trim()).filter(Boolean);
  const badgeSrc = safeHttpUrl(credential.badge_image_url);
  const pdfSrc = safeHttpUrl(credential.pdf_url);
  const shortName = issuerShortName(credential);
  const issuerUrl = safeHttpUrl(credential.issuer_url);
  const logoUrl = safeHttpUrl(credential.issuer_logo_url);
  const typeLabel = credential.credential_type_label?.trim() || "Certificación profesional";

  const rows: Array<{ label: string; value: ReactNode } | null> = [
    { label: "Titular", value: holder },
    { label: "Certificación", value: credential.title },
    { label: "Entidad emisora", value: credential.issuer_name },
    issued ? { label: "Fecha de obtención", value: issued } : null,
    expiration ? { label: "Fecha de caducidad", value: expiration } : null,
    code
      ? {
          label: "Identificación de la credencial",
          value: (
            <>
              {code}
              {!secondaryValue && verify ? (
                <>
                  <br />
                  {verify}
                </>
              ) : null}
            </>
          ),
        }
      : null,
    secondaryValue
      ? {
          label: secondaryLabel,
          value: (
            <>
              {secondaryValue}
              {verify ? (
                <>
                  <br />
                  {verify}
                </>
              ) : null}
            </>
          ),
        }
      : null,
    !secondaryValue && !code && verify ? { label: "Verificación oficial", value: verify } : null,
    ...credential.extra_fields.map((field) => {
      const value = extraNodes(field);
      if (!value) return null;
      return { label: field.label?.trim() || "Dato adicional", value };
    }),
  ];

  const visibleRows = rows.filter((row): row is { label: string; value: ReactNode } => Boolean(row));
  const hasRight = Boolean(pdfSrc);

  return (
    <article className="sheet">
      <nav className="bread" aria-label="Migas de pan">
        <Link href={`/${username}`}>Credenciales profesionales</Link>
        <span aria-hidden="true"> / </span>
        <span>{credential.title}</span>
      </nav>

      <section className={badgeSrc ? "sheet-hero" : "sheet-hero plain"}>
        {badgeSrc ? (
          <div className="sheet-seal">
            <img src={badgeSrc} alt={`Insignia de ${credential.title}`} />
          </div>
        ) : null}
        <div>
          <p className="eyebrow">{typeLabel}</p>
          <h1>{hero}</h1>
          <p className="sheet-name">{holder}</p>
          <span className="sheet-pill">{credential.issuer_name}</span>
        </div>
      </section>

      <div className={hasRight ? "sheet-layout" : "sheet-layout solo"}>
        <div className="sheet-stack">
          <section className="card pad">
            <h2>Datos de la certificación</h2>
            <dl>
              {visibleRows.map((row, index) => (
                <div className="sheet-field" key={`${row.label}-${index}`}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
          {description ? (
            <section className="card pad">
              <h2>Acerca de esta certificación</h2>
              <p className="about">{description}</p>
            </section>
          ) : null}
          {skills.length > 0 ? (
            <section className="card pad">
              <h2>Skills</h2>
              <div className="skills">
                {skills.map((skill, index) => (
                  <span key={`${skill}-${index}`}>{skill}</span>
                ))}
              </div>
            </section>
          ) : null}
        </div>
        {hasRight ? (
          <div className="sheet-stack">
            {pdfSrc ? (
              <section className="card sheet-doc">
                <div className="dochead">
                  <h2>Certificado original</h2>
                  <p>{pdfSubtitle(credential)}</p>
                </div>
                <iframe className="viewer" title={`Certificado original de ${credential.title}`} src={pdfViewerSrc(pdfSrc)} />
              </section>
            ) : null}
          </div>
        ) : null}
      </div>

      <footer className="issuer-footer">
        <div className="issuer-left">
          <span>Emitido por</span>
          {issuerUrl ? (
            <a className="issuer-brand" href={issuerUrl} target="_blank" rel="noopener noreferrer">
              {logoUrl ? <img src={logoUrl} alt="" loading="lazy" /> : null}
              <span>{shortName}</span>
            </a>
          ) : (
            <strong className="issuer-brand">
              {logoUrl ? <img src={logoUrl} alt="" loading="lazy" /> : null}
              <span>{shortName}</span>
            </strong>
          )}
        </div>
        {issuerUrl ? (
          <a className="visit-link" href={issuerUrl} target="_blank" rel="noopener noreferrer">
            Visitar {shortName} ↗
          </a>
        ) : null}
      </footer>
      <p className="doc-note">Esta ficha recoge datos publicados por el titular. CredProfile no emite ni verifica la credencial.</p>
    </article>
  );
}
