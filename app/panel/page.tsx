import Link from "next/link";
import { redirect } from "next/navigation";
import { DeleteCredentialButton } from "@/components/delete-credential-button";
import { PageFooter } from "@/components/page-footer";
import { ProfileForm } from "@/components/profile-form";
import { getAuthUserId } from "@/lib/auth";
import { getOwnProfile, listOwnCredentials } from "@/lib/data";
import { issuedLabel } from "@/lib/format";
import type { Credential } from "@/lib/types";

function storagePaths(credential: Credential): string[] {
  return [credential.badge_storage_path, credential.pdf_storage_path, credential.issuer_logo_storage_path].filter(
    (path): path is string => Boolean(path),
  );
}

export default async function PanelPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/entrar");
  const profile = await getOwnProfile(userId);
  if (!profile) {
    return (
      <main className="container" id="contenido">
        <section className="card pad">
          <h1 className="page-title">No encontramos tu perfil</h1>
          <p className="about">La cuenta existe, pero el perfil todavía no está disponible. Vuelve a entrar en unos segundos.</p>
        </section>
      </main>
    );
  }
  const credentials = await listOwnCredentials(userId);

  return (
    <main className="container stack" id="contenido">
      <header className="panel-intro">
        <p className="eyebrow">Panel</p>
        <h1 className="page-title">{profile.full_name}</h1>
        <p className="muted">
          Perfil público: <Link href={`/${profile.username}`}>/{profile.username}</Link>
          {profile.is_public ? "" : " · oculto para el resto"}
        </p>
      </header>
      <ProfileForm profile={profile} />
      <section className="stack" aria-labelledby="mis-credenciales">
        <div className="section-head">
          <h2 className="section-heading" id="mis-credenciales">
            Credenciales
          </h2>
          {credentials.length > 0 ? (
            <Link className="btn" href="/panel/credencial/nueva">
              Nueva credencial
            </Link>
          ) : null}
        </div>
        {credentials.length === 0 ? (
          <section className="card pad empty-state">
            <h3>Todavía no hay credenciales</h3>
            <p className="about">Añade la primera con su insignia y el PDF. Puedes subir los archivos o pegar una URL.</p>
            <Link className="btn" href="/panel/credencial/nueva">
              Nueva credencial
            </Link>
          </section>
        ) : (
          <ul className="cred-list">
            {credentials.map((credential) => {
              const date = issuedLabel(credential);
              return (
                <li className="card cred-row" key={credential.id}>
                  <img src={credential.badge_image_url} alt={`Insignia de ${credential.title}`} />
                  <div className="cred-copy">
                    <strong>{credential.title}</strong>
                    <p>
                      {credential.issuer_name}
                      {date ? ` · ${date}` : ""}
                    </p>
                    <p className="muted">
                      /{profile.username}/{credential.slug}
                    </p>
                  </div>
                  <div className="row-actions">
                    <span className={credential.is_published ? "pill ok" : "pill"}>
                      {credential.is_published ? "Publicada" : "No publicada"}
                    </span>
                    {credential.is_published ? (
                      <Link href={`/${profile.username}/${credential.slug}`}>Ver</Link>
                    ) : null}
                    <Link href={`/panel/credencial/${credential.id}`}>Editar</Link>
                    <DeleteCredentialButton id={credential.id} paths={storagePaths(credential)} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <PageFooter />
    </main>
  );
}
