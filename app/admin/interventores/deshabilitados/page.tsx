import { desc } from "drizzle-orm";
import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { db } from "@/db";
import { disabledInterventores } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

const dateFormatter = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });

export default async function DisabledInterventoresPage() {
  await requireAdmin();
  const people = await db.select().from(disabledInterventores).orderBy(desc(disabledInterventores.disabledAt));

  return <AdminShell title="Miembros deshabilitados">
    <section className="admin-card">
      <header className="card-head"><div><h2>Padrón administrativo de bajas</h2><p>Registros retirados del Directorio y sin nombramiento vigente.</p></div><Link href="/admin/interventores">Volver a miembros activos</Link></header>
      <div className="table-wrap"><table><thead><tr><th>Fecha de baja</th><th>Folio</th><th>Miembro</th><th>Nombramiento retirado</th><th>Motivo</th><th>Administrador</th></tr></thead><tbody>{people.map(person => <tr key={person.id}><td>{dateFormatter.format(person.disabledAt)}</td><td><strong>{person.credentialNumber}</strong></td><td>{person.fullName}<small>{person.isForeign ? `Licencia: ${person.driverLicenseNumber ?? "No registrada"}` : `CURP: ${person.curp ?? "No registrada"}`}</small></td><td>{person.formerRoleTitle}</td><td>{person.disabledReason || "Sin motivo capturado"}</td><td>{person.disabledByName}<small>{person.disabledByEmail}</small></td></tr>)}</tbody></table></div>
      {!people.length && <div className="empty"><h2>Sin miembros deshabilitados</h2><p>Las bajas administrativas aparecerán aquí.</p></div>}
    </section>
  </AdminShell>;
}
