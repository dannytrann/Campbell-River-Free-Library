import type { MetadataRoute } from "next";

const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.crlibraries.info").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/review", "/api/", "/profile"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
