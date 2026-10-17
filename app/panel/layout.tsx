import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Mark } from "@/components/mark";
import { SignOutButton } from "@/components/sign-out-button";
import { getAuthUserId } from "@/lib/auth";
import { getOwnProfile } from "@/lib/data";

export const metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const userId = await getAuthUserId();
  if (!userId) redirect("/entrar");
  const profile = await getOwnProfile(userId);

  return (
    <div className="shell">
      <aside className="side">
        <Link href="/" className="brand">
          <Mark />
          <span>CredProfile</span>
        </Link>
        <nav aria-label="Panel">
          <a href="#perfil">Perfil</a>
          <a href="#credenciales">Credenciales</a>
          {profile ? <Link href={`/${profile.username}`}>Ver público</Link> : null}
        </nav>
        <SignOutButton />
      </aside>
      <div className="shell-main">{children}</div>
    </div>
  );
}
