import type { MetadataRoute } from "next";
import { getApprovedLibraries } from "@/lib/data";

function base() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.crlibraries.info").replace(/\/$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const libraries = await getApprovedLibraries().catch(() => []);

  return [
    { url: base(), changeFrequency: "weekly", priority: 1 },
    { url: `${base()}/map`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base()}/libraries`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base()}/leaderboard`, changeFrequency: "weekly", priority: 0.4 },
    { url: `${base()}/submit`, changeFrequency: "monthly", priority: 0.4 },
    ...libraries.map((l) => ({
      url: `${base()}/library/${l.id}`,
      lastModified: new Date(l.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
