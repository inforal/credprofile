const USERNAME = /^[a-zA-Z0-9][a-zA-Z0-9._-]{1,38}[a-zA-Z0-9]$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HTTP_URL = /^https?:\/\/\S+$/i;

export const RESERVED_USERNAMES = new Set([
  "api",
  "auth",
  "credprofile",
  "entrar",
  "favicon.ico",
  "icon",
  "panel",
  "public",
  "registro",
  "www",
]);

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export function usernameProblem(value: string): string | null {
  const username = value.trim();
  if (!USERNAME.test(username)) {
    return "El usuario debe tener de 3 a 40 caracteres, empezar y terminar con letra o número, y solo puede incluir puntos, guiones o guiones bajos.";
  }
  if (RESERVED_USERNAMES.has(username.toLowerCase())) {
    return "Ese nombre de usuario está reservado.";
  }
  return null;
}

export function slugProblem(value: string): string | null {
  const slug = value.trim();
  if (!slug) return "Escribe un enlace para la ficha.";
  if (!SLUG.test(slug)) {
    return "El enlace solo puede tener minúsculas, números y guiones.";
  }
  return null;
}

export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!HTTP_URL.test(trimmed)) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return trimmed;
  } catch {
    return null;
  }
}

export function blankToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function parseSkills(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 40);
}

export function safeNextPath(value: string | undefined): string {
  if (!value) return "/panel";
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/panel";
  if (value.startsWith("/entrar") || value.startsWith("/registro")) return "/panel";
  return value;
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
