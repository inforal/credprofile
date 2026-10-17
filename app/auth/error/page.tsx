import Link from "next/link";
import { PageFooter } from "@/components/page-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Enlace no válido",
  robots: { index: false, follow: false },
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ motivo?: string }>;
}) {
  const params = await searchParams;
  const expired = params.motivo === "caducado";

  return (
    <>
      <SiteHeader actions={<Link href="/entrar">Entrar</Link>} />
      <main className="container" id="contenido">
        <section className="card pad narrow auth-card">
          <p className="eyebrow">Confirmación</p>
          <h1 className="page-title">{expired ? "El enlace ha caducado" : "No se pudo confirmar el correo"}</h1>
          <p className="about">
            {expired
              ? "El enlace de confirmación ya no es válido o se ha usado. Entra si ya activaste la cuenta, o crea una cuenta nueva."
              : "El enlace no es válido. Vuelve a entrar o regístrate de nuevo para recibir otro correo."}
          </p>
          <div className="actions">
            <Link className="btn" href="/entrar">
              Entrar
            </Link>
            <Link className="btn secondary" href="/registro">
              Crear cuenta
            </Link>
          </div>
        </section>
        <PageFooter />
      </main>
    </>
  );
}
