import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/login-form";
import { safeNextPath } from "@/lib/validation";

export const metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthShell
      title="Entra en tu perfil"
      lede="Usa el correo o el nombre de usuario. Desde el panel publicas y actualizas cada credencial."
      actions={<Link href="/registro">Crear cuenta</Link>}
    >
      <LoginForm nextPath={safeNextPath(params.next)} />
    </AuthShell>
  );
}
