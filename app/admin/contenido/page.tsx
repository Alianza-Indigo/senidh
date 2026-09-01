import { desc } from "drizzle-orm";
import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { db } from "@/db";
import { contentItems } from "@/db/schema";
import { deleteContent } from "@/lib/actions";

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [items, params] = await Promise.all([db.select().from(contentItems).orderBy(desc(contentItems.createdAt)), searchParams]);
  return <AdminShell title="Contenido público">{params.saved && <div className="alert success">Contenido guardado.</div>}<section className="admin-card"><header className="card-head"><h2>Publicaciones</h2><Link className="button navy" href="/admin/contenido/nuevo">Nuevo contenido</Link></header><div className="table-wrap"><table><thead><tr><th>Sección</th><th>Título</th><th>Fecha</th><th>Publicado</th><th>Acciones</th></tr></thead><tbody>{items.map(item => <tr key={item.id}><td>{item.itemType}</td><td><strong>{item.title}</strong><small>{item.subtitle}</small></td><td>{item.eventDate ?? "—"}</td><td>{item.isPublished ? "Sí" : "No"}</td><td><div className="row-actions"><Link href={`/admin/contenido/${item.id}`}>Editar</Link><form action={deleteContent}><input type="hidden" name="id" value={item.id}/><button type="submit">Eliminar</button></form></div></td></tr>)}</tbody></table></div></section></AdminShell>;
}
