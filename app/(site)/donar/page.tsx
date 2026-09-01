import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Donar" };

export default async function DonatePage() {
  const settings = await getSettings();
  return <><PageHero eyebrow="Súmate" title="Apoya nuestra labor" description="Tu aportación fortalece la observación, documentación, capacitación y vinculación."/><section className="section"><div className="container content-grid"><div className="donation-box"><h2>Datos para aportación</h2><p>Confirma siempre estos datos por los canales institucionales antes de realizar una operación.</p><dl><div><dt>Banco</dt><dd>{settings.bank_name}</dd></div><div><dt>Titular</dt><dd>{settings.bank_holder}</dd></div><div><dt>CLABE</dt><dd>{settings.bank_clabe}</dd></div><div><dt>Cuenta</dt><dd>{settings.bank_account}</dd></div></dl></div><aside><h2>¿Necesitas apoyo?</h2><p>Escríbenos si necesitas información institucional o un comprobante.</p><Link className="button navy" href="/contacto">Contactar a SENIDH</Link></aside></div></section></>;
}
