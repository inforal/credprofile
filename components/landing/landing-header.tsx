import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

export function LandingHeader({ loggedIn }: { loggedIn: boolean }) {
  return (
    <header className="lp-bar">
      <div className="lp-bar-inner">
        <Link href="/" className="lp-brand">
          <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
            <rect x="3" y="9" width="16" height="18" rx="5" fill="#22d3ee" />
            <rect x="12" y="4" width="17" height="18" rx="5" fill="#f8fbff" />
            <path d="M16.5 10.5h8M16.5 14.5h6" stroke="#155eef" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          CredProfile
        </Link>
        <nav className="lp-anchors" aria-label="Secciones">
          <a href="#producto">Producto</a>
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#seguridad">Seguridad</a>
        </nav>
        <div className="lp-bar-actions">
          {loggedIn ? (
            <>
              <Link href="/panel">Panel</Link>
              <span className="lp-signout">
                <SignOutButton />
              </span>
            </>
          ) : (
            <>
              <Link href="/entrar">Entrar</Link>
              <Link className="lp-btn lp-btn-small" href="/registro">
                Crear perfil
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
