import { SITE } from "../site.config";
import { getCollection } from "astro:content";

export async function GET() {
  const today = new Date().toISOString().split("T")[0];

  const posts = await getCollection("blog");
  const blogUrls = posts
    .filter((p) => !p.data.draft)
    .map((p) => ({
      loc: `${SITE.url}/blog/${p.id}/`,
      lastmod: (p.data.updated ?? p.data.date).toISOString().split("T")[0],
      changefreq: "monthly" as const,
      priority: "0.7",
    }))
    .sort((a, b) => (a.lastmod < b.lastmod ? 1 : -1));

  // Solo URLs reales indexables (las anclas # no son válidas en sitemap)
  const pages = [
    { loc: `${SITE.url}/`, lastmod: today, changefreq: "weekly" as const, priority: "1.0" },
    { loc: `${SITE.url}/blog/`, lastmod: today, changefreq: "weekly" as const, priority: "0.9" },
    { loc: `${SITE.url}/privacidad/`, lastmod: today, changefreq: "yearly" as const, priority: "0.3" },
    { loc: `${SITE.url}/terminos/`, lastmod: today, changefreq: "yearly" as const, priority: "0.3" },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${[...pages, ...blogUrls].map((p) => `  <url><loc>${p.loc}</loc><lastmod>${p.lastmod}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
