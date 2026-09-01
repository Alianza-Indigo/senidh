import { get } from "@vercel/blob";

export async function privateBlobResponse(pathname: string) {
  const result = await get(pathname, { access: "private" });
  if (!result) return new Response("Archivo no encontrado", { status: 404 });
  if (result.statusCode === 304) return new Response(null, { status: 304 });

  const headers = new Headers();
  headers.set("Content-Type", result.blob.contentType || "application/octet-stream");
  headers.set("Content-Length", String(result.blob.size));
  headers.set("ETag", result.blob.etag);
  headers.set("Cache-Control", "public, max-age=300, s-maxage=300, stale-while-revalidate=60");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(result.stream, { status: 200, headers });
}
