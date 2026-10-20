import type { Credential } from "@/lib/types";

export type IssuerPreset = {
  name: string;
  shortName: string | null;
  url: string | null;
  logoSource: "upload" | "url" | null;
  logoUrl: string | null;
  logoPath: string | null;
};

export function issuerKey(name: string): string {
  return name.trim().toLocaleLowerCase("es");
}

export function distinctLabels(values: string[], alphabetical = true): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const raw of values) {
    const name = raw.trim();
    const key = issuerKey(name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }
  if (alphabetical) names.sort((left, right) => left.localeCompare(right, "es", { sensitivity: "base" }));
  return names;
}

export function distinctTypeLabels(credentials: Credential[]): string[] {
  const ranked = [...credentials].sort((left, right) => {
    const leftStamp = left.updated_at || left.created_at;
    const rightStamp = right.updated_at || right.created_at;
    return rightStamp.localeCompare(leftStamp);
  });
  return distinctLabels(ranked.map((credential) => credential.credential_type_label ?? ""));
}

export function endSortOrder(orders: number[]): number {
  return orders.reduce((max, order) => Math.max(max, order), -1) + 1;
}

export function issuerPresets(credentials: Credential[]): IssuerPreset[] {
  const ranked = [...credentials].sort((left, right) => {
    const leftStamp = left.updated_at || left.created_at;
    const rightStamp = right.updated_at || right.created_at;
    return rightStamp.localeCompare(leftStamp);
  });
  const seen = new Set<string>();
  const presets: IssuerPreset[] = [];
  for (const credential of ranked) {
    const name = credential.issuer_name.trim();
    const key = issuerKey(name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    presets.push({
      name,
      shortName: credential.issuer_short_name,
      url: credential.issuer_url,
      logoSource: credential.issuer_logo_source,
      logoUrl: credential.issuer_logo_url,
      logoPath: credential.issuer_logo_storage_path,
    });
  }
  presets.sort((left, right) => left.name.localeCompare(right.name, "es", { sensitivity: "base" }));
  return presets;
}
