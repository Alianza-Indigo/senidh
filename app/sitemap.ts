import type { MetadataRoute } from "next";

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

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map(page => ({
    url: `${publicUrl}${page.path}`,
    changeFrequency: page.changeFrequency,
    priority: page.priority
  }));
}
