import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageFooter } from "@/components/page-footer";
import { SiteHeader } from "@/components/site-header";
import { loadPublicProfile } from "@/lib/data";
import { issuedLabel } from "@/lib/format";
import { safeHttpUrl } from "@/lib/validation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const loaded = await loadPublicProfile(username);
  if (!loaded) return { title: "Perfil no encontrado" };
  return {
    title: loaded.profile.full_name,
    description: loaded.profile.bio?.trim() || `Credenciales profesionales de ${loaded.profile.full_name}.`,
  };
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
      <main className="container">
        {isOwner ? (
          <p className="bread">
            <Link href="/panel">Editar en el panel</Link>
            {!profile.is_public ? " · Este perfil está oculto para el resto" : null}
          </p>
        ) : null}
        <section className={avatar ? "card hero" : "card hero plain"}>
          {avatar ? <img className="avatar" src={avatar} alt="" /> : null}
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
        <section className="stack" style={{ marginTop: 22 }}>
          <h2 className="page-title">Credenciales</h2>
          {credentials.length === 0 ? (
            <section className="card pad">
              <p className="about">No hay credenciales publicadas.</p>
            </section>
          ) : (
            <div className="cred-grid">
              {credentials.map((credential) => {
                const date = issuedLabel(credential);
                return (
                  <Link className="card cred-card" key={credential.id} href={`/${profile.username}/${credential.slug}`}>
                    <img src={credential.badge_image_url} alt="" />
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
