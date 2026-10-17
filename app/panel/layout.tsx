import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { SignOutButton } from "@/components/sign-out-button";
import { SiteHeader } from "@/components/site-header";
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
    <>
      <SiteHeader
        actions={
          <>
            <Link href="/panel">Panel</Link>
            {profile ? <Link href={`/${profile.username}`}>Ver perfil</Link> : null}
            <SignOutButton />
          </>
        }
      />
      {children}
    </>
  );
}
