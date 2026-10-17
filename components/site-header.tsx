import Link from "next/link";
import type { ReactNode } from "react";
import { Mark } from "@/components/mark";

export function SiteHeader({
  note = "Perfil y fichas declaradas por el titular",
  actions,
}: {
  note?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand">
          <Mark />
          <span>
            CredProfile
            <span className="brand-tld">.com</span>
          </span>
        </Link>
        {actions ? <nav className="nav-actions">{actions}</nav> : <p className="topnote">{note}</p>}
      </div>
    </header>
  );
}
