import type { Metadata } from "next";
import { eq, or } from "drizzle-orm";
import { PageHero } from "@/components/page-hero";
import { PublicProfile } from "@/components/public-profile";
import { db } from "@/db";
import { interventores } from "@/db/schema";

export const metadata: Metadata = {
  title: "Verificar identificación",
  description: "Consulta el estado y la vigencia de una credencial emitida por SENIDH.",
  alternates: { canonical: "/identificaciones" }
};

export default async function VerificationPage({ searchParams }: { searchParams: Promise<{ credencial?: string }> }) {
  const query = (await searchParams).credencial?.trim().toUpperCase();
  const person = query ? (await db.select().from(interventores).where(or(eq(interventores.credentialNumber, query), eq(interventores.verificationHash, query))).limit(1))[0] : null;
  return <><PageHero eyebrow="Consulta oficial" title="Verificación de identificaciones" description="Confirma que una credencial corresponde a una persona registrada y conoce su estado actual."/><section className="section"><div className="container content-grid"><div><form className="lookup" method="get"><label htmlFor="credential">Número de identificación o código de verificación</label><div><input id="credential" name="credencial" defaultValue={query} placeholder="SENIDH-CHIH-0001" required/><button type="submit">Consultar</button></div></form>{query && (person ? <PublicProfile person={person}/> : <div className="alert error"><strong>No se encontró una identificación coincidente.</strong><p>Revise el folio o comuníquese con SENIDH.</p></div>)}</div><aside><h2>Proteja su confianza</h2><p>La credencial física debe coincidir con el nombre, fotografía, folio y vigencia mostrados.</p><p>Una credencial suspendida, revocada o vencida no acredita una actuación vigente.</p></aside></div></section></>;
}
