import Link from "next/link";
import { PageFooter } from "@/components/page-footer";
import { RegisterForm } from "@/components/register-form";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Crear cuenta",
};

export default function RegistroPage() {
  return (
    <>
      <SiteHeader
        actions={
          <Link href="/entrar">Entrar</Link>
        }
      />
      <main className="container">
        <div className="narrow">
          <RegisterForm />
        </div>
        <PageFooter />
      </main>
    </>
  );
}
