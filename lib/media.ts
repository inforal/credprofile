import type { SupabaseClient } from "@supabase/supabase-js";
import { FormError } from "@/lib/errors";
import { fileExtension, uploadPublicObject } from "@/lib/storage";
import { safeHttpUrl } from "@/lib/validation";

export type ResolvedMedia = {
  source: "upload" | "url" | null;
  url: string | null;
  path: string | null;
  remove: string[];
  justUploaded: string | null;
};

type ResolveOptions = {
  supabase: SupabaseClient;
  bucket: string;
  mode: "upload" | "url" | "none";
  file: File | null;
  url: string;
  allowed: string[];
  maxBytes: number;
  existingSource: "upload" | "url" | null;
  existingUrl: string | null;
  existingPath: string | null;
  pathForExtension: (extension: string) => string;
  required: boolean;
  missingMessage: string;
};

export async function resolveMedia(options: ResolveOptions): Promise<ResolvedMedia> {
  const { mode, existingPath } = options;

  if (mode === "none") {
    return {
      source: null,
      url: null,
      path: null,
      remove: existingPath ? [existingPath] : [],
      justUploaded: null,
    };
  }

  if (mode === "url") {
    const url = safeHttpUrl(options.url);
    if (!url) throw new FormError("Pega una dirección http(s) válida.");
    return {
      source: "url",
      url,
      path: null,
      remove: existingPath ? [existingPath] : [],
      justUploaded: null,
    };
  }

  if (options.file) {
    if (options.file.size <= 0) throw new FormError("El archivo está vacío.");
    if (options.file.size > options.maxBytes) {
      const megabytes = Math.round(options.maxBytes / (1024 * 1024));
      throw new FormError(`El archivo supera el máximo de ${megabytes} MB.`);
    }
    const extension = fileExtension(options.file, options.allowed);
    if (!extension) throw new FormError("Ese tipo de archivo no está permitido.");
    const path = options.pathForExtension(extension);
    const publicUrl = await uploadPublicObject(
      options.supabase,
      options.bucket,
      path,
      options.file,
      extension,
    );
    return {
      source: "upload",
      url: publicUrl,
      path,
      remove: existingPath && existingPath !== path ? [existingPath] : [],
      justUploaded: path,
    };
  }

  if (options.existingSource === "upload" && options.existingUrl && options.existingPath) {
    return {
      source: "upload",
      url: options.existingUrl,
      path: options.existingPath,
      remove: [],
      justUploaded: null,
    };
  }

  if (mode === "upload" || options.required) throw new FormError(options.missingMessage);
  return {
    source: null,
    url: null,
    path: null,
    remove: existingPath ? [existingPath] : [],
    justUploaded: null,
  };
}
