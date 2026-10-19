import Link from "next/link";
import { Mark } from "@/components/mark";

export function SiteFooter() {
  return (
    <footer className="site-foot">
      <div className="foot-brand">
        <Link href="/" className="brand">
          <Mark size={24} />
          <span>CredProfile</span>
        </Link>
        <p>Perfil público y fichas para tus credenciales.</p>
      </div>
      <nav aria-label="Producto">
        <p>Producto</p>
        <Link href={{ pathname: "/", hash: "producto" }}>Qué es</Link>
        <Link href={{ pathname: "/", hash: "como-funciona" }}>Cómo funciona</Link>
        <Link href={{ pathname: "/", hash: "seguridad" }}>Control</Link>
      </nav>
      <nav aria-label="Cuenta">
        <p>Cuenta</p>
        <Link href="/registro">Crear perfil</Link>
        <Link href="/entrar">Entrar</Link>
        <Link href="/panel">Panel</Link>
      </nav>
      <p className="foot-copy">© {new Date().getFullYear()} CredProfile.com</p>
    </footer>
  );
}

export const PageFooter = SiteFooter;
