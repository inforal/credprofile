const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function formatSpanishDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return iso;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return iso;
  return `${day} de ${MONTHS[month - 1]} de ${year}`;
}

export function issuedLabel(credential: {
  issued_date: string | null;
  issued_date_text: string | null;
}): string | null {
  const text = credential.issued_date_text?.trim();
  if (text) return text;
  return formatSpanishDate(credential.issued_date);
}

export function holderName(profileName: string, override: string | null): string {
  const custom = override?.trim();
  return custom || profileName;
}

export function nameInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function issuerShortName(credential: {
  issuer_short_name: string | null;
  issuer_name: string;
}): string {
  return credential.issuer_short_name?.trim() || credential.issuer_name;
}

export function pdfSubtitle(credential: {
  pdf_subtitle: string | null;
  title: string;
}): string {
  const custom = credential.pdf_subtitle?.trim();
  return custom || `Certificación ${credential.title} · PDF original`;
}

export function badgeTitle(credential: { badge_title: string | null; title: string }): string {
  return credential.badge_title?.trim() || credential.title;
}

export function verificationLabel(credential: {
  verification_label: string | null;
  issuer_short_name: string | null;
  issuer_name: string;
}): string {
  const custom = credential.verification_label?.trim();
  if (custom) return custom;
  return `Verificar en ${issuerShortName(credential)}`;
}

export function pdfViewerSrc(url: string): string {
  return `${url.split("#")[0]}#toolbar=0&navpanes=0&view=FitH`;
}

export function clipText(value: string, max: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}
