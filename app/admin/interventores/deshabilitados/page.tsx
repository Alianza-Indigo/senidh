import { desc } from "drizzle-orm";
import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { db } from "@/db";
import { disabledInterventores } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

const dateFormatter = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });

type DisabledParams = { error?: string; id?: string };

export default async function DisabledInterventoresPage({ searchParams }: { searchParams: Promise<DisabledParams> }) {
  await requireAdmin();
  const params = await searchParams;
  const people = await db.select().from(disabledInterventores).orderBy(desc(disabledInterventores.disabledAt));
  const errorMessage = params.error === "conflict"
    ? "No se pudo reintegrar: el folio, QR, CURP o identificador original ya está ocupado por otro registro activo. Revise los registros antes de intentarlo nuevamente."
    : params.error === "not-found"
      ? "El registro ya no se encuentra en la base de miembros deshabilitados."
      : params.error
        ? "No fue posible procesar la reintegración."
        : "";

  return <AdminShell title="Miembros deshabilitados">
    {errorMessage && <div className="alert error">{errorMessage}</div>}
    <section className="admin-card">
      <header className="card-head"><div><h2>Padrón administrativo de bajas</h2><p>Registros retirados del Directorio y sin nombramiento vigente.</p></div><Link href="/admin/interventores">Volver a miembros activos</Link></header>
      <div className="table-wrap"><table><thead><tr><th>Fecha de baja</th><th>Folio</th><th>Miembro</th><th>Nombramiento retirado</th><th>Motivo</th><th>Administrador</th><th>Acciones</th></tr></thead><tbody>{people.map(person => <tr key={person.id}><td>{dateFormatter.format(person.disabledAt)}</td><td><strong>{person.credentialNumber}</strong></td><td>{person.fullName}<small>{person.isForeign ? `Licencia: ${person.driverLicenseNumber ?? "No registrada"}` : `CURP: ${person.curp ?? "No registrada"}`}</small></td><td>{person.formerRoleTitle}</td><td>{person.disabledReason || "Sin motivo capturado"}</td><td>{person.disabledByName}<small>{person.disabledByEmail}</small></td><td><div className="row-actions"><Link href={`/admin/interventores/deshabilitados/${person.id}/reintegrar`}>Reintegrar</Link></div></td></tr>)}</tbody></table></div>
      {!people.length && <div className="empty"><h2>Sin miembros deshabilitados</h2><p>Las bajas administrativas aparecerán aquí.</p></div>}
    </section>
  </AdminShell>;
}
