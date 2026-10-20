import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import {
  formatSpanishDate,
  holderName,
  issuedLabel,
  issuerShortName,
  nameInitials,
  pdfSubtitle,
  pdfViewerSrc,
  verificationLabel,
} from "@/lib/format";
import { descriptionIsEmpty, looksLikeHtml, sanitizeDescription } from "@/lib/rich-text";
import { safeHttpUrl } from "@/lib/validation";
import type { Credential, ExtraField, Profile } from "@/lib/types";

function DescriptionBody({ value }: { value: string }) {
  if (!looksLikeHtml(value)) return <p className="about">{value}</p>;
  const safe = sanitizeDescription(value);
  if (descriptionIsEmpty(safe)) return null;
  return <div className="about rich" dangerouslySetInnerHTML={{ __html: safe }} />;
}

function VerifyLink({ href, label }: { href: string; label: string }) {
  return (
    <a className="verify" href={href} target="_blank" rel="noopener noreferrer">
      {label} ↗
    </a>
  );
}

type SheetIcon = "person" | "doc" | "building" | "calendar" | "id" | "check";

function sheetIconFor(label: string): SheetIcon {
  const key = label.toLowerCase();
  if (key === "titular") return "person";
  if (key === "certificación") return "doc";
  if (key.includes("entidad")) return "building";
  if (key.includes("fecha")) return "calendar";
  if (key.includes("identific")) return "id";
  if (key.includes("verific")) return "check";
  return "doc";
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
  const avatarSrc = safeHttpUrl(profile.avatar_url);
  const pdfSrc = safeHttpUrl(credential.pdf_url);
  const shortName = issuerShortName(credential);
  const issuerUrl = safeHttpUrl(credential.issuer_url);
  const logoUrl = safeHttpUrl(credential.issuer_logo_url);
  const typeLabel = credential.credential_type_label?.trim() || "Certificación profesional";

  const rows: Array<{ label: string; value: ReactNode; icon: SheetIcon } | null> = [
    { label: "Titular", icon: "person", value: <Link className="sheet-holder" href={`/${username}`}>{holder}</Link> },
    { label: "Certificación", icon: "doc", value: credential.title },
    { label: "Entidad emisora", icon: "building", value: credential.issuer_name },
    issued ? { label: "Fecha de obtención", icon: "calendar", value: issued } : null,
    expiration ? { label: "Fecha de caducidad", icon: "calendar", value: expiration } : null,
    code
      ? {
          label: "Identificación de la credencial",
          icon: "id",
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
          icon: sheetIconFor(secondaryLabel),
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
    !secondaryValue && !code && verify ? { label: "Verificación oficial", icon: "check", value: verify } : null,
    ...credential.extra_fields.map((field) => {
      const value = extraNodes(field);
      if (!value) return null;
      const label = field.label?.trim() || "Dato adicional";
      return { label, icon: sheetIconFor(label), value };
    }),
  ];

  const visibleRows = rows.filter((row): row is { label: string; value: ReactNode; icon: SheetIcon } => Boolean(row));
  const hasRight = Boolean(pdfSrc || skills.length > 0);

  const meta = [
    issued ? { label: "Fecha de obtención", value: issued, icon: "calendar" as const } : null,
    credential.issuer_name.trim()
      ? { label: "Entidad emisora", value: credential.issuer_name, icon: "medal" as const }
      : null,
  ].filter((item): item is { label: string; value: string; icon: "calendar" | "medal" } => Boolean(item));

  return (
    <article className="sheet">
      <section className={badgeSrc ? "sheet-hero" : "sheet-hero plain"}>
        {badgeSrc ? (
          <div className="sheet-hero-side">
            <div className="sheet-ring">
              <img src={badgeSrc} alt={`Insignia de ${credential.title}`} />
            </div>
          </div>
        ) : null}
        <div className="sheet-hero-main">
          <p className="sheet-type-pill">{typeLabel}</p>
          <h1>{hero}</h1>
          <div className="sheet-person">
            {avatarSrc ? (
              <img className="sheet-avatar" src={avatarSrc} alt="" />
            ) : (
              <span className="sheet-avatar sheet-avatar-initials" aria-hidden="true">
                {nameInitials(holder)}
              </span>
            )}
            <div className="sheet-person-text">
              <p className="sheet-kicker">Titular</p>
              <p className="sheet-name">{holder}</p>
            </div>
          </div>
          {meta.length > 0 ? (
            <div className="sheet-meta">
              {meta.map((item, index) => (
                <Fragment key={item.label}>
                  {index > 0 ? <span className="sheet-meta-rule" aria-hidden="true" /> : null}
                  <div className="sheet-meta-item">
                    <span className="sheet-meta-icon" aria-hidden="true">
                      {item.icon === "calendar" ? <CalendarIcon /> : <MedalIcon />}
                    </span>
                    <span>
                      <span className="sheet-kicker">{item.label}</span>
                      <strong>{item.value}</strong>
                    </span>
                  </div>
                </Fragment>
              ))}
            </div>
          ) : null}
          <Link className="sheet-profile-cta" href={`/${username}`}>
            Ver perfil completo <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <div className={hasRight ? "sheet-layout" : "sheet-layout solo"}>
        <div className="sheet-stack">
          <section className="card pad">
            <h2>Datos de la certificación</h2>
            <dl>
              {visibleRows.map((row, index) => (
                <div className="sheet-field" key={`${row.label}-${index}`}>
                  <span className="sheet-field-icon" aria-hidden="true">
                    <RowIcon name={row.icon} />
                  </span>
                  <div>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>
          {description ? (
            <section className="card pad">
              <h2>Acerca de esta certificación</h2>
              <DescriptionBody value={description} />
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
    </article>
  );
}

function RowIcon({ name }: { name: SheetIcon }) {
  if (name === "person") return <PersonIcon />;
  if (name === "building") return <BuildingIcon />;
  if (name === "calendar") return <CalendarIcon />;
  if (name === "id") return <IdIcon />;
  if (name === "check") return <CheckIcon />;
  return <DocIcon />;
}

function BuildingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="1.8" d="M4 20h16M6 20V6h8v14M14 10h4v10M9 9h2M9 13h2" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="1.8" d="M12 12a3.5 3.5 0 1 0-3.5-3.5A3.5 3.5 0 0 0 12 12Zm-7 8a7 7 0 0 1 14 0" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="1.8" d="M7 3h7l5 5v13H7V3Zm7 0v5h5M9 13h6M9 17h6" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="1.8" d="M5 6h14v14H5V6Zm0 4h14M8 4v4M16 4v4" />
    </svg>
  );
}

function MedalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="9" r="5.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
        d="M8.2 13.1 7 21l5-2.4L17 21l-1.2-7.9"
      />
    </svg>
  );
}

function IdIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="1.8" d="M4 7h16v10H4V7Zm3 3h4M7 13h6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="1.8" d="M5 12.5 9.5 17 19 7" />
    </svg>
  );
}
