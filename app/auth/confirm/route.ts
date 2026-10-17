import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/validation";

const OTP_TYPES = new Set<EmailOtpType>(["signup", "invite", "magiclink", "recovery", "email_change", "email"]);

function isOtpType(value: string | null): value is EmailOtpType {
  return Boolean(value && OTP_TYPES.has(value as EmailOtpType));
}

function expired(request: NextRequest, message: string | null): boolean {
  const code = request.nextUrl.searchParams.get("error_code") ?? "";
  const text = `${message ?? ""} ${request.nextUrl.searchParams.get("error_description") ?? ""}`.toLowerCase();
  return code === "otp_expired" || text.includes("expired") || text.includes("caduc");
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const next = safeNextPath(params.get("next") ?? undefined);
  const authError = params.get("error");
  const tokenHash = params.get("token_hash");
  const type = params.get("type");
  const code = params.get("code");

  if (authError && !tokenHash && !code) {
    redirect(expired(request, authError) ? "/auth/error?motivo=caducado" : "/auth/error");
  }

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) redirect(next);
    redirect(expired(request, error.message) ? "/auth/error?motivo=caducado" : "/auth/error");
  }

  if (tokenHash && isOtpType(type)) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) redirect(next);
    redirect(expired(request, error.message) ? "/auth/error?motivo=caducado" : "/auth/error");
  }

  redirect("/auth/error?motivo=caducado");
}
