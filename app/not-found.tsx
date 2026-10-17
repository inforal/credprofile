import Link from "next/link";
import { PageFooter } from "@/components/page-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Página no encontrada",
};

export default function NotFound() {
  return (
    <>
      <SiteHeader
        actions={
          <>
            <Link href="/entrar">Entrar</Link>
            <Link href="/registro">Crear cuenta</Link>
          </>
        }
      />
      <main className="container" id="contenido">
        <section className="card pad empty-state">
          <p className="eyebrow">404</p>
          <h1 className="page-title">No encontramos esa página</h1>
          <p className="about">El perfil o la credencial no existe, o no está publicado.</p>
          <div className="actions">
            <Link className="btn" href="/">
              Volver al inicio
            </Link>
            <Link className="btn secondary" href="/entrar">
              Entrar
            </Link>
          </div>
        </section>
        <PageFooter />
      </main>
    </>
  );
}
