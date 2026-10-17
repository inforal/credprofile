import type { Metadata } from "next";
import { safeHttpUrl } from "@/lib/validation";

export function socialMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
}): Metadata {
  const imageUrl = safeHttpUrl(image);
  const branded = `${title} | CredProfile.com`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: branded,
      description,
      url: path,
      type: "website",
      locale: "es_ES",
      siteName: "CredProfile.com",
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: branded,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}
