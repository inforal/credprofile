export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configured && /^https?:\/\//i.test(configured)) return configured;
  return "https://credprofile.com";
}

export function emailConfirmUrl(): string {
  return `${siteUrl()}/auth/confirm`;
}
