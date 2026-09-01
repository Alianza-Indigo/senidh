import { desc } from "drizzle-orm";
import { AdminShell } from "@/components/admin-shell";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { createAdministrator } from "@/lib/actions";
import { requireSuperadmin } from "@/lib/auth";

export default async function AdministratorsPage({ searchParams }: { searchParams: Promise<{ created?: string; error?: string }> }) {
  await requireSuperadmin();
  const [params, administratorRows] = await Promise.all([
    searchParams,
    db.select({ id: admins.id, name: admins.name, email: admins.email, lastLoginAt: admins.lastLoginAt, createdAt: admins.createdAt }).from(admins).orderBy(desc(admins.createdAt))
  ]);
  const error = params.error === "exists" ? "Ya existe un administrador con ese correo." : params.error ? "Revise los datos y confirme que ambas contraseñas coincidan." : "";
  return <AdminShell title="Administradores">
    {params.created && <div className="alert success">Administrador creado correctamente.</div>}
    {error && <div className="alert error">{error}</div>}
    <section className="admin-card">
      <h2>Crear administrador</h2>
      <p>La nueva cuenta podrá administrar interventores, contenidos, mensajes y configuración, pero no podrá crear otros administradores.</p>
      <form className="form-grid" action={createAdministrator}>
        <label>Nombre completo<input name="name" required minLength={2} maxLength={120}/></label>
        <label>Correo electrónico<input name="email" type="email" autoComplete="off" required maxLength={160}/></label>
        <label>Contraseña<input name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128}/></label>
        <label>Confirmar contraseña<input name="passwordConfirmation" type="password" autoComplete="new-password" required minLength={12} maxLength={128}/></label>
        <div className="span-2"><button className="button navy" type="submit">Crear administrador</button></div>
      </form>
    </section>
    <section className="admin-card">
      <div className="card-head"><div><h2>Administradores registrados</h2><p>El superadministrador configurado en Vercel no aparece en esta lista.</p></div></div>
      <div className="table-wrap"><table><thead><tr><th>Nombre</th><th>Correo</th><th>Creado</th><th>Último acceso</th></tr></thead><tbody>{administratorRows.map(admin => <tr key={admin.id}><td>{admin.name}</td><td>{admin.email}</td><td>{formatDate(admin.createdAt)}</td><td>{admin.lastLoginAt ? formatDate(admin.lastLoginAt) : "Sin acceso"}</td></tr>)}</tbody></table></div>
      {!administratorRows.length && <div className="empty"><p>Todavía no existen administradores adicionales.</p></div>}
    </section>
  </AdminShell>;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(value);
}
