import { redirect } from "next/navigation";
import { CredentialForm } from "@/components/credential-form";
import { PageFooter } from "@/components/page-footer";
import { getAuthUserId } from "@/lib/auth";
import { getOwnProfile, listCategories, listOwnCredentials } from "@/lib/data";
import { issuerPresets } from "@/lib/issuers";

export const metadata = {
  title: "Nueva credencial",
};

export default async function NewCredentialPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/entrar");
  const profile = await getOwnProfile(userId);
  if (!profile) redirect("/panel");
  const [categories, credentials] = await Promise.all([listCategories(userId), listOwnCredentials(userId)]);

  return (
    <main className="container stack" id="contenido">
      <div>
        <h1 className="page-title">Nueva credencial</h1>
        <p className="intro">La insignia y el PDF son obligatorios. Puedes subir cada archivo o pegar su URL.</p>
      </div>
      <CredentialForm
        username={profile.username}
        holderFallback={profile.full_name}
        categoryNames={categories.map((category) => category.name)}
        issuers={issuerPresets(credentials)}
      />
      <PageFooter />
    </main>
  );
}
