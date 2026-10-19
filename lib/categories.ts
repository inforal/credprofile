import type { SupabaseClient } from "@supabase/supabase-js";
import type { CredentialCategory } from "@/lib/types";

export type CategoryGroup<T extends { category_id: string | null; sort_order: number }> = {
  category: CredentialCategory | null;
  items: T[];
};

export function groupByCategory<T extends { category_id: string | null; sort_order: number }>(
  categories: CredentialCategory[],
  items: T[],
): CategoryGroup<T>[] {
  const known = new Map(categories.map((category) => [category.id, category]));
  const buckets = new Map<string, T[]>();
  const loose: T[] = [];
  for (const item of items) {
    if (item.category_id && known.has(item.category_id)) {
      const list = buckets.get(item.category_id) ?? [];
      list.push(item);
      buckets.set(item.category_id, list);
    } else {
      loose.push(item);
    }
  }
  const byOrder = (left: T, right: T) => left.sort_order - right.sort_order;
  const groups: CategoryGroup<T>[] = [...categories]
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((category) => ({
      category,
      items: (buckets.get(category.id) ?? []).sort(byOrder),
    }))
    .filter((group) => group.items.length > 0);
  if (loose.length > 0) groups.push({ category: null, items: loose.sort(byOrder) });
  return groups;
}

export async function resolveCategoryId(
  supabase: SupabaseClient,
  userId: string,
  rawName: string,
): Promise<string | null> {
  const name = rawName.trim();
  if (!name) return null;
  if (name.length > 80) throw new Error("La categoría puede tener como máximo 80 caracteres.");

  const { data: existing, error: readError } = await supabase
    .from("credential_categories")
    .select("id, name, sort_order")
    .eq("user_id", userId);
  if (readError) throw readError;
  const found = (existing ?? []).find((category) => category.name.toLowerCase() === name.toLowerCase());
  if (found) return found.id as string;

  const nextOrder = (existing ?? []).reduce((max, category) => Math.max(max, category.sort_order as number), -1) + 1;
  const { data, error } = await supabase
    .from("credential_categories")
    .insert({ user_id: userId, name, sort_order: nextOrder })
    .select("id")
    .single();
  if (!error && data) return data.id as string;

  const { data: again } = await supabase
    .from("credential_categories")
    .select("id, name")
    .eq("user_id", userId);
  const raced = (again ?? []).find((category) => category.name.toLowerCase() === name.toLowerCase());
  if (raced) return raced.id as string;
  throw error ?? new Error("No se pudo guardar la categoría.");
}

export async function deleteEmptyCategories(supabase: SupabaseClient, userId: string): Promise<void> {
  const [{ data: categories, error: categoryError }, { data: credentials, error: credentialError }] = await Promise.all([
    supabase.from("credential_categories").select("id").eq("user_id", userId),
    supabase.from("credentials").select("category_id").eq("user_id", userId),
  ]);
  if (categoryError) throw categoryError;
  if (credentialError) throw credentialError;
  const used = new Set((credentials ?? []).map((row) => row.category_id).filter((id): id is string => Boolean(id)));
  const empty = (categories ?? []).map((row) => row.id as string).filter((id) => !used.has(id));
  if (empty.length === 0) return;
  const { error } = await supabase.from("credential_categories").delete().in("id", empty);
  if (error) throw error;
}
