import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CredProfile.com",
    template: "%s | CredProfile.com",
  },
  description: "Fichas públicas para certificaciones y credenciales profesionales.",
  applicationName: "CredProfile",
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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
