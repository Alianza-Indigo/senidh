import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { submitContact } from "@/lib/actions";
import { CONTACT_EMAIL, WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from "@/lib/contact-info";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Canal de contacto institucional de SENIDH.",
  alternates: { canonical: "/contacto" }
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const [settings, params] = await Promise.all([getSettings(), searchParams]);
  return <><PageHero eyebrow="Canal institucional" title="Contacto" description="Cuéntanos brevemente el motivo de tu comunicación. Tus datos serán tratados únicamente para responder."/><section className="section"><div className="container contact-grid"><div className="contact-card"><h2>Hablemos</h2><a href={`mailto:${CONTACT_EMAIL}`}><Mail/>{CONTACT_EMAIL}</a><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"><MessageCircle/>{WHATSAPP_DISPLAY}</a>{settings.phone && <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`}><Phone/>{settings.phone}</a>}{settings.address && <span><MapPin/>{settings.address}</span>}{settings.office_hours && <p>{settings.office_hours}</p>}</div><form className="contact-form" action={submitContact}>{params.sent && <div className="alert success">Mensaje recibido. SENIDH dará seguimiento por los datos proporcionados.</div>}<label>Nombre completo<input name="name" required maxLength={120}/></label><label>Correo electrónico<input name="email" type="email" required maxLength={160}/></label><label>Teléfono<input name="phone" maxLength={40}/></label><label>Asunto<input name="subject" required maxLength={160}/></label><label>Mensaje<textarea name="message" required minLength={10} maxLength={5000} rows={6}/></label><label className="honeypot">Sitio web<input name="website" tabIndex={-1} autoComplete="off"/></label><button className="button navy" type="submit">Enviar mensaje</button></form></div></section></>;
}
