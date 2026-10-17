import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { PageFooter } from "@/components/page-footer";
import { SiteHeader } from "@/components/site-header";
import { safeNextPath } from "@/lib/validation";

export const metadata = {
  title: "Entrar",
};

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  return (
    <>
      <SiteHeader
        actions={
          <Link href="/registro">Crear cuenta</Link>
        }
      />
      <main className="container">
        <div className="narrow">
          <LoginForm nextPath={safeNextPath(params.next)} />
        </div>
        <PageFooter />
      </main>
    </>
  );
}
