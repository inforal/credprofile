import type { Metadata, Viewport } from "next";
import { Newsreader, Outfit } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/lib/site";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ui",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "CredProfile.com",
    template: "%s | CredProfile.com",
  },
  description: "Perfil público y fichas para las credenciales que tú declaras.",
  applicationName: "CredProfile",
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "CredProfile.com",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${outfit.variable} ${newsreader.variable}`}>
      <body className={outfit.className}>
        <a className="skip" href="#contenido">
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
