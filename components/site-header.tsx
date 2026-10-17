import Link from "next/link";
import type { ReactNode } from "react";
import { Mark } from "@/components/mark";

export function SiteHeader({
  note,
  actions,
  links,
}: {
  note?: string;
  actions?: ReactNode;
  links?: Array<{ href: string; label: string }>;
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
        {links ? (
          <nav className="nav-links" aria-label="Secciones">
            {links.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        ) : null}
        {actions ? <div className="nav-actions">{actions}</div> : note ? <p className="topnote">{note}</p> : null}
      </div>
    </header>
  );
}
