import type { Metadata } from "next";
import { and, asc, count, eq, ilike, or, type SQL } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { cache } from "react";
import { AutoSubmitSelect } from "@/components/auto-submit-select";
import { PageHero } from "@/components/page-hero";
import { PublicProfile } from "@/components/public-profile";
import { db } from "@/db";
import { interventores } from "@/db/schema";
import { publicStatus } from "@/lib/credentials";
import { showInterventorPhotos } from "@/lib/features";

const PAGE_SIZE = 24;

type DirectoryParams = {
  credencial?: string;
  nombre?: string;
  estado?: string;
  numero?: string;
  municipio?: string;
  orden?: string;
  pagina?: string;
};

const baseMetadata: Metadata = {
  title: "Directorio oficial",
  description: "Directorio de representantes e interventores acreditados por SENIDH.",
  alternates: { canonical: "/directorio" }
};

const findPerson = cache(async (query: string) => (await db.select().from(interventores).where(or(eq(interventores.verificationHash, query), eq(interventores.credentialNumber, query))).limit(1))[0]);

function clean(value: string | undefined, maxLength: number) {
  return value?.trim().slice(0, maxLength) ?? "";
}

function pageHref(filters: Omit<DirectoryParams, "credencial" | "pagina">, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) if (value) params.set(key, value);
  if (page > 1) params.set("pagina", String(page));
  const query = params.toString();
  return query ? `/directorio?${query}` : "/directorio";
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<DirectoryParams> }): Promise<Metadata> {
  const params = await searchParams;
  const query = params.credencial?.trim().toUpperCase();
  if (!query) {
    const filtered = params.nombre || params.estado || params.numero || params.municipio || params.orden || params.pagina;
    return filtered ? { ...baseMetadata, robots: { index: false, follow: true } } : baseMetadata;
  }
  const person = await findPerson(query);
  if (!person?.allowGoogleIndexing) return { ...baseMetadata, robots: { index: false, follow: false, noarchive: true } };
  return {
    title: `${person.fullName} — Directorio oficial`,
    description: `${person.fullName}, ${person.roleTitle}. Consulta su acreditación y vigencia en el Directorio oficial de SENIDH.`,
    alternates: { canonical: `/directorio?credencial=${encodeURIComponent(person.verificationHash)}` },
    robots: { index: true, follow: true }
  };
}

export default async function DirectoryPage({ searchParams }: { searchParams: Promise<DirectoryParams> }) {
  const photosEnabled = showInterventorPhotos();
  const params = await searchParams;
  const credentialQuery = params.credencial?.trim().toUpperCase();

  if (credentialQuery) {
    const person = await findPerson(credentialQuery);
    return <><PageHero title="Directorio oficial" description="Registro individual de representaciones e interventores autorizados por SENIDH."/><section className="section"><div className="container narrow">{person ? <PublicProfile person={person} fromQr/> : <div className="alert error"><strong>El código QR no corresponde a un registro del Directorio.</strong><p>La identificación no pudo ser confirmada. Comuníquese con SENIDH.</p></div>}<Link className="text-link" href="/directorio">← Consultar el Directorio general</Link></div></section></>;
  }

  const filters = {
    nombre: clean(params.nombre, 160),
    estado: clean(params.estado, 100),
    numero: clean(params.numero, 50).toUpperCase(),
    municipio: clean(params.municipio, 120),
    orden: ["nombre", "estado", "numero"].includes(params.orden ?? "") ? params.orden! : "nombre"
  };
  const requestedPage = Math.max(1, Number.parseInt(params.pagina ?? "1", 10) || 1);
  const conditions: SQL[] = [eq(interventores.allowGoogleIndexing, true)];
  if (filters.nombre) conditions.push(ilike(interventores.fullName, `%${filters.nombre}%`));
  if (filters.estado) conditions.push(eq(interventores.stateName, filters.estado));
  if (filters.numero) conditions.push(ilike(interventores.credentialNumber, `%${filters.numero}%`));
  if (filters.municipio) conditions.push(ilike(interventores.municipality, `%${filters.municipio}%`));
  const where = and(...conditions);

  const [stateRows, totalRows] = await Promise.all([
    db.selectDistinct({ stateName: interventores.stateName }).from(interventores).where(eq(interventores.allowGoogleIndexing, true)).orderBy(asc(interventores.stateName)),
    db.select({ total: count() }).from(interventores).where(where)
  ]);
  const total = Number(totalRows[0]?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const ordering = filters.orden === "estado"
    ? [asc(interventores.stateName), asc(interventores.fullName)]
    : filters.orden === "numero"
      ? [asc(interventores.credentialNumber)]
      : [asc(interventores.fullName)];
  const people = await db.select().from(interventores).where(where).orderBy(...ordering).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE);

  return <>
    <PageHero title="Directorio" description="Localice representantes e interventores por apellido o nombre, estado, municipio o número de identificación."/>
    <section className="section">
      <div className="container">
        <form className="directory-filter" method="get">
          <div className="filter-grid">
            <label>Apellido o nombre<input name="nombre" defaultValue={filters.nombre} placeholder="Ej. Hernández" maxLength={160}/></label>
            <label>Estado<select name="estado" defaultValue={filters.estado}><option value="">Todos los estados</option>{stateRows.map(row => <option value={row.stateName} key={row.stateName}>{row.stateName}</option>)}</select></label>
            <label>Número de identificación<input name="numero" defaultValue={filters.numero} placeholder="Ej. SENIDH-CHIH" maxLength={50}/></label>
            <label>Municipio<input name="municipio" defaultValue={filters.municipio} placeholder="Ej. Cuauhtémoc" maxLength={120}/></label>
            <label>Ordenar por<AutoSubmitSelect name="orden" defaultValue={filters.orden} aria-label="Ordenar el Directorio"><option value="nombre">Nombre A–Z</option><option value="estado">Estado A–Z</option><option value="numero">Identificación</option></AutoSubmitSelect></label>
          </div>
          <div className="filter-actions"><button className="button navy" type="submit">Buscar en el Directorio</button><Link href="/directorio">Limpiar filtros</Link></div>
        </form>

        <div className="directory-summary" aria-live="polite"><strong>{total.toLocaleString("es-MX")}</strong> {total === 1 ? "registro encontrado" : "registros encontrados"}{total > 0 && <span>Página {page} de {totalPages}</span>}</div>

        <div className="directory-grid">{people.map(person => {
          const status = publicStatus(person);
          const photoSrc = photosEnabled ? (person.photoPathname ? `/api/media/interventores/${person.id}` : person.photoUrl) : null;
          return <Link className="person-card" href={`/directorio?credencial=${person.verificationHash}`} key={person.id}>{photoSrc ? <Image src={photoSrc} width={92} height={108} alt=""/> : <div className="mini-placeholder">{person.fullName[0]}</div>}<div><span className={`status ${status.tone}`}>{status.label}</span><h2>{person.fullName}</h2><p>{person.roleTitle}</p><small>{[person.municipality, person.stateName].filter(Boolean).join(", ")}</small><small className="person-number">{person.credentialNumber}</small></div></Link>;
        })}</div>

        {!people.length && <div className="empty"><h2>No se encontraron registros</h2><p>Revise los datos capturados o elimine alguno de los filtros.</p></div>}
        {totalPages > 1 && <nav className="pagination" aria-label="Páginas del Directorio">
          {page > 1 ? <Link href={pageHref(filters, page - 1)}>← Anterior</Link> : <span/>}
          <span>Página {page} de {totalPages}</span>
          {page < totalPages ? <Link href={pageHref(filters, page + 1)}>Siguiente →</Link> : <span/>}
        </nav>}
      </div>
    </section>
  </>;
}
