"use client";

import { useEffect, useRef } from "react";

export function LocalPreview({
  file,
  fallback,
  alt,
}: {
  file: File | null;
  fallback?: string | null;
  alt: string;
}) {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const image = ref.current;
    if (!image) return undefined;
    if (!file) {
      image.src = fallback ?? "";
      return undefined;
    }
    const url = URL.createObjectURL(file);
    image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file, fallback]);

  if (!file && !fallback) return null;

  return <img ref={ref} className="preview" alt={alt} src={file ? undefined : (fallback ?? undefined)} />;
}
