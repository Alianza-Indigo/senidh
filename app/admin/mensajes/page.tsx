import { desc } from "drizzle-orm";
import { AdminShell } from "@/components/admin-shell";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { markMessageRead } from "@/lib/actions";

export default async function MessagesPage() {
  const messages = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(200);
  return <AdminShell title="Mensajes"><section className="admin-card"><div className="table-wrap"><table><thead><tr><th>Fecha</th><th>Remitente</th><th>Asunto y mensaje</th><th>Estado</th></tr></thead><tbody>{messages.map(message => <tr className={message.isRead ? "" : "unread"} key={message.id}><td>{new Intl.DateTimeFormat("es-MX", { dateStyle: "short", timeStyle: "short" }).format(message.createdAt)}</td><td>{message.name}<small><a href={`mailto:${message.email}`}>{message.email}</a><br/>{message.phone}</small></td><td><strong>{message.subject}</strong><p>{message.message}</p></td><td>{message.isRead ? "Leído" : <form action={markMessageRead}><input type="hidden" name="id" value={message.id}/><button type="submit">Marcar leído</button></form>}</td></tr>)}</tbody></table></div></section></AdminShell>;
}
