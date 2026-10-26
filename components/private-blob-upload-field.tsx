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

const MAX_PHOTO_WIDTH = 1200;
const MAX_PHOTO_HEIGHT = 1500;
const MAX_ORIGINAL_PHOTO_BYTES = 25 * 1024 * 1024;

async function optimizePhoto(file: File) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_PHOTO_WIDTH / bitmap.width, MAX_PHOTO_HEIGHT / bitmap.height);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
      bitmap.close();
      return file;
    }
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/webp", 0.82));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "fotografia"}.webp`, { type: "image/webp", lastModified: file.lastModified });
  } catch {
    return file;
  }
}

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
    if (kind === "interventor-photo" && file.size > MAX_ORIGINAL_PHOTO_BYTES) {
      setMessage("La fotografía original excede el límite de 25 MB.");
      return;
    }
    if (kind !== "interventor-photo" && file.size > maxBytes) {
      setMessage(`El archivo excede el límite de ${Math.round(maxBytes / 1024 / 1024)} MB.`);
      return;
    }

    setUploading(true);
    form?.querySelectorAll<HTMLButtonElement>('button[type="submit"]').forEach(button => { button.disabled = true; });
    setMessage(kind === "interventor-photo" ? "Optimizando fotografía…" : "Subiendo 0 %…");
    try {
      const uploadFile = kind === "interventor-photo" ? await optimizePhoto(file) : file;
      if (uploadFile.size > maxBytes) {
        setMessage(`No fue posible reducir el archivo por debajo de ${Math.round(maxBytes / 1024 / 1024)} MB. Use una fotografía JPG, PNG o WebP de menor tamaño.`);
        return;
      }
      const extension = uploadFile.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "bin";
      setMessage("Subiendo 0 %…");
      const blob = await upload(`${folders[kind]}/${crypto.randomUUID()}.${extension}`, uploadFile, {
        access: "private",
        clientPayload: kind,
        contentType: uploadFile.type,
        handleUploadUrl: "/api/admin/uploads",
        multipart: uploadFile.size > 5 * 1024 * 1024,
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
