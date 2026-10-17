import Link from "next/link";
import { HeroStage } from "@/components/landing/hero-stage";
import { LandingHeader } from "@/components/landing/landing-header";
import { getAuthUserId } from "@/lib/auth";
import { getOwnProfile } from "@/lib/data";
import "./landing.css";

const description =
  "Agrupa tus certificaciones en un perfil público. Tú publicas los datos, la insignia y el PDF, y puedes añadir un enlace oficial si lo tienes.";

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

  return (
    <div className="lp">
      <LandingHeader loggedIn={Boolean(profile)} />
      <main id="contenido">
        <section className="lp-hero" aria-labelledby="lp-title">
          <div>
            <p className="lp-kicker">Perfil de credenciales</p>
            <h1 id="lp-title">Agrupa y publica tus credenciales.</h1>
            <p className="lp-lead">
              Un perfil, una ficha por certificación. Publicas tus datos, la insignia y el PDF. Si existe una página
              oficial, el enlace lo añades tú.
            </p>
            <div className="lp-cta">
              {profile ? (
                <>
                  <Link className="lp-btn" href="/panel">
                    Ir al panel
                  </Link>
                  <Link className="lp-btn lp-btn-ghost" href={`/${profile.username}`}>
                    Ver mi perfil
                  </Link>
                </>
              ) : (
                <>
                  <Link className="lp-btn" href="/registro">
                    Crear perfil
                  </Link>
                  <Link className="lp-btn lp-btn-ghost" href="/entrar">
                    Entrar
                  </Link>
                </>
              )}
            </div>
          </div>
          <HeroStage />
        </section>

        <section className="lp-trust" aria-label="Qué incluye">
          <article>
            <h2>Perfil público</h2>
            <p>Una dirección con las fichas que decides mostrar. El resto se queda en el panel.</p>
          </article>
          <article>
            <h2>Enlace oficial opcional</h2>
            <p>No comprobamos el título. Si el emisor tiene una página de consulta, puedes enlazarla.</p>
          </article>
          <article>
            <h2>Archivos a tu cargo</h2>
            <p>Subes la insignia y el PDF, o pegas su URL. Sin logo de emisor, la ficha no lo inventa.</p>
          </article>
        </section>

        <section className="lp-block" id="producto" aria-labelledby="producto-title">
          <header>
            <p className="lp-kicker">Producto</p>
            <h2 id="producto-title">Varias credenciales, una sola presencia.</h2>
            <p>El perfil agrupa. Cada ficha enseña una certificación con el detalle que hayas rellenado.</p>
          </header>
          <div className="lp-bento">
            <article className="lp-tile lp-tile-wide">
              <h3>El perfil reúne las fichas</h3>
              <p>Quien abre tu dirección ve el listado de lo publicado, no un formulario.</p>
              <div className="lp-mini" aria-hidden="true">
                <div>
                  PSM I <span>Pública</span>
                </div>
                <div>
                  AWS AI Strategist <span>Pública</span>
                </div>
                <div>
                  PRINCE2 Foundation <span>Pública</span>
                </div>
              </div>
            </article>
            <article className="lp-tile">
              <h3>Insignia y PDF juntos</h3>
              <p>Los dos son obligatorios en cada ficha. El logo del emisor solo si tú lo aportas.</p>
            </article>
            <article className="lp-tile">
              <h3>Lo vacío no se muestra</h3>
              <p>Descripción, competencias o fecha: si no las escribes, esa parte no aparece.</p>
            </article>
          </div>
        </section>

        <section className="lp-block" id="como-funciona" aria-labelledby="pasos-title">
          <header>
            <p className="lp-kicker">Cómo funciona</p>
            <h2 id="pasos-title">De la cuenta al enlace, en tres pasos.</h2>
          </header>
          <div className="lp-steps">
            <article className="lp-step">
              <b>1</b>
              <h3>Crea el perfil</h3>
              <p>Nombre y usuario. Esa será la dirección pública de tus fichas.</p>
            </article>
            <article className="lp-step">
              <b>2</b>
              <h3>Publica cada credencial</h3>
              <p>Datos, insignia y PDF. El enlace oficial queda como campo opcional.</p>
            </article>
            <article className="lp-step">
              <b>3</b>
              <h3>Comparte la ficha</h3>
              <p>Envías credprofile.com/tu-usuario o la ficha concreta. Tú controlas qué está publicado.</p>
            </article>
          </div>
        </section>

        <section className="lp-block" id="seguridad" aria-labelledby="seguridad-title">
          <div className="lp-safe">
            <header>
              <p className="lp-kicker">Seguridad</p>
              <h2 id="seguridad-title">Tú decides qué se ve.</h2>
              <p>CredProfile no emite certificaciones ni las da por válidas. Publicas información tuya.</p>
            </header>
            <div className="lp-safe-grid">
              <article>
                <h3>Perfil visible u oculto</h3>
                <p>Si ocultas el perfil, las fichas dejan de mostrarse al público.</p>
              </article>
              <article>
                <h3>Borrador por ficha</h3>
                <p>Una credencial puede quedarse sin publicar mientras la preparas.</p>
              </article>
              <article>
                <h3>Edición solo del titular</h3>
                <p>Con la sesión iniciada editas tu perfil y tus fichas. Nadie más.</p>
              </article>
              <article>
                <h3>Archivos en tu carpeta</h3>
                <p>Lo que subes se guarda en tu espacio. Una URL externa no se copia.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="lp-final" aria-labelledby="cierre-title">
          <div>
            <h2 id="cierre-title">Publica la primera ficha.</h2>
            <p>Crea el perfil, añade una credencial y comparte la dirección cuando quieras mostrarla.</p>
          </div>
          <div className="lp-cta">
            {profile ? (
              <Link className="lp-btn lp-btn-light" href="/panel">
                Ir al panel
              </Link>
            ) : (
              <>
                <Link className="lp-btn lp-btn-light" href="/registro">
                  Crear perfil
                </Link>
                <Link className="lp-btn lp-btn-ghost lp-btn-on-dark" href="/entrar">
                  Entrar
                </Link>
              </>
            )}
          </div>
        </section>

        <footer className="lp-foot">
          <p>© {new Date().getFullYear()} CredProfile.com</p>
          <nav aria-label="Pie">
            <Link href="/registro">Crear perfil</Link>
            <Link href="/entrar">Entrar</Link>
          </nav>
        </footer>
      </main>
    </div>
  );
}
