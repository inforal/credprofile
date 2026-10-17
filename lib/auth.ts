import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const getAuthUserId = cache(async (): Promise<string | null> => {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims) return null;
    const subject = data.claims.sub;
    return typeof subject === "string" && subject.length > 0 ? subject : null;
  } catch {
    return null;
  }
});
