import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { ContentForm } from "@/components/content-form";
import { db } from "@/db";
import { contentItems } from "@/db/schema";
export default async function EditContentPage({ params }: { params: Promise<{ id: string }> }) { const item = (await db.select().from(contentItems).where(eq(contentItems.id, Number((await params).id))).limit(1))[0]; if (!item) notFound(); return <AdminShell title="Editar contenido"><ContentForm item={item}/></AdminShell>; }
