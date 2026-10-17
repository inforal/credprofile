import Link from "next/link";
import { Mark } from "@/components/mark";
import { getAuthUserId } from "@/lib/auth";
import { getOwnProfile } from "@/lib/data";

const description =
  "Un perfil público y una ficha por cada credencial que tú declaras. CredProfile no emite ni verifica títulos.";

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
    <div className="home">
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/" className="brand">
            <Mark />
            <span>CredProfile</span>
          </Link>
          <nav className="nav-actions" aria-label="Secciones">
            <a href="#producto">Producto</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#seguridad">Seguridad</a>
          </nav>
          <div className="nav-actions">
            {profile ? (
              <Link className="btn" href="/panel">
                Panel
              </Link>
            ) : (
              <>
                <Link href="/entrar">Entrar</Link>
                <Link className="btn" href="/registro">
                  Crear perfil
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main id="contenido">
        <section className="home-hero">
          <div>
            <p className="eyebrow">Perfil y fichas</p>
            <h1>Lo que declaras, en una página que se puede leer.</h1>
            <p className="lede">
              Un perfil público reúne tus credenciales. Cada una tiene su ficha: datos, insignia y PDF. El enlace
              oficial, si existe, lo añades tú. CredProfile no emite ni verifica.
            </p>
            <div className="actions">
              {profile ? (
                <Link className="btn" href="/panel">
                  Ir al panel
                </Link>
              ) : (
                <>
                  <Link className="btn" href="/registro">
                    Crear perfil
                  </Link>
                  <Link className="btn secondary" href="/entrar">
                    Entrar
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="specimen" aria-hidden="true">
            <p className="specimen-kicker">credprofile.com/ana</p>
            <ol>
              <li>
                <span>01</span> Professional Scrum Master I <em>Pública</em>
              </li>
              <li>
                <span>02</span> AWS Certified AI Strategist <em>Pública</em>
              </li>
              <li>
                <span>03</span> PRINCE2 Foundation <em>Borrador</em>
              </li>
            </ol>
            <div className="specimen-sheet">
              <p>Ficha 01</p>
              <strong>Professional Scrum Master I</strong>
              <span>Ana Ruiz · datos, insignia, PDF</span>
            </div>
          </div>
        </section>

        <section className="home-band" id="producto" aria-labelledby="producto-title">
          <div>
            <p className="eyebrow">Producto</p>
            <h2 id="producto-title">Dos piezas, no un certificado único.</h2>
          </div>
          <div className="home-split">
            <article>
              <h3>El perfil</h3>
              <p>La dirección con tu nombre y el listado de lo que has marcado como público.</p>
            </article>
            <article>
              <h3>La ficha</h3>
              <p>Una página por credencial. Si un campo está vacío, no se imprime.</p>
            </article>
            <article>
              <h3>El enlace oficial</h3>
              <p>Opcional. Apunta a la página del emisor si quieres. Nosotros no la contrastamos.</p>
            </article>
          </div>
        </section>

        <section className="home-steps" id="como-funciona" aria-labelledby="pasos-title">
          <h2 id="pasos-title">Tres movimientos.</h2>
          <ol>
            <li>
              <b>01</b>
              <h3>Abres el perfil</h3>
              <p>Nombre y usuario. Esa es la URL.</p>
            </li>
            <li>
              <b>02</b>
              <h3>Declaras la credencial</h3>
              <p>Insignia y PDF, subidos o por URL. El resto, si lo tienes.</p>
            </li>
            <li>
              <b>03</b>
              <h3>Publicas o guardas</h3>
              <p>Borrador en el panel, o ficha visible para quien tenga el enlace.</p>
            </li>
          </ol>
        </section>

        <section className="home-safe" id="seguridad" aria-labelledby="seguridad-title">
          <h2 id="seguridad-title">Autoridad de lectura, no de sello.</h2>
          <div>
            <p>El titular es quien escribe. La sesión es quien edita. El público solo ve lo publicado.</p>
            <ul>
              <li>Puedes ocultar el perfil entero.</li>
              <li>Cada ficha se publica por separado.</li>
              <li>Los archivos subidos viven en tu carpeta.</li>
              <li>Una URL externa no se copia a nuestro almacén.</li>
            </ul>
          </div>
        </section>

        <section className="home-end">
          <h2>La primera ficha cabe en una tarde.</h2>
          <div className="actions">
            {profile ? (
              <Link className="btn" href="/panel">
                Ir al panel
              </Link>
            ) : (
              <>
                <Link className="btn" href="/registro">
                  Crear perfil
                </Link>
                <Link className="btn secondary" href="/entrar">
                  Entrar
                </Link>
              </>
            )}
          </div>
        </section>
        <footer className="site-foot">
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
