import Link from "next/link";
import { redirect } from "next/navigation";
import { CopyLink } from "@/components/copy-link";
import { PanelCredentialList } from "@/components/panel-credential-list";
import { ProfileForm } from "@/components/profile-form";
import { getAuthUserId } from "@/lib/auth";
import { getOwnProfile, listCategories, listOwnCredentials } from "@/lib/data";
import { issuedLabel } from "@/lib/format";
import { siteUrl } from "@/lib/site";
import { safeHttpUrl } from "@/lib/validation";
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
  const [credentials, categories] = await Promise.all([listOwnCredentials(userId), listCategories(userId)]);
  const published = credentials.filter((item) => item.is_published).length;
  const publicUrl = `${siteUrl()}/${profile.username}`;

  return (
    <main className="container stack" id="contenido">
      <header className="panel-intro">
        <p className="eyebrow">Panel</p>
        <h1 className="page-title">{profile.full_name}</h1>
        <p className="muted">{profile.email}</p>
        <div className="panel-meta">
          <CopyLink value={publicUrl} />
          <span className={profile.is_public ? "pill ok" : "pill"}>
            {profile.is_public ? "Perfil público" : "Perfil oculto"}
          </span>
          <span className="pill">
            {published} de {credentials.length} publicadas
          </span>
        </div>
      </header>

      <section className="stack" id="credenciales" aria-labelledby="mis-credenciales">
        <div className="section-head">
          <h2 className="section-heading" id="mis-credenciales">
            Credenciales
          </h2>
          <Link className="btn" href="/panel/credencial/nueva">
            Nueva credencial
          </Link>
        </div>
        {credentials.length === 0 ? (
          <section className="card pad empty-state">
            <h3>Todavía no hay credenciales</h3>
              <p className="about">
              Cada ficha necesita un PDF. La insignia es opcional: puedes subirla, pegar una URL o dejarla vacía.
            </p>
            <Link className="btn" href="/panel/credencial/nueva">
              Crear la primera
            </Link>
          </section>
        ) : (
          <PanelCredentialList
            categories={categories.map((category) => ({ id: category.id, name: category.name }))}
            items={credentials.map((credential) => ({
              id: credential.id,
              title: credential.title,
              issuer: credential.issuer_name,
              date: issuedLabel(credential),
              username: profile.username,
              slug: credential.slug,
              published: credential.is_published,
              badgeUrl: safeHttpUrl(credential.badge_image_url),
              paths: storagePaths(credential),
              categoryId: credential.category_id,
            }))}
          />
        )}
      </section>

      <section id="perfil">
        <ProfileForm profile={profile} />
      </section>
    </main>
  );
}
