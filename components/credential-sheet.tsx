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

function Seal() {
  return (
    <div className="seal" aria-hidden="true">
      <svg width="65" height="65" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M32 4 55 14v18c0 13-9 22-23 28C18 54 9 45 9 32V14L32 4Z" />
        <path d="m22 32 7 7 15-17" strokeWidth="4" />
      </svg>
    </div>
  );
}

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

  const brand = (
    <>
      {logoUrl ? <img src={logoUrl} alt="" /> : null}
      <span>{shortName}</span>
    </>
  );

  return (
    <>
      <div className="bread">
        <Link href={`/${username}`}>Credenciales profesionales</Link>
        <span>/</span>
        {credential.title}
      </div>
      <section className={credential.show_hero_seal ? "card hero" : "card hero plain"}>
        {credential.show_hero_seal ? <Seal /> : null}
        <div>
          <div className="eyebrow">{typeLabel}</div>
          <h1>{hero}</h1>
          <p className="name">{holder}</p>
          <span className="pill-issuer">{credential.issuer_name}</span>
        </div>
      </section>
      <div className="layout">
        <div className="stack">
          <section className="card pad">
            <h2>Datos de la certificación</h2>
            <hr className="rule" />
            <dl>
              {rows.filter((row): row is { label: string; value: ReactNode } => Boolean(row)).map((row, index) => (
                <div className="field" key={`${row.label}-${index}`}>
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
        <div className="stack">
          {badgeSrc ? (
            <section className="card pad">
              <h2>Insignia</h2>
              <div className="badge-card">
                <img src={badgeSrc} alt={`Insignia ${badgeName}`} />
                <div>
                  <strong>{badgeName}</strong>
                  {badgeDescription ? <p className="badge-desc">{badgeDescription}</p> : null}
                </div>
              </div>
            </section>
          ) : null}
          {pdfSrc ? (
            <section className="card doc-card">
              <div className="dochead">
                <h2>Certificado original</h2>
                <p>{pdfSubtitle(credential)}</p>
              </div>
              <iframe className="viewer" title={`Certificado original de ${credential.title}`} src={pdfViewerSrc(pdfSrc)} />
            </section>
          ) : null}
        </div>
      </div>
      <footer>
        <div className="issuer-footer">
          <div className="issuer-left">
            Emitido por:{" "}
            {issuerUrl ? (
              <a className="issuer-brand" href={issuerUrl} target="_blank" rel="noopener noreferrer">
                {brand}
              </a>
            ) : (
              <strong className="issuer-brand">{brand}</strong>
            )}
          </div>
          {issuerUrl ? (
            <a className="visit-link" href={issuerUrl} target="_blank" rel="noopener noreferrer">
              Visitar {shortName} ↗
            </a>
          ) : null}
        </div>
        <div className="bottom">
          <span>© CredProfile.com</span>
          <span>Certificaciones y credenciales profesionales</span>
        </div>
      </footer>
    </>
  );
}
