import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/settings";

const CONTACT_EMAIL = "contacto@senidh.org";
const WHATSAPP_DISPLAY = "+52 669 394 2834";
const WHATSAPP_NUMBER = "526693942834";

export async function SiteFooter() {
  const settings = await getSettings();
  const phoneHref = settings.phone.replace(/[^+\d]/g, "");
  return <>
    <footer className="site-footer"><div className="container footer-grid"><div className="footer-brand"><Image src="/assets/logo-senidh.webp" width={82} height={82} alt=""/><div><strong>SENIDH</strong><p>{settings.organization_name}</p></div></div><div><b>Enlaces</b><Link href="/directorio">Directorio</Link><Link href="/identificaciones">Verificar credencial</Link><Link href="/oficios">Oficios</Link></div><div><b>Contacto</b><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">WhatsApp: {WHATSAPP_DISPLAY}</a>{settings.phone && <a href={`tel:${phoneHref}`}>{settings.phone}</a>}{settings.address && <span>{settings.address}</span>}</div></div><div className="container copyright"><span>© {new Date().getFullYear()} SENIDH</span><span>Derechos · Justicia · Dignidad</span></div></footer>
    <div className="contact-dock" aria-label="Contacto rápido"><a href={`mailto:${CONTACT_EMAIL}`}><Mail/>Correo</a>{settings.phone && <a href={`tel:${phoneHref}`}><Phone/>Teléfono</a>}<a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`} target="_blank" rel="noreferrer"><MapPin/>Mapa</a><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"><MessageCircle/>WhatsApp</a></div>
  </>;
}
