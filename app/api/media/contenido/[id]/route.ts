import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { contentItems } from "@/db/schema";
import { privateBlobResponse } from "@/lib/private-blob";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return new Response("No encontrado", { status: 404 });
  const item = (await db.select({ pathname: contentItems.filePathname }).from(contentItems).where(and(eq(contentItems.id, id), eq(contentItems.isPublished, true))).limit(1))[0];
  if (!item?.pathname) return new Response("No encontrado", { status: 404 });
  return privateBlobResponse(item.pathname);
}
