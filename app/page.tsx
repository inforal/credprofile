import Link from "next/link";
import { Mark } from "@/components/mark";
import { SiteFooter } from "@/components/page-footer";
import { SiteHeader } from "@/components/site-header";
import { WaitlistButton } from "@/components/waitlist-button";
import { getAuthUserId } from "@/lib/auth";
import { getOwnProfile } from "@/lib/data";

const description = "Un perfil público y una ficha por cada credencial.";

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

const links = [
  { href: "#producto", label: "Producto" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#seguridad", label: "Seguridad" },
];

export default async function HomePage() {
  const userId = await getAuthUserId();
  const profile = userId ? await getOwnProfile(userId) : null;

  return (
    <>
      <SiteHeader
        links={links}
        actions={
          profile ? (
            <Link className="btn" href="/panel">
              Ir al panel
            </Link>
          ) : (
            <>
              <Link href="/entrar">Entrar</Link>
              <WaitlistButton className="btn">Crear perfil</WaitlistButton>
            </>
          )
        }
      />
      <main id="contenido">
        <section className="hero-band">
          <div className="hero-copy">
            <p className="eyebrow">Perfil público de credenciales</p>
            <h1>Todas tus credenciales, en un perfil que se puede compartir.</h1>
            <p className="lede">
              Cada certificación tiene su propia ficha, con sus datos, la insignia, el PDF y el enlace oficial si lo
              añades.
            </p>
            <div className="actions">
              {profile ? (
                <>
                  <Link className="btn" href="/panel">
                    Ir al panel
                  </Link>
                  <Link className="btn secondary" href={`/${profile.username}`}>
                    Ver mi perfil
                  </Link>
                </>
              ) : (
                <>
                  <WaitlistButton className="btn">Crear perfil</WaitlistButton>
                  <Link className="btn secondary" href="/entrar">
                    Entrar
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="mock" aria-hidden="true">
            <div className="mock-window">
              <div className="mock-bar">
                <Mark size={18} />
                <span>credprofile.com/ana</span>
              </div>
              <div className="mock-body">
                <div className="mock-profile">
                  <strong>Ana Ruiz</strong>
                  <span>3 credenciales en el perfil</span>
                </div>
                <ul>
                  <li>
                    <i />
                    <div>
                      <b>Professional Scrum Master I</b>
                      <small>Scrum.org</small>
                    </div>
                    <em>Pública</em>
                  </li>
                  <li>
                    <i className="alt" />
                    <div>
                      <b>AWS AI Strategist</b>
                      <small>Amazon Web Services</small>
                    </div>
                    <em>Pública</em>
                  </li>
                  <li>
                    <i className="muted" />
                    <div>
                      <b>PRINCE2 Foundation</b>
                      <small>PeopleCert</small>
                    </div>
                    <em className="draft">Borrador</em>
                  </li>
                </ul>
              </div>
            </div>
            <aside className="mock-card">
              <p>Ficha</p>
              <strong>Professional Scrum Master I</strong>
              <span>Insignia · PDF · enlace oficial opcional</span>
            </aside>
          </div>
        </section>

        <section className="benefit-row" aria-label="Qué obtienes">
          <article>
            <h2>Un perfil, varias fichas</h2>
            <p>La dirección pública lista lo que marcas como visible. Cada credencial abre su propia página.</p>
          </article>
          <article>
            <h2>Archivo o URL</h2>
            <p>La insignia y el PDF son obligatorios. Los subes o pegas un enlace. El logo del emisor es opcional.</p>
          </article>
          <article>
            <h2>Enlace oficial, si quieres</h2>
            <p>Puedes apuntar a la página del emisor. El enlace se abre en su web.</p>
          </article>
        </section>

        <section className="band" id="producto">
          <div className="band-copy">
            <p className="eyebrow">Producto</p>
            <h2>El perfil agrupa. La ficha explica.</h2>
            <p>
              Quien recibe tu dirección ve el conjunto. Quien abre una credencial ve los datos, la insignia, las
              competencias y el PDF, solo si los has rellenado.
            </p>
          </div>
          <div className="band-visual" aria-hidden="true">
            <div className="mini-sheet">
              <span>Ficha pública</span>
              <strong>Professional Scrum Master I</strong>
              <dl>
                <div>
                  <dt>Titular</dt>
                  <dd>Ana Ruiz</dd>
                </div>
                <div>
                  <dt>Emisor</dt>
                  <dd>Scrum.org</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="band alt" id="como-funciona">
          <div className="band-copy">
            <p className="eyebrow">Cómo funciona</p>
            <h2>Tres pasos.</h2>
          </div>
          <ol className="steps">
            <li>
              <b>1</b>
              <h3>Crea el perfil</h3>
              <p>Nombre y usuario. Esa combinación es tu dirección pública.</p>
            </li>
            <li>
              <b>2</b>
              <h3>Añade la credencial</h3>
              <p>Datos, insignia y PDF. El enlace oficial queda vacío si no lo tienes.</p>
            </li>
            <li>
              <b>3</b>
              <h3>Publica cuando quieras</h3>
              <p>Un borrador se queda en el panel. Una ficha publicada se puede compartir.</p>
            </li>
          </ol>
        </section>

        <section className="band" id="seguridad">
          <div className="band-copy">
            <p className="eyebrow">Control</p>
            <h2>Tú decides qué se ve.</h2>
            <p>El perfil y cada ficha muestran lo que has marcado como visible.</p>
          </div>
          <ul className="safe-list">
            <li>El perfil puede ocultarse entero.</li>
            <li>Cada ficha se publica por separado.</li>
            <li>Solo tu sesión edita el perfil y las fichas.</li>
            <li>Lo que subes queda en tu carpeta. Una URL externa no se copia.</li>
          </ul>
        </section>

        <section className="cta-band">
          <div>
            <h2>Empieza por una ficha.</h2>
            <p>Crea el perfil, añade una credencial y comparte la dirección cuando esté lista.</p>
          </div>
          <div className="actions">
            {profile ? (
              <Link className="btn light" href="/panel">
                Ir al panel
              </Link>
            ) : (
              <>
                <WaitlistButton className="btn light">Crear perfil</WaitlistButton>
                <Link className="btn secondary light-ghost" href="/entrar">
                  Entrar
                </Link>
              </>
            )}
          </div>
        </section>
        <SiteFooter />
      </main>
    </>
  );
}
