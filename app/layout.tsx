import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SENIDH | Derechos, Justicia y Dignidad", template: "%s | SENIDH" },
  description: "Sede Nacional de Interventores para los Derechos Humanos. Directorio y verificación oficial de credenciales.",
  icons: { icon: "/favicon.png" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-MX"><body>{children}</body></html>;
}
