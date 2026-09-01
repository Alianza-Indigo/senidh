import { desc } from "drizzle-orm";
import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { db } from "@/db";
import { interventores } from "@/db/schema";
import { revokeInterventor } from "@/lib/actions";
import { publicStatus } from "@/lib/credentials";

export default async function InterventoresPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [people, params] = await Promise.all([db.select().from(interventores).orderBy(desc(interventores.createdAt)), searchParams]);
  return <AdminShell title="Interventores y delegados">{params.saved && <div className="alert success">Registro guardado correctamente.</div>}<section className="admin-card"><header className="card-head"><h2>Credenciales registradas</h2><Link className="button navy" href="/admin/interventores/nuevo">Nueva credencial</Link></header><div className="table-wrap"><table><thead><tr><th>Folio</th><th>Nombre</th><th>Puesto</th><th>Vigencia</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{people.map(person => { const status = publicStatus(person); return <tr key={person.id}><td><strong>{person.credentialNumber}</strong></td><td>{person.fullName}<small>{[person.municipality, person.stateName].filter(Boolean).join(", ")}</small></td><td>{person.roleTitle}</td><td>{person.expiresAt}</td><td><span className={`status ${status.tone}`}>{status.label}</span></td><td><div className="row-actions"><Link href={`/admin/interventores/${person.id}`}>Editar</Link><Link href={`/admin/credencial/${person.id}`} target="_blank">Credencial + QR</Link><Link href={`/directorio?credencial=${person.verificationHash}`} target="_blank">Directorio</Link>{person.status !== "revocada" && <form action={revokeInterventor}><input type="hidden" name="id" value={person.id}/><button type="submit">Revocar</button></form>}</div></td></tr>; })}</tbody></table></div></section></AdminShell>;
}
