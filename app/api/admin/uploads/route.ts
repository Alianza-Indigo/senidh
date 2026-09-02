import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/security";

const uploadRules = {
  "interventor-photo": {
    folder: "interventores",
    allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
    maximumSizeInBytes: 4 * 1024 * 1024
  },
  "content-document": {
    folder: "documentos",
    allowedContentTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
    maximumSizeInBytes: 12 * 1024 * 1024
  }
} as const;

type UploadKind = keyof typeof uploadRules;

export async function POST(request: Request) {
  try {
    const body = await request.json() as HandleUploadBody;
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        await assertSameOrigin();
        const session = await getSession();
        if (!session) throw new Error("No autorizado");

        const kind = clientPayload as UploadKind;
        const rule = uploadRules[kind];
        if (!rule || !pathname.startsWith(`${rule.folder}/`)) throw new Error("Carga no permitida");

        return {
          addRandomSuffix: false,
          allowedContentTypes: [...rule.allowedContentTypes],
          maximumSizeInBytes: rule.maximumSizeInBytes,
          tokenPayload: JSON.stringify({ adminId: session.id, kind })
        };
      },
      onUploadCompleted: async () => undefined
    });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo procesar la carga" }, { status: 400 });
  }
}
