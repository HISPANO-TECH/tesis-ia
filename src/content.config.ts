import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    // Fecha de última revisión: alimenta dateModified (Article) y el sitemap.
    updated: z.coerce.date().optional(),
    author: z.string().default("Tesis IA"),
    category: z.string().default("Tesis"),
    tags: z.array(z.string()).default([]),
    // Keywords long-tail del artículo (meta keywords + señal temática interna).
    keywords: z.array(z.string()).default([]),
    // Preguntas frecuentes del artículo -> bloque visible + FAQPage JSON-LD.
    faq: z
      .array(z.object({ q: z.string(), a: z.string() }))
      .default([]),
    // Slugs de artículos relacionados (enlazado interno manual, con prioridad).
    related: z.array(z.string()).default([]),
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
