import type { ReactNode } from "react";
import { PageFooter } from "@/components/page-footer";
import { SiteHeader } from "@/components/site-header";

export function AuthShell({
  title,
  lede,
  actions,
  children,
}: {
  title: string;
  lede: string;
  actions: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader actions={actions} />
      <main className="container" id="contenido">
        <div className="auth-layout">
          <section className="auth-aside">
            <p className="eyebrow">CredProfile</p>
            <h1 className="product-title">{title}</h1>
            <p className="lede">{lede}</p>
          </section>
          <div className="auth-panel">{children}</div>
        </div>
        <PageFooter />
      </main>
    </>
  );
}
