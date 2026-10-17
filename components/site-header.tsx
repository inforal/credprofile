import Link from "next/link";
import type { ReactNode } from "react";

export function BrandMark() {
  return (
    <svg width="30" height="34" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 2 22 6v8c0 6-4 9.8-10 12C6 23.8 2 20 2 14V6L12 2Z" />
      <path d="m8 14 3 3 6-7" />
    </svg>
  );
}

export function SiteHeader({
  note = "Perfil de certificación profesional",
  actions,
}: {
  note?: string;
  actions?: ReactNode;
}) {
  return (
    <header>
      <nav>
        <Link href="/" className="brand">
          <BrandMark />
          CredProfile
          <span className="brand-tld">.com</span>
        </Link>
        {actions ? <div className="nav-actions">{actions}</div> : <div className="topnote">{note}</div>}
      </nav>
    </header>
  );
}
