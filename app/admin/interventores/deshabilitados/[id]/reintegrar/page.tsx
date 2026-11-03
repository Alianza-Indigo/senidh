import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { db } from "@/db";
import { disabledInterventores } from "@/db/schema";
import { restoreInterventor } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";

export default async function RestoreInterventorPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) notFound();
  const person = (await db.select().from(disabledInterventores).where(eq(disabledInterventores.id, id)).limit(1))[0];
  if (!person) notFound();

  return <AdminShell title="Reintegrar miembro">
    <section className="admin-card">
      <div className="alert success"><strong>La reintegración recuperará el registro institucional.</strong><p>Se restaurarán el mismo folio, código QR, fotografía, nombramiento, estado anterior y configuración de visibilidad en Google. La persona volverá a la base activa.</p></div>
      <dl className="disable-summary">
        <div><dt>Nombre</dt><dd>{person.fullName}</dd></div>
        <div><dt>Folio</dt><dd>{person.credentialNumber}</dd></div>
        <div><dt>Nombramiento que se recuperará</dt><dd>{person.formerRoleTitle}</dd></div>
        <div><dt>Estado anterior</dt><dd>{person.formerStatus}</dd></div>
        <div><dt>Visibilidad en Google</dt><dd>{person.allowedGoogleIndexing ? "Permitida" : "Oculta"}</dd></div>
      </dl>
      <form className="form-grid" action={restoreInterventor}>
        <input type="hidden" name="id" value={person.id}/>
        <div className="span-2 form-actions"><button className="button navy" type="submit">Confirmar reintegración</button><Link href="/admin/interventores/deshabilitados">Cancelar</Link></div>
      </form>
    </section>
  </AdminShell>;
}
