import { cache } from "react";
import { getAuthUserId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { normalizeCredential, type Credential, type CredentialCategory, type Profile } from "@/lib/types";

export async function getOwnProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return (data as Profile | null) ?? null;
}

export async function listCategories(userId: string): Promise<CredentialCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("credential_categories")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CredentialCategory[];
}

export async function listOwnCredentials(userId: string): Promise<Credential[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("credentials")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
    .order("issued_date", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return ((data ?? []) as Credential[]).map(normalizeCredential);
}

export async function getOwnCredential(userId: string, id: string): Promise<Credential | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("credentials")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizeCredential(data as Credential) : null;
}

const getProfileByUsername = cache(async (username: string): Promise<Profile | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle();
  if (error) throw error;
  return (data as Profile | null) ?? null;
});

async function listPublishedCredentials(userId: string): Promise<Credential[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("credentials")
    .select("*")
    .eq("user_id", userId)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("issued_date", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return ((data ?? []) as Credential[]).map(normalizeCredential);
}

export const loadPublicProfile = cache(async (username: string) => {
  const profile = await getProfileByUsername(username);
  if (!profile) return null;
  const userId = await getAuthUserId();
  if (!profile.is_public && userId !== profile.id) return null;
  const [credentials, categories] = await Promise.all([
    listPublishedCredentials(profile.id),
    listCategories(profile.id),
  ]);
  return { profile, credentials, categories, isOwner: userId === profile.id };
});

export const loadPublicCredential = cache(async (username: string, slug: string) => {
  const profile = await getProfileByUsername(username);
  if (!profile) return null;
  const userId = await getAuthUserId();
  if (!profile.is_public && userId !== profile.id) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("credentials")
    .select("*")
    .eq("user_id", profile.id)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { profile, credential: normalizeCredential(data as Credential) };
});
