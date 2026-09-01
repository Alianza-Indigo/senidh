import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return <><SiteHeader organizationName={settings.organization_name}/><main>{children}</main><SiteFooter/></>;
}
