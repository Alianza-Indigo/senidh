import { count, eq, or } from "drizzle-orm";
import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { db } from "@/db";
import { contactMessages, contentItems, interventores } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [session, params] = await Promise.all([requireAdmin(), searchParams]);
  const [[active], [inactive], [published], [unread]] = await Promise.all([
    db.select({ value: count() }).from(interventores).where(eq(interventores.status, "activa")),
    db.select({ value: count() }).from(interventores).where(or(eq(interventores.status, "suspendida"), eq(interventores.status, "revocada"))),
    db.select({ value: count() }).from(contentItems).where(eq(contentItems.isPublished, true)),
    db.select({ value: count() }).from(contactMessages).where(eq(contactMessages.isRead, false))
  ]);
  return <AdminShell title="Resumen">{params.error === "forbidden" && <div className="alert error">Esta sección está reservada para el superadministrador.</div>}<div className="stats"><article><strong>{active.value}</strong><span>Credenciales activas</span></article><article><strong>{inactive.value}</strong><span>Suspendidas o revocadas</span></article><article><strong>{published.value}</strong><span>Publicaciones</span></article><article><strong>{unread.value}</strong><span>Mensajes sin leer</span></article></div><section className="admin-card"><h2>Acciones rápidas</h2><div className="form-actions"><Link className="button navy" href="/admin/interventores/nuevo">Registrar delegado</Link><Link className="button navy" href="/admin/contenido/nuevo">Crear publicación</Link>{session.isSuperadmin && <Link className="button navy" href="/admin/administradores">Crear administrador</Link>}</div></section></AdminShell>;
}
