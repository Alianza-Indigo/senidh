import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { interventores } from "@/db/schema";

export const dynamic = "force-dynamic";

const publicUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://senidh.org";

const pages = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/directorio", changeFrequency: "daily", priority: 0.9 },
  { path: "/identificaciones", changeFrequency: "weekly", priority: 0.9 },
  { path: "/eventos", changeFrequency: "weekly", priority: 0.8 },
  { path: "/convenios", changeFrequency: "monthly", priority: 0.8 },
  { path: "/oficios", changeFrequency: "weekly", priority: 0.8 },
  { path: "/reconocimientos", changeFrequency: "monthly", priority: 0.7 },
  { path: "/donaciones", changeFrequency: "monthly", priority: 0.7 },
  { path: "/donar", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contacto", changeFrequency: "monthly", priority: 0.7 }
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = pages.map(page => ({ url: `${publicUrl}${page.path}`, changeFrequency: page.changeFrequency, priority: page.priority }));
  try {
    const members = await db.select({ verificationHash: interventores.verificationHash, updatedAt: interventores.updatedAt }).from(interventores).where(eq(interventores.allowGoogleIndexing, true));
    return [...staticPages, ...members.map(member => ({ url: `${publicUrl}/directorio?credencial=${encodeURIComponent(member.verificationHash)}`, lastModified: member.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 }))];
  } catch {
    return staticPages;
  }
}
