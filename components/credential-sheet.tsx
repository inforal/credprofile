import Link from "next/link";
import type { ReactNode } from "react";
import {
  badgeTitle,
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
      {label}
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
  const badgeName = badgeTitle(credential);
  const badgeDescription = credential.badge_description?.trim() ?? "";
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

  return (
    <article className="doc">
      <p className="bread">
        <Link href={`/${username}`}>{profile.full_name}</Link>
        <span aria-hidden="true"> / </span>
        {credential.title}
      </p>
      <header className={credential.show_hero_seal ? "doc-mast indexed" : "doc-mast"}>
        <p className="eyebrow">{typeLabel}</p>
        <h1>{hero}</h1>
        <p className="doc-holder">{holder}</p>
        <p className="doc-issuer">{credential.issuer_name}</p>
      </header>
      <div className="doc-grid">
        <section>
          <h2>Datos</h2>
          <dl>
            {visibleRows.map((row, index) => (
              <div className="field" key={`${row.label}-${index}`}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
          {description ? (
            <div className="doc-block">
              <h2>Acerca de esta certificación</h2>
              <p className="about">{description}</p>
            </div>
          ) : null}
          {skills.length > 0 ? (
            <div className="doc-block">
              <h2>Skills</h2>
              <div className="skills">
                {skills.map((skill, index) => (
                  <span key={`${skill}-${index}`}>{skill}</span>
                ))}
              </div>
            </div>
          ) : null}
        </section>
        {badgeSrc ? (
          <aside className="doc-badge">
            <h2>Insignia</h2>
            <img src={badgeSrc} alt={`Insignia ${badgeName}`} />
            <strong>{badgeName}</strong>
            {badgeDescription ? <p className="badge-desc">{badgeDescription}</p> : null}
          </aside>
        ) : null}
      </div>
      {pdfSrc ? (
        <section className="doc-pdf">
          <div className="dochead">
            <h2>Certificado original</h2>
            <p>{pdfSubtitle(credential)}</p>
          </div>
          <iframe className="viewer" title={`Certificado original de ${credential.title}`} src={pdfViewerSrc(pdfSrc)} />
        </section>
      ) : null}
      <footer className="issuer-footer">
        <div className="issuer-left">
          <span>Declarado ante</span>
          {issuerUrl ? (
            <a className="issuer-brand" href={issuerUrl} target="_blank" rel="noopener noreferrer">
              {logoUrl ? <img src={logoUrl} alt="" /> : null}
              <span>{shortName}</span>
            </a>
          ) : (
            <strong className="issuer-brand">
              {logoUrl ? <img src={logoUrl} alt="" /> : null}
              <span>{shortName}</span>
            </strong>
          )}
        </div>
        {issuerUrl ? (
          <a className="visit-link" href={issuerUrl} target="_blank" rel="noopener noreferrer">
            Visitar {shortName}
          </a>
        ) : null}
      </footer>
      <p className="doc-note">
        Esta ficha recoge datos publicados por el titular. CredProfile no emite ni verifica la credencial.
      </p>
    </article>
  );
}
