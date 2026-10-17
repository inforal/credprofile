import Link from "next/link";
import { CredentialPreview } from "@/components/credential-preview";
import { PageFooter } from "@/components/page-footer";
import { SignOutButton } from "@/components/sign-out-button";
import { SiteHeader } from "@/components/site-header";
import { getAuthUserId } from "@/lib/auth";
import { getOwnProfile } from "@/lib/data";
import { siteUrl } from "@/lib/site";

const description =
  "Publica cada certificación en una ficha pública: datos, insignia, competencias y el PDF original. Una dirección propia para compartir.";

export const metadata = {
  title: { absolute: "CredProfile.com" },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title: "CredProfile.com",
    description,
    url: "/",
    type: "website" as const,
    locale: "es_ES",
    siteName: "CredProfile.com",
  },
};

export default async function HomePage() {
  const userId = await getAuthUserId();
  const profile = userId ? await getOwnProfile(userId) : null;
  const host = siteUrl().replace(/^https?:\/\//, "");

  return (
    <>
      <SiteHeader
        actions={
          profile ? (
            <>
              <Link href="/panel">Panel</Link>
              <Link href={`/${profile.username}`}>Mi perfil</Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/entrar">Entrar</Link>
              <Link href="/registro">Crear cuenta</Link>
            </>
          )
        }
      />
      <main className="container" id="contenido">
        <section className="product-hero">
          <div>
            <p className="eyebrow">Perfil de certificación profesional</p>
            <h1 className="product-title">Publica tus credenciales con la claridad de un certificado.</h1>
            <p className="lede">
              CredProfile convierte cada certificación en una ficha que se puede enviar: titular, entidad emisora,
              insignia, competencias y el PDF original. Lo que no rellenas, no aparece.
            </p>
            <div className="actions">
              {profile ? (
                <Link className="btn" href="/panel">
                  Ir al panel
                </Link>
              ) : (
                <>
                  <Link className="btn" href="/registro">
                    Crear cuenta
                  </Link>
                  <Link className="btn secondary" href="/entrar">
                    Entrar
                  </Link>
                </>
              )}
            </div>
            <p className="hero-note">Tu dirección queda en {host}/tu-usuario.</p>
          </div>
          <CredentialPreview />
        </section>

        <section className="steps" aria-labelledby="como-funciona">
          <div className="section-intro">
            <p className="eyebrow">Cómo funciona</p>
            <h2 id="como-funciona">Tres pasos y la ficha está lista para compartir.</h2>
          </div>
          <ol>
            <li>
              <span className="step-index">01</span>
              <h3>Crea tu perfil</h3>
              <p>Nombre, usuario y una página pública con tus credenciales.</p>
            </li>
            <li>
              <span className="step-index">02</span>
              <h3>Añade la credencial</h3>
              <p>La insignia y el PDF son obligatorios: súbelos o pega su URL.</p>
            </li>
            <li>
              <span className="step-index">03</span>
              <h3>Comparte la ficha</h3>
              <p>
                Envía {host}/tu-usuario/tu-certificacion. Quien la abre ve el certificado, no un formulario.
              </p>
            </li>
          </ol>
        </section>

        <section className="closing">
          <div>
            <h2>La próxima credencial, lista para enseñar.</h2>
            <p>Sin cuentas de empresa ni roles de emisor. La ficha la publicas tú.</p>
          </div>
          <div className="actions">
            {profile ? (
              <Link className="btn" href="/panel">
                Ir al panel
              </Link>
            ) : (
              <>
                <Link className="btn" href="/registro">
                  Crear cuenta
                </Link>
                <Link className="btn secondary" href="/entrar">
                  Entrar
                </Link>
              </>
            )}
          </div>
        </section>
        <PageFooter />
      </main>
    </>
  );
}
