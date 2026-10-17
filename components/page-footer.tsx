import Link from "next/link";

export function PageFooter() {
  return (
    <footer className="site-foot">
      <p>© {new Date().getFullYear()} CredProfile.com</p>
      <nav aria-label="Pie de página">
        <Link href="/registro">Crear cuenta</Link>
        <Link href="/entrar">Entrar</Link>
      </nav>
    </footer>
  );
}
