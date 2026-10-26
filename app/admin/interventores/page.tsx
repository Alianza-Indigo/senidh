import { and, asc, count, desc, eq, ilike, type SQL } from "drizzle-orm";
import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { db } from "@/db";
import { interventores } from "@/db/schema";
import { revokeInterventor } from "@/lib/actions";
import { publicStatus } from "@/lib/credentials";

const PAGE_SIZE = 50;

type AdminParams = {
  saved?: string;
  disabled?: string;
  error?: string;
  nombre?: string;
  estado?: string;
  numero?: string;
  estatus?: string;
  orden?: string;
  pagina?: string;
};

function clean(value: string | undefined, maxLength: number) {
  return value?.trim().slice(0, maxLength) ?? "";
}

function isCredentialStatus(value: string | undefined): value is "activa" | "suspendida" | "revocada" {
  return value === "activa" || value === "suspendida" || value === "revocada";
}

function pageHref(filters: Pick<AdminParams, "nombre" | "estado" | "numero" | "estatus" | "orden">, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) if (value) params.set(key, value);
  if (page > 1) params.set("pagina", String(page));
  const query = params.toString();
  return query ? `/admin/interventores?${query}` : "/admin/interventores";
}

export default async function InterventoresPage({ searchParams }: { searchParams: Promise<AdminParams> }) {
  const params = await searchParams;
  const status = isCredentialStatus(params.estatus) ? params.estatus : "";
  const filters = {
    nombre: clean(params.nombre, 160),
    estado: clean(params.estado, 100),
    numero: clean(params.numero, 50).toUpperCase(),
    estatus: status,
    orden: ["recientes", "nombre", "estado", "numero"].includes(params.orden ?? "") ? params.orden! : "recientes"
  };
  const conditions: SQL[] = [];
  if (filters.nombre) conditions.push(ilike(interventores.fullName, `%${filters.nombre}%`));
  if (filters.estado) conditions.push(eq(interventores.stateName, filters.estado));
  if (filters.numero) conditions.push(ilike(interventores.credentialNumber, `%${filters.numero}%`));
  if (status) conditions.push(eq(interventores.status, status));
  const where = conditions.length ? and(...conditions) : undefined;
  const requestedPage = Math.max(1, Number.parseInt(params.pagina ?? "1", 10) || 1);

  const [stateRows, totalRows] = await Promise.all([
    db.selectDistinct({ stateName: interventores.stateName }).from(interventores).orderBy(asc(interventores.stateName)),
    db.select({ total: count() }).from(interventores).where(where)
  ]);
  const total = Number(totalRows[0]?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const ordering = filters.orden === "nombre"
    ? [asc(interventores.fullName)]
    : filters.orden === "estado"
      ? [asc(interventores.stateName), asc(interventores.fullName)]
      : filters.orden === "numero"
        ? [asc(interventores.credentialNumber)]
        : [desc(interventores.createdAt)];
  const people = await db.select().from(interventores).where(where).orderBy(...ordering).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE);
  const errorMessage = params.error === "not-found" ? "El miembro ya no está disponible en la base activa." : params.error ? "No fue posible procesar la deshabilitación." : "";

  return <AdminShell title="Interventores y delegados">
    {params.saved && <div className="alert success">Registro guardado correctamente.</div>}
    {params.disabled && <div className="alert success">Miembro deshabilitado. Su nombramiento y publicación en el Directorio fueron retirados.</div>}
    {errorMessage && <div className="alert error">{errorMessage}</div>}
    <section className="admin-card">
      <header className="card-head"><h2>Credenciales registradas</h2><div className="form-actions"><Link href="/admin/interventores/deshabilitados">Ver deshabilitados</Link><Link className="button navy" href="/admin/interventores/nuevo">Nueva credencial</Link></div></header>
      <form className="directory-filter admin-filter" method="get">
        <div className="filter-grid">
          <label>Apellido o nombre<input name="nombre" defaultValue={filters.nombre} placeholder="Buscar persona" maxLength={160}/></label>
          <label>Estado<select name="estado" defaultValue={filters.estado}><option value="">Todos</option>{stateRows.map(row => <option value={row.stateName} key={row.stateName}>{row.stateName}</option>)}</select></label>
          <label>Número<input name="numero" defaultValue={filters.numero} placeholder="Folio" maxLength={50}/></label>
          <label>Estatus<select name="estatus" defaultValue={filters.estatus}><option value="">Todos</option><option value="activa">Activa</option><option value="suspendida">Suspendida</option><option value="revocada">Revocada</option></select></label>
          <label>Ordenar<select name="orden" defaultValue={filters.orden}><option value="recientes">Más recientes</option><option value="nombre">Nombre A–Z</option><option value="estado">Estado A–Z</option><option value="numero">Identificación</option></select></label>
        </div>
        <div className="filter-actions"><button className="button navy" type="submit">Filtrar</button><Link href="/admin/interventores">Limpiar</Link></div>
      </form>
      <div className="directory-summary"><strong>{total.toLocaleString("es-MX")}</strong> {total === 1 ? "credencial" : "credenciales"}<span>Página {page} de {totalPages}</span></div>
      <div className="table-wrap"><table><thead><tr><th>Folio</th><th>Nombre</th><th>Puesto</th><th>Vigencia</th><th>Estado</th><th>Google</th><th>Acciones</th></tr></thead><tbody>{people.map(person => {
        const personStatus = publicStatus(person);
        return <tr key={person.id}><td><strong>{person.credentialNumber}</strong></td><td>{person.fullName}<small>{person.isForeign ? `Licencia: ${person.driverLicenseNumber ?? "Pendiente"}` : `CURP: ${person.curp ?? "Pendiente"}`}</small><small>{person.isForeign ? "Extranjero" : "Nacional"} · {[person.municipality, person.stateName].filter(Boolean).join(", ")}</small></td><td>{person.roleTitle}</td><td>{person.expiresAt}</td><td><span className={`status ${personStatus.tone}`}>{personStatus.label}</span></td><td><span className={`status ${person.allowGoogleIndexing ? "success" : "muted"}`}>{person.allowGoogleIndexing ? "Permitido" : "Oculto"}</span></td><td><div className="row-actions"><Link href={`/admin/interventores/${person.id}`}>Editar</Link><Link href={`/admin/credencial/${person.id}`} target="_blank">Credencial + QR</Link><Link href={`/directorio?credencial=${person.verificationHash}`} target="_blank">Directorio</Link>{person.status !== "revocada" && <form action={revokeInterventor}><input type="hidden" name="id" value={person.id}/><button type="submit">Revocar</button></form>}<Link href={`/admin/interventores/${person.id}/deshabilitar`}>Deshabilitar</Link></div></td></tr>;
      })}</tbody></table></div>
      {!people.length && <div className="empty"><h2>No hay coincidencias</h2><p>Modifique o limpie los filtros de búsqueda.</p></div>}
      {totalPages > 1 && <nav className="pagination" aria-label="Páginas de interventores">
        {page > 1 ? <Link href={pageHref(filters, page - 1)}>← Anterior</Link> : <span/>}
        <span>Página {page} de {totalPages}</span>
        {page < totalPages ? <Link href={pageHref(filters, page + 1)}>Siguiente →</Link> : <span/>}
      </nav>}
    </section>
  </AdminShell>;
}
