import type { Metadata } from "next";
import { asc, eq, or } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { PublicProfile } from "@/components/public-profile";
import { db } from "@/db";
import { interventores } from "@/db/schema";
import { publicStatus } from "@/lib/credentials";

export const metadata: Metadata = { title: "Directorio" };

export default async function DirectoryPage({ searchParams }: { searchParams: Promise<{ credencial?: string }> }) {
  const query = (await searchParams).credencial?.trim().toUpperCase();
  if (query) {
    const person = (await db.select().from(interventores).where(or(eq(interventores.verificationHash, query), eq(interventores.credentialNumber, query))).limit(1))[0];
    return <><PageHero title="Directorio oficial" description="Registro individual de representaciones e interventores autorizados por SENIDH."/><section className="section"><div className="container narrow">{person ? <PublicProfile person={person} fromQr/> : <div className="alert error"><strong>El código QR no corresponde a un registro del Directorio.</strong><p>La identificación no pudo ser confirmada. Comuníquese con SENIDH.</p></div>}<Link className="text-link" href="/directorio">← Consultar el Directorio general</Link></div></section></>;
  }
  const people = await db.select().from(interventores).orderBy(asc(interventores.fullName));
  return <><PageHero title="Directorio" description="Representación institucional y personas acreditadas por SENIDH."/><section className="section"><div className="container"><div className="directory-grid">{people.map(person => { const status = publicStatus(person); const photoSrc = person.photoPathname ? `/api/media/interventores/${person.id}` : person.photoUrl; return <Link className="person-card" href={`/directorio?credencial=${person.verificationHash}`} key={person.id}>{photoSrc ? <Image src={photoSrc} width={92} height={108} alt=""/> : <div className="mini-placeholder">{person.fullName[0]}</div>}<div><span className={`status ${status.tone}`}>{status.label}</span><h2>{person.fullName}</h2><p>{person.roleTitle}</p><small>{[person.municipality, person.stateName].filter(Boolean).join(", ")}</small></div></Link>; })}</div>{!people.length && <div className="empty"><h2>Directorio en preparación</h2><p>Los registros se publicarán desde el panel administrativo.</p></div>}</div></section></>;
}
