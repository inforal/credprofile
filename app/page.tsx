import Link from "next/link";
import { PageFooter } from "@/components/page-footer";
import { SignOutButton } from "@/components/sign-out-button";
import { SiteHeader } from "@/components/site-header";
import { getAuthUserId } from "@/lib/auth";
import { getOwnProfile } from "@/lib/data";

export default async function HomePage() {
  const userId = await getAuthUserId();
  const profile = userId ? await getOwnProfile(userId) : null;

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
      <main className="container">
        <section className="card hero plain">
          <div>
            <div className="eyebrow">CredProfile.com</div>
            <h1>Tus certificaciones, en una ficha que se puede compartir</h1>
            <p className="lede">
              Publica cada credencial con sus datos, la descripción, las competencias, la insignia y el PDF original.
              Tu perfil vive en una dirección propia.
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
          </div>
        </section>
        <div className="layout">
          <section className="card pad">
            <h2>Perfil público</h2>
            <p className="about">Una página con tu nombre, un resumen y el listado de credenciales publicadas.</p>
          </section>
          <section className="card pad">
            <h2>Ficha de la credencial</h2>
            <p className="about">
              Hero, datos técnicos, descripción, skills, insignia, visor del PDF y el pie del emisor. Lo que esté vacío no
              se muestra.
            </p>
          </section>
        </div>
        <PageFooter />
      </main>
    </>
  );
}
