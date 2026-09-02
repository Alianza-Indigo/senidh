import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const publicUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://senidh.org";
  const organization = {
    "@type": "Organization",
    "@id": `${publicUrl}/#organization`,
    name: settings.organization_name,
    alternateName: "SENIDH",
    url: publicUrl,
    logo: `${publicUrl}/assets/logo-senidh.webp`,
    description: "Organización dedicada a la observación, documentación y promoción de los derechos humanos.",
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.phone ? { telephone: settings.phone } : {}),
    ...(settings.address ? { address: settings.address } : {})
  };
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      organization,
      {
        "@type": "WebSite",
        "@id": `${publicUrl}/#website`,
        url: publicUrl,
        name: "SENIDH",
        description: "Sitio oficial de SENIDH y directorio de identificaciones verificables.",
        inLanguage: "es-MX",
        publisher: { "@id": `${publicUrl}/#organization` }
      }
    ]
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}/><SiteHeader organizationName={settings.organization_name}/><main>{children}</main><SiteFooter/></>;
}
