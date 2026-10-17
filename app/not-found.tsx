import Link from "next/link";
import { PageFooter } from "@/components/page-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="container">
        <section className="card pad">
          <h1 className="page-title">No encontramos esa página</h1>
          <p className="about">El perfil o la credencial no existe, o no está publicado.</p>
          <div className="actions">
            <Link className="btn" href="/">
              Volver al inicio
            </Link>
          </div>
        </section>
        <PageFooter />
      </main>
    </>
  );
}
