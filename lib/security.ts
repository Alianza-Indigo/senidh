import { createHash, randomBytes } from "crypto";
import { headers } from "next/headers";

export async function assertSameOrigin() {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  if (!origin || !host) return;
  const originHost = new URL(origin).host;
  if (originHost !== host) throw new Error("Origen de solicitud no válido");
}

export async function requestIpHash() {
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return createHash("sha256").update(ip).digest("hex");
}

export function verificationCode() {
  return randomBytes(16).toString("hex").toUpperCase();
}

export function safeRedirect(value: FormDataEntryValue | null, fallback: string) {
  const path = typeof value === "string" ? value : "";
  return path.startsWith("/") && !path.startsWith("//") ? path : fallback;
}
