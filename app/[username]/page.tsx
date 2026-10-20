import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageFooter } from "@/components/page-footer";
import { SiteHeader } from "@/components/site-header";
import { groupByCategory } from "@/lib/categories";
import { loadPublicProfile } from "@/lib/data";
import { issuedLabel, nameInitials } from "@/lib/format";
import { socialMetadata } from "@/lib/seo";
import type { Credential } from "@/lib/types";
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

  const { profile, credentials, categories } = loaded;
  const avatar = safeHttpUrl(profile.avatar_url);
  const website = safeHttpUrl(profile.website_url);
  const linkedin = safeHttpUrl(profile.linkedin_url);
  const groups = groupByCategory(categories, credentials);
  const showCategoryTitles = groups.some((group) => group.category);

  return (
    <>
      <SiteHeader />
      <main className="container" id="contenido">
        <section className="card profile-hero">
          {avatar ? (
            <img className="profile-avatar" src={avatar} alt={`Foto de ${profile.full_name}`} />
          ) : (
            <span className="profile-avatar profile-avatar-initials" aria-hidden="true">
              {nameInitials(profile.full_name)}
            </span>
          )}
          <div>
            <p className="eyebrow">Perfil de credenciales profesionales</p>
            <h1>{profile.full_name}</h1>
            {profile.headline?.trim() ? <p className="profile-headline">{profile.headline}</p> : null}
            {profile.bio?.trim() ? <p className="about profile-bio">{profile.bio}</p> : null}
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

        <section className="profile-block">
          {credentials.length === 0 ? (
            <section className="card pad empty-state">
              <h3>No hay credenciales publicadas</h3>
              <p className="about">Cuando este perfil publique una certificación, aparecerá aquí.</p>
            </section>
          ) : (
            groups.map((group) => (
              <div className="profile-group" key={group.category?.id ?? "sin-categoria"}>
                {showCategoryTitles && group.category ? <h3 className="profile-category">{group.category.name}</h3> : null}
                <div className="profile-creds">
                  {group.items.map((credential) => (
                    <CredentialRow key={credential.id} username={profile.username} credential={credential} />
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
        <PageFooter />
      </main>
    </>
  );
}

function CredentialRow({ username, credential }: { username: string; credential: Credential }) {
  const date = issuedLabel(credential);
  const badge = safeHttpUrl(credential.badge_image_url);
  return (
    <Link className="card profile-cred" href={`/${username}/${credential.slug}`}>
      {badge ? <img src={badge} alt={`Insignia de ${credential.title}`} /> : <span className="profile-badge-gap" aria-hidden="true" />}
      <span className="profile-cred-copy">
        <span className="profile-type">{credential.credential_type_label}</span>
        <strong>{credential.title}</strong>
        <span className="profile-issuer">
          <BuildingIcon />
          <span>{credential.issuer_name}</span>
        </span>
        {date ? (
          <span className="profile-date">
            <CalendarIcon />
            <span>{date}</span>
          </span>
        ) : null}
      </span>
      <span className="profile-chevron" aria-hidden="true">
        <ChevronIcon />
      </span>
    </Link>
  );
}

function BuildingIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="1.8" d="M4 20h16M6 20V6h8v14M14 10h4v10M9 9h2M9 13h2" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="1.8" d="M5 6h14v14H5V6Zm0 4h14M8 4v4M16 4v4" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="1.8" d="m9 6 6 6-6 6" />
    </svg>
  );
}
