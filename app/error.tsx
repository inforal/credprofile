"use client";

import { PageFooter } from "@/components/page-footer";
import { SiteHeader } from "@/components/site-header";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <SiteHeader />
      <main className="container">
        <section className="card pad">
          <h1 className="page-title">No se pudo cargar la página</h1>
          <p className="about">Ha ocurrido un error al leer los datos. Puedes intentarlo de nuevo.</p>
          <div className="actions">
            <button className="btn" type="button" onClick={reset}>
              Reintentar
            </button>
          </div>
        </section>
        <PageFooter />
      </main>
    </>
  );
}
