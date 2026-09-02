import type { MetadataRoute } from "next";

const publicUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://senidh.org";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"]
    },
    sitemap: `${publicUrl}/sitemap.xml`,
    host: publicUrl
  };
}
