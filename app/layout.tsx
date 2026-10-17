import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "CredProfile.com",
    template: "%s | CredProfile.com",
  },
  description: "Fichas públicas para certificaciones y credenciales profesionales.",
  applicationName: "CredProfile",
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "CredProfile.com",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#112642",
  width: "device-width",
  initialScale: 1,
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <a className="skip" href="#contenido">
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
