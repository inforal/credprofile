import Link from "next/link";
import { PageFooter } from "@/components/page-footer";
import { SiteHeader } from "@/components/site-header";
import { WaitlistForm } from "@/components/waitlist-form";

export const metadata = {
  title: "Lista de espera",
};

export default function RegistroPage() {
  return (
    <>
      <SiteHeader actions={<Link href="/entrar">Entrar</Link>} />
      <main className="container" id="contenido">
        <div className="waitlist-page">
          <WaitlistForm />
        </div>
        <PageFooter />
      </main>
    </>
  );
}
