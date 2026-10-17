import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const entries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/registro`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/entrar`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const supabase = await createClient();
  const { data: profiles } = await supabase.from("profiles").select("id, username, updated_at").eq("is_public", true);
  const usernames = new Map<string, string>();
  for (const profile of profiles ?? []) {
    usernames.set(profile.id as string, profile.username as string);
    entries.push({
      url: `${base}/${profile.username}`,
      lastModified: profile.updated_at as string,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  const { data: credentials } = await supabase
    .from("credentials")
    .select("user_id, slug, updated_at")
    .eq("is_published", true);
  for (const credential of credentials ?? []) {
    const username = usernames.get(credential.user_id as string);
    if (!username) continue;
    entries.push({
      url: `${base}/${username}/${credential.slug}`,
      lastModified: credential.updated_at as string,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  return entries;
}
