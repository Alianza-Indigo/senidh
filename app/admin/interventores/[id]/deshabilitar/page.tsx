import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { db } from "@/db";
import { interventores } from "@/db/schema";
import { disableInterventor } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";

export default async function DisableInterventorPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) notFound();
  const person = (await db.select().from(interventores).where(eq(interventores.id, id)).limit(1))[0];
  if (!person) notFound();

  return <AdminShell title="Deshabilitar miembro">
    <section className="admin-card">
      <div className="alert error"><strong>Esta acción retira la acreditación vigente.</strong><p>La persona dejará de aparecer en el Directorio, su QR dejará de verificarla y el nombramiento “{person.roleTitle}” quedará retirado.</p></div>
      <dl className="disable-summary">
        <div><dt>Nombre</dt><dd>{person.fullName}</dd></div>
        <div><dt>Folio</dt><dd>{person.credentialNumber}</dd></div>
        <div><dt>Nombramiento actual</dt><dd>{person.roleTitle}</dd></div>
      </dl>
      <form className="form-grid" action={disableInterventor}>
        <input type="hidden" name="id" value={person.id}/>
        <label className="span-2">Motivo de la deshabilitación<textarea name="reason" rows={4} maxLength={1000} placeholder="Opcional. Quedará únicamente en el registro administrativo de bajas."/></label>
        <div className="span-2 form-actions"><button className="button navy" type="submit">Confirmar deshabilitación</button><Link href="/admin/interventores">Cancelar</Link></div>
      </form>
    </section>
  </AdminShell>;
}
