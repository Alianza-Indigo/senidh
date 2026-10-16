import { desc } from "drizzle-orm";
import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { db } from "@/db";
import { interventores } from "@/db/schema";
import { revokeInterventor } from "@/lib/actions";
import { publicStatus } from "@/lib/credentials";

export default async function InterventoresPage({ searchParams }: { searchParams: Promise<{ saved?: string; disabled?: string; error?: string }> }) {
  const [people, params] = await Promise.all([db.select().from(interventores).orderBy(desc(interventores.createdAt)), searchParams]);
  const errorMessage = params.error === "not-found" ? "El miembro ya no está disponible en la base activa." : params.error ? "No fue posible procesar la deshabilitación." : "";
  return <AdminShell title="Interventores y delegados">
    {params.saved && <div className="alert success">Registro guardado correctamente.</div>}
    {params.disabled && <div className="alert success">Miembro deshabilitado. Su nombramiento y publicación en el Directorio fueron retirados.</div>}
    {errorMessage && <div className="alert error">{errorMessage}</div>}
    <section className="admin-card">
      <header className="card-head"><h2>Credenciales registradas</h2><div className="form-actions"><Link href="/admin/interventores/deshabilitados">Ver deshabilitados</Link><Link className="button navy" href="/admin/interventores/nuevo">Nueva credencial</Link></div></header>
      <div className="table-wrap"><table><thead><tr><th>Folio</th><th>Nombre</th><th>Puesto</th><th>Vigencia</th><th>Estado</th><th>Google</th><th>Acciones</th></tr></thead><tbody>{people.map(person => {
        const status = publicStatus(person);
        return <tr key={person.id}><td><strong>{person.credentialNumber}</strong></td><td>{person.fullName}<small>{person.isForeign ? `Licencia: ${person.driverLicenseNumber ?? "Pendiente"}` : `CURP: ${person.curp ?? "Pendiente"}`}</small><small>{person.isForeign ? "Extranjero" : "Nacional"} · {[person.municipality, person.stateName].filter(Boolean).join(", ")}</small></td><td>{person.roleTitle}</td><td>{person.expiresAt}</td><td><span className={`status ${status.tone}`}>{status.label}</span></td><td><span className={`status ${person.allowGoogleIndexing ? "success" : "muted"}`}>{person.allowGoogleIndexing ? "Permitido" : "Oculto"}</span></td><td><div className="row-actions"><Link href={`/admin/interventores/${person.id}`}>Editar</Link><Link href={`/admin/credencial/${person.id}`} target="_blank">Credencial + QR</Link><Link href={`/directorio?credencial=${person.verificationHash}`} target="_blank">Directorio</Link>{person.status !== "revocada" && <form action={revokeInterventor}><input type="hidden" name="id" value={person.id}/><button type="submit">Revocar</button></form>}<Link href={`/admin/interventores/${person.id}/deshabilitar`}>Deshabilitar</Link></div></td></tr>;
      })}</tbody></table></div>
    </section>
  </AdminShell>;
}
