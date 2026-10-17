import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CopyLink } from "@/components/copy-link";
import { PageFooter } from "@/components/page-footer";
import { SiteHeader } from "@/components/site-header";
import { loadPublicProfile } from "@/lib/data";
import { issuedLabel } from "@/lib/format";
import { socialMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import { safeHttpUrl } from "@/lib/validation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const loaded = await loadPublicProfile(username);
  if (!loaded) return { title: "Perfil no encontrado" };
  const description = loaded.profile.bio?.trim() || `Credenciales profesionales de ${loaded.profile.full_name}.`;
  return socialMetadata({
    title: loaded.profile.full_name,
    description,
    path: `/${loaded.profile.username}`,
    image: loaded.profile.avatar_url,
  });
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const loaded = await loadPublicProfile(username);
  if (!loaded) notFound();
  if (loaded.profile.username !== username) redirect(`/${loaded.profile.username}`);

  const { profile, credentials, isOwner } = loaded;
  const avatar = safeHttpUrl(profile.avatar_url);
  const website = safeHttpUrl(profile.website_url);
  const linkedin = safeHttpUrl(profile.linkedin_url);

  return (
    <>
      <SiteHeader />
      <main className="container" id="contenido">
        <div className="share-line">
          <CopyLink value={`${siteUrl()}/${profile.username}`} label="Copiar perfil" />
          {isOwner ? <Link href="/panel">Editar en el panel</Link> : null}
          {!profile.is_public ? <span className="pill">Oculto para el resto</span> : null}
        </div>
        <section className={avatar ? "card hero" : "card hero plain"}>
          {avatar ? <img className="avatar" src={avatar} alt={`Foto de ${profile.full_name}`} /> : null}
          <div>
            <div className="eyebrow">Perfil profesional</div>
            <h1>{profile.full_name}</h1>
            {profile.headline?.trim() ? <p className="name">{profile.headline}</p> : null}
            {profile.bio?.trim() ? <p className="about">{profile.bio}</p> : null}
            {website || linkedin ? (
              <div className="profile-links">
                {website ? (
                  <a href={website} target="_blank" rel="noopener noreferrer">
                    Web ↗
                  </a>
                ) : null}
                {linkedin ? (
                  <a href={linkedin} target="_blank" rel="noopener noreferrer">
                    LinkedIn ↗
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
        <section className="stack profile-block">
          <h2 className="section-heading">Credenciales</h2>
          {credentials.length === 0 ? (
            <section className="card pad empty-state">
              <h3>No hay credenciales publicadas</h3>
              <p className="about">Cuando este perfil publique una certificación, aparecerá aquí.</p>
            </section>
          ) : (
            <div className="cred-grid">
              {credentials.map((credential) => {
                const date = issuedLabel(credential);
                return (
                  <Link className="card cred-card" key={credential.id} href={`/${profile.username}/${credential.slug}`}>
                    {safeHttpUrl(credential.badge_image_url) ? (
                      <img src={credential.badge_image_url ?? ""} alt={`Insignia de ${credential.title}`} />
                    ) : null}
                    <div>
                      <div className="eyebrow">{credential.credential_type_label}</div>
                      <strong>{credential.title}</strong>
                      <p className="muted">
                        {credential.issuer_name}
                        {date ? ` · ${date}` : ""}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
        <PageFooter />
      </main>
    </>
  );
}
