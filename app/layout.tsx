import type { Metadata } from "next";
import "./globals.css";
import "./admin-access.css";

const publicUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://senidh.org";

export const metadata: Metadata = {
  metadataBase: new URL(publicUrl),
  title: { default: "SENIDH | Derechos, Justicia y Dignidad", template: "%s | SENIDH" },
  description: "Sede Nacional de Interventores para los Derechos Humanos. Directorio y verificación oficial de credenciales.",
  applicationName: "SENIDH",
  keywords: ["SENIDH", "derechos humanos", "interventores", "credenciales", "directorio oficial"],
  creator: "SENIDH",
  publisher: "SENIDH",
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.png" },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "/",
    siteName: "SENIDH",
    title: "SENIDH | Derechos, Justicia y Dignidad",
    description: "Sede Nacional de Interventores para los Derechos Humanos. Directorio y verificación oficial de credenciales.",
    images: [{ url: "/assets/logo-senidh.webp", width: 640, height: 640, alt: "Escudo oficial de SENIDH" }]
  },
  twitter: {
    card: "summary",
    title: "SENIDH | Derechos, Justicia y Dignidad",
    description: "Sede Nacional de Interventores para los Derechos Humanos.",
    images: ["/assets/logo-senidh.webp"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 }
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-MX"><body>{children}</body></html>;
}
