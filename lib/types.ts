export type ExtraField = {
  label?: string;
  value?: string;
  url?: string;
};

export type Profile = {
  id: string;
  username: string;
  email: string;
  full_name: string;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  avatar_storage_path: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type Credential = {
  id: string;
  user_id: string;
  slug: string;
  credential_type_label: string;
  title: string;
  hero_title: string | null;
  holder_name_override: string | null;
  show_hero_seal: boolean;
  issuer_name: string;
  issuer_short_name: string | null;
  issuer_url: string | null;
  issuer_logo_source: "upload" | "url" | null;
  issuer_logo_url: string | null;
  issuer_logo_storage_path: string | null;
  issued_date: string | null;
  issued_date_text: string | null;
  expiration_date: string | null;
  credential_code: string | null;
  secondary_code_label: string | null;
  secondary_code_value: string | null;
  verification_url: string | null;
  verification_label: string | null;
  extra_fields: ExtraField[];
  description: string | null;
  skills: string[];
  badge_source: "upload" | "url";
  badge_image_url: string;
  badge_storage_path: string | null;
  badge_title: string | null;
  badge_description: string | null;
  pdf_source: "upload" | "url";
  pdf_url: string;
  pdf_storage_path: string | null;
  pdf_subtitle: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export function normalizeCredential(row: Credential): Credential {
  const extra = Array.isArray(row.extra_fields) ? row.extra_fields : [];
  return {
    ...row,
    skills: Array.isArray(row.skills) ? row.skills.filter((skill) => skill.trim()) : [],
    extra_fields: extra.filter((field) => field && typeof field === "object"),
  };
}
