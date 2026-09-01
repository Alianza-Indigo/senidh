import { eq } from "drizzle-orm";
import Image from "next/image";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import Link from "next/link";
import { PrintButton } from "@/components/print-button";
import { db } from "@/db";
import { interventores } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { siteUrl } from "@/lib/credentials";

export default async function CredentialPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const person = (await db.select().from(interventores).where(eq(interventores.id, Number((await params).id))).limit(1))[0];
  if (!person) notFound();
  if (person.photoPathname) person.photoUrl = `/api/media/interventores/${person.id}`;
  const directoryUrl = `${siteUrl()}/directorio?credencial=${person.verificationHash}`;
  const qr = await QRCode.toString(directoryUrl, { type: "svg", errorCorrectionLevel: "H", margin: 0, color: { dark: "#071b35", light: "#ffffff" } });
  return <main className="credential-page"><div className="credential-toolbar"><Link href="/admin/interventores">← Volver</Link><p>Imprima frente y reverso al 100 %, sin ajustar a página.</p><PrintButton/></div><div className="credential-sheet"><section className="id-card"><header><Image src="/assets/logo-senidh.webp" width={52} height={52} alt=""/><div><strong>SENIDH</strong><span>Sede Nacional de Interventores para los Derechos Humanos</span></div></header><div className="id-front">{person.photoUrl ? <Image src={person.photoUrl} width={100} height={124} alt={`Fotografía de ${person.fullName}`}/> : <div className="id-photo-placeholder">{person.fullName[0]}</div>}<div><h1>{person.fullName}</h1><h2>{person.roleTitle}</h2><dl><div><dt>Identificación</dt><dd>{person.credentialNumber}</dd></div><div><dt>Ámbito</dt><dd>{[person.municipality, person.stateName].filter(Boolean).join(", ")}</dd></div><div><dt>Expedición</dt><dd>{person.issuedAt}</dd></div><div><dt>Vigencia</dt><dd>{person.expiresAt}</dd></div></dl></div></div><footer><strong>Derechos · Justicia · Dignidad</strong><span>IDENTIFICACIÓN INSTITUCIONAL</span></footer></section><section className="id-card id-back"><header>VERIFICACIÓN EN EL DIRECTORIO OFICIAL</header><div className="id-back-body"><div className="qr" dangerouslySetInnerHTML={{ __html: qr }}/><div><h2>Escanee para confirmar</h2><p>El QR abre el registro individual dentro del Directorio y muestra su estado actual.</p><small>Folio</small><strong>{person.credentialNumber}</strong><small>Código de verificación</small><strong>{person.verificationHash}</strong></div></div><footer><strong>{new URL(siteUrl()).host}/directorio</strong><span>La consulta electrónica prevalece sobre la impresión.</span></footer></section></div></main>;
}
