import type { Interventor } from "@/db/schema";

export function publicStatus(person: Interventor) {
  if (person.status !== "activa") return person.status === "revocada" ? { label: "Revocada", tone: "danger" } : { label: "Suspendida", tone: "warning" };
  if (new Date(`${person.expiresAt}T23:59:59`) < new Date()) return { label: "Vencida", tone: "muted" };
  return { label: "Vigente", tone: "success" };
}

export function siteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return configured || (vercel ? `https://${vercel}` : "http://localhost:3000");
}
