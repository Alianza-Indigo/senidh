import { eq } from "drizzle-orm";
import { get, put } from "@vercel/blob";
import sharp from "sharp";
import { db } from "@/db";
import { interventores } from "@/db/schema";
import { showInterventorPhotos } from "@/lib/features";
import { interventorPhotoVersion, type InterventorPhotoVariant } from "@/lib/interventor-photo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const variants: Record<InterventorPhotoVariant, { width: number; height: number; quality: number }> = {
  directory: { width: 276, height: 324, quality: 74 },
  profile: { width: 480, height: 570, quality: 78 },
  credential: { width: 300, height: 372, quality: 82 }
};

function isVariant(value: string | null): value is InterventorPhotoVariant {
  return value === "directory" || value === "profile" || value === "credential";
}

function imageResponse(body: BodyInit, size: number, id: number, version: string, variant: InterventorPhotoVariant) {
  const headers = new Headers({
    "Content-Type": "image/webp",
    "Content-Length": String(size),
    "Cache-Control": "public, max-age=31536000, immutable",
    "CDN-Cache-Control": "public, max-age=31536000, immutable",
    "ETag": `W/\"${id}-${version}-${variant}\"`,
    "X-Content-Type-Options": "nosniff"
  });
  return new Response(body, { status: 200, headers });
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!showInterventorPhotos()) return new Response("No encontrado", { status: 404 });
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return new Response("No encontrado", { status: 404 });

  const url = new URL(request.url);
  const requestedVariant = url.searchParams.get("variant");
  const variant: InterventorPhotoVariant = isVariant(requestedVariant) ? requestedVariant : "profile";
  const person = (await db.select({ pathname: interventores.photoPathname, updatedAt: interventores.updatedAt }).from(interventores).where(eq(interventores.id, id)).limit(1))[0];
  if (!person?.pathname) return new Response("No encontrado", { status: 404 });

  const version = interventorPhotoVersion(person.updatedAt);
  if (url.searchParams.get("v") !== version || requestedVariant !== variant) {
    url.searchParams.set("variant", variant);
    url.searchParams.set("v", version);
    return Response.redirect(url, 307);
  }

  const optimizedPathname = `interventores-optimized/${id}/${version}-${variant}.webp`;
  const optimized = await get(optimizedPathname, { access: "private" });
  if (optimized?.statusCode === 200) return imageResponse(optimized.stream, optimized.blob.size, id, version, variant);

  const result = await get(person.pathname, { access: "private" });
  if (!result || result.statusCode !== 200) return new Response("Archivo no encontrado", { status: 404 });

  const source = Buffer.from(await new Response(result.stream).arrayBuffer());
  const settings = variants[variant];
  const image = await sharp(source)
    .rotate()
    .resize(settings.width, settings.height, { fit: "cover", position: "attention", withoutEnlargement: true })
    .webp({ quality: settings.quality, effort: 4 })
    .toBuffer();

  await put(optimizedPathname, image, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "image/webp"
  });
  return imageResponse(image, image.byteLength, id, version, variant);
}
