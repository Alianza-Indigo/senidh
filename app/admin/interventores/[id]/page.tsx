import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { InterventorForm } from "@/components/interventor-form";
import { db } from "@/db";
import { interventores } from "@/db/schema";
export default async function EditInterventorPage({ params }: { params: Promise<{ id: string }> }) { const person = (await db.select().from(interventores).where(eq(interventores.id, Number((await params).id))).limit(1))[0]; if (!person) notFound(); return <AdminShell title="Editar delegado"><InterventorForm person={person}/></AdminShell>; }
