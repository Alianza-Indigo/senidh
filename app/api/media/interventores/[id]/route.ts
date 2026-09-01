import { eq } from "drizzle-orm";
import { db } from "@/db";
import { interventores } from "@/db/schema";
import { privateBlobResponse } from "@/lib/private-blob";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return new Response("No encontrado", { status: 404 });
  const person = (await db.select({ pathname: interventores.photoPathname }).from(interventores).where(eq(interventores.id, id)).limit(1))[0];
  if (!person?.pathname) return new Response("No encontrado", { status: 404 });
  return privateBlobResponse(person.pathname);
}
