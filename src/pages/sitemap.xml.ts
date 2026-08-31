import { SITE } from "../site.config";
import { getCollection } from "astro:content";

export async function GET() {
  const posts = await getCollection("blog");
  const blogUrls = posts.filter((p) => !p.data.draft).map((p) => ({
    loc: `${SITE.url}/blog/${p.id}`,
    lastmod: p.data.date.toISOString().split("T")[0],
    changefreq: "monthly",
    priority: "0.7",
  }));
  const pages = [
    { loc: `${SITE.url}/`, lastmod: new Date().toISOString().split("T")[0], changefreq: "weekly", priority: "1.0" },
    { loc: `${SITE.url}/blog`, lastmod: new Date().toISOString().split("T")[0], changefreq: "weekly", priority: "0.9" },
    { loc: `${SITE.url}/#planes`, lastmod: new Date().toISOString().split("T")[0], changefreq: "weekly", priority: "0.9" },
    { loc: `${SITE.url}/#mitos`, lastmod: new Date().toISOString().split("T")[0], changefreq: "monthly", priority: "0.8" },
    { loc: `${SITE.url}/#testimonios`, lastmod: new Date().toISOString().split("T")[0], changefreq: "monthly", priority: "0.7" },
    { loc: `${SITE.url}/#blog`, lastmod: new Date().toISOString().split("T")[0], changefreq: "weekly", priority: "0.8" },
    { loc: `${SITE.url}/#cobertura`, lastmod: new Date().toISOString().split("T")[0], changefreq: "monthly", priority: "0.7" },
    { loc: `${SITE.url}/#contacto`, lastmod: new Date().toISOString().split("T")[0], changefreq: "monthly", priority: "0.7" },
    { loc: `${SITE.url}/#faq`, lastmod: new Date().toISOString().split("T")[0], changefreq: "monthly", priority: "0.7" },
    { loc: `${SITE.url}/privacidad`, lastmod: new Date().toISOString().split("T")[0], changefreq: "yearly", priority: "0.3" },
    { loc: `${SITE.url}/terminos`, lastmod: new Date().toISOString().split("T")[0], changefreq: "yearly", priority: "0.3" },
    ...blogUrls,
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${p.loc}</loc><lastmod>${p.lastmod}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
