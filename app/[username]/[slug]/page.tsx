import { notFound, redirect } from "next/navigation";
import { CredentialSheet } from "@/components/credential-sheet";
import { SiteHeader } from "@/components/site-header";
import { loadPublicCredential } from "@/lib/data";
import { clipText, holderName } from "@/lib/format";

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
    `${loaded.credential.title} de ${holder}, emitida por ${loaded.credential.issuer_name}.`;
  return {
    title: `${loaded.credential.title} · ${holder}`,
    description,
  };
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
      <main className="container">
        <CredentialSheet username={loaded.profile.username} profile={loaded.profile} credential={loaded.credential} />
      </main>
    </>
  );
}
