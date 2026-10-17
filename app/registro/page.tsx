import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "@/components/register-form";

export const metadata = {
  title: "Crear cuenta",
};

export default function RegistroPage() {
  return (
    <AuthShell
      title="Crea tu ficha pública"
      lede="El nombre de usuario será la dirección de tu perfil. Después confirmas el correo y añades la primera credencial."
      actions={<Link href="/entrar">Entrar</Link>}
    >
      <RegisterForm />
    </AuthShell>
  );
}
