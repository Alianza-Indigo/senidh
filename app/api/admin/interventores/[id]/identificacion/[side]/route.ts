import { eq } from "drizzle-orm";
import { issueSignedToken, presignUrl } from "@vercel/blob";
import { db } from "@/db";
import { interventores } from "@/db/schema";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string; side: string }> }) {
  const session = await getSession();
  if (!session) return new Response("No autorizado", { status: 401 });

  const { id: rawId, side } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1 || (side !== "frente" && side !== "reverso")) {
    return new Response("No encontrado", { status: 404 });
  }

  const person = (await db.select({
    front: interventores.voterIdFrontPathname,
    back: interventores.voterIdBackPathname
  }).from(interventores).where(eq(interventores.id, id)).limit(1))[0];
  const pathname = side === "frente" ? person?.front : person?.back;
  if (!pathname) return new Response("Archivo no encontrado", { status: 404 });

  const validUntil = Date.now() + 60_000;
  const signedToken = await issueSignedToken({
    pathname,
    operations: ["get"],
    validUntil
  });
  const { presignedUrl } = await presignUrl(signedToken, {
    access: "private",
    operation: "get",
    pathname,
    validUntil
  });

  return new Response(null, {
    status: 302,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      Location: presignedUrl
    }
  });
}
