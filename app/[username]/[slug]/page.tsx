import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CopyLink } from "@/components/copy-link";
import { CredentialSheet } from "@/components/credential-sheet";
import { SiteHeader } from "@/components/site-header";
import { loadPublicCredential } from "@/lib/data";
import { clipText, holderName } from "@/lib/format";
import { socialMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const loaded = await loadPublicCredential(username, slug);
  if (!loaded) return { title: "Credencial no encontrada" };
  const holder = holderName(loaded.profile.full_name, loaded.credential.holder_name_override);
  const description =
    clipText(loaded.credential.description ?? "", 180) ||
    `${loaded.credential.title} de ${holder}. Ficha publicada por el titular.`;
  const title = `${loaded.credential.title} · ${holder}`;
  return socialMetadata({
    title,
    description,
    path: `/${loaded.profile.username}/${loaded.credential.slug}`,
    image: loaded.credential.badge_image_url,
  });
}

export default async function PublicCredentialPage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const loaded = await loadPublicCredential(username, slug);
  if (!loaded) notFound();
  if (loaded.profile.username !== username || loaded.credential.slug !== slug) {
    redirect(`/${loaded.profile.username}/${loaded.credential.slug}`);
  }

  return (
    <>
      <SiteHeader />
      <main className="container" id="contenido">
        <div className="share-line">
          <CopyLink value={`${siteUrl()}/${loaded.profile.username}/${loaded.credential.slug}`} label="Copiar ficha" />
          <Link href={`/${loaded.profile.username}`}>Volver al perfil</Link>
        </div>
        <CredentialSheet username={loaded.profile.username} profile={loaded.profile} credential={loaded.credential} />
      </main>
    </>
  );
}
