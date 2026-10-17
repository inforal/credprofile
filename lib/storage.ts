import type { SupabaseClient } from "@supabase/supabase-js";
import { FormError, storageErrorMessage } from "@/lib/errors";

export const CREDENTIAL_BUCKET = "credential-files";
export const AVATAR_BUCKET = "avatars";

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  pdf: "application/pdf",
};

const TYPE_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/x-icon": "ico",
  "image/vnd.microsoft.icon": "ico",
  "application/pdf": "pdf",
};

export function fileExtension(file: File, allowed: string[]): string | null {
  const fromName = file.name.split(".").pop()?.toLowerCase() ?? "";
  const normalized = fromName === "jpeg" ? "jpg" : fromName;
  if (allowed.includes(normalized)) return normalized;
  const fromType = TYPE_TO_EXT[file.type];
  if (fromType && allowed.includes(fromType)) return fromType;
  return null;
}

export function badgePath(userId: string, credentialId: string, ext: string): string {
  return `${userId}/${credentialId}/badge.${ext}`;
}

export function certificatePath(userId: string, credentialId: string): string {
  return `${userId}/${credentialId}/certificate.pdf`;
}

export function issuerLogoPath(userId: string, credentialId: string, ext: string): string {
  return `${userId}/${credentialId}/issuer-logo.${ext}`;
}

export function avatarPath(userId: string, ext: string): string {
  return `${userId}/avatar.${ext}`;
}

export async function uploadPublicObject(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
  file: File,
  extension: string,
): Promise<string> {
  const contentType = CONTENT_TYPES[extension] ?? file.type;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType,
    cacheControl: "3600",
  });
  if (error) throw new FormError(storageErrorMessage(error.message));
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

export async function removeStoragePaths(
  supabase: SupabaseClient,
  bucket: string,
  paths: Array<string | null | undefined>,
): Promise<void> {
  const unique = [...new Set(paths.filter((path): path is string => Boolean(path)))];
  if (unique.length === 0) return;
  const { error } = await supabase.storage.from(bucket).remove(unique);
  if (error) throw new FormError(storageErrorMessage(error.message));
}
