import { notFound, redirect } from "next/navigation";
import { CredentialForm } from "@/components/credential-form";
import { DeleteCredentialButton } from "@/components/delete-credential-button";
import { PageFooter } from "@/components/page-footer";
import { getAuthUserId } from "@/lib/auth";
import { getOwnCredential, getOwnProfile, listCategories, listOwnCredentials } from "@/lib/data";
import { distinctLabels, distinctTypeLabels, issuerPresets } from "@/lib/issuers";

export const metadata = {
  title: "Editar credencial",
};

export default async function EditCredentialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await getAuthUserId();
  if (!userId) redirect("/entrar");
  const profile = await getOwnProfile(userId);
  if (!profile) redirect("/panel");
  const [credential, categories, credentials] = await Promise.all([
    getOwnCredential(userId, id),
    listCategories(userId),
    listOwnCredentials(userId),
  ]);
  if (!credential) notFound();
  const categoryName = categories.find((category) => category.id === credential.category_id)?.name ?? "";

  const paths = [credential.badge_storage_path, credential.pdf_storage_path, credential.issuer_logo_storage_path].filter(
    (path): path is string => Boolean(path),
  );

  return (
    <main className="container stack" id="contenido">
      <div className="section-head">
        <div>
          <h1 className="page-title">Editar credencial</h1>
          <p className="intro">{credential.title}</p>
        </div>
        <DeleteCredentialButton id={credential.id} paths={paths} redirectTo="/panel" label="Eliminar credencial" />
      </div>
      <CredentialForm
        credential={credential}
        username={profile.username}
        holderFallback={profile.full_name}
        categoryNames={distinctLabels(categories.map((category) => category.name), false)}
        initialCategory={categoryName}
        typeLabels={distinctTypeLabels(credentials)}
        issuers={issuerPresets(credentials)}
      />
      <PageFooter />
    </main>
  );
}
