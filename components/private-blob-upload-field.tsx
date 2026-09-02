"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";

type UploadKind = "interventor-photo" | "content-document";

type Props = {
  accept: string;
  fieldName: string;
  hasExisting?: boolean;
  help: string;
  kind: UploadKind;
  label: string;
  maxBytes: number;
};

const folders: Record<UploadKind, string> = {
  "interventor-photo": "interventores",
  "content-document": "documentos"
};

export function PrivateBlobUploadField({ accept, fieldName, hasExisting = false, help, kind, label, maxBytes }: Props) {
  const [pathname, setPathname] = useState("");
  const [message, setMessage] = useState(hasExisting ? "Archivo actual conservado." : "");
  const [uploading, setUploading] = useState(false);

  async function selectFile(file: File | undefined, form: HTMLFormElement | null) {
    setPathname("");
    if (!file) {
      setMessage(hasExisting ? "Archivo actual conservado." : "");
      return;
    }
    if (file.size > maxBytes) {
      setMessage(`El archivo excede el límite de ${Math.round(maxBytes / 1024 / 1024)} MB.`);
      return;
    }

    setUploading(true);
    form?.querySelectorAll<HTMLButtonElement>('button[type="submit"]').forEach(button => { button.disabled = true; });
    setMessage("Subiendo 0 %…");
    try {
      const extension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "bin";
      const blob = await upload(`${folders[kind]}/${crypto.randomUUID()}.${extension}`, file, {
        access: "private",
        clientPayload: kind,
        contentType: file.type,
        handleUploadUrl: "/api/admin/uploads",
        multipart: file.size > 5 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => setMessage(`Subiendo ${Math.round(percentage)} %…`)
      });
      setPathname(blob.pathname);
      setMessage("Archivo cargado. Guarde el formulario para aplicar los cambios.");
    } catch {
      setMessage("No se pudo cargar el archivo. Intente nuevamente.");
    } finally {
      setUploading(false);
      form?.querySelectorAll<HTMLButtonElement>('button[type="submit"]').forEach(button => { button.disabled = false; });
    }
  }

  return <label>{label}
    <input
      accept={accept}
      disabled={uploading}
      type="file"
      onChange={event => void selectFile(event.currentTarget.files?.[0], event.currentTarget.form)}
    />
    <input name={fieldName} type="hidden" value={pathname}/>
    <small>{message || help}</small>
  </label>;
}
