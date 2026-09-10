# Tesis IA — Pack IAs Investigador Pro

Web en Astro para **https://tesis-ia.com** con el esquema PACK IAs INVESTIGADOR PRO.

## Stack
- Astro 7 + Tailwind CSS 4 + astro-icon + lucide (@iconify-json/lucide)
- Diseño azul profundo `#0B1D3A` + dorado `amber-400`, tipografía `Space Grotesk` + `Inter` (diferenciado de BeSocial)
- Navbar extendido `max-w-[1440px]` `h-[84px]` con `px-5 py-2.5` uppercase, selección dorada `::selection`
- Componentes en `src/components/layout/`, `sections/`, `ui/` + `src/utils/whatsapp.ts` + `src/content/blog/` (6 posts)

## Secciones
- Hero: Pack IAs Investigador Pro + mock workspace
- Alerta: “La sola aplicación de las IAs no garantiza...”
- Mitos (10 mitos con `lucide` + check dorado)
- Planes: Impulso $20 / Avance $35 (badge Más vendido visible) / Graduación $49
- Testimonios (6 cards con `lucide:star`)
- Blog (parallax + shine mouse, 6 artículos con `image` Unsplash)
- SeoPeruSection: cobertura nacional Perú/Lima/regiones + 16 universidades (wording ético)
- FormSection: validación + honeypot, envía a WhatsApp `api.whatsapp.com` y `mailto:informes@asesorestesisperu.com`
- CTA final + FAQ (JSON-LD) + Footer (©2026)
- Páginas: `/blog`, `/blog/[slug]`, `/privacidad`, `/terminos` (parallax + shine)

## SEO / GEO / AEO
- `site.config.ts` con `https://tesis-ia.com`
- `Layout.astro` con meta OG/Twitter, geo, canonical, JSON-LD Organization/WebSite/Product/Breadcrumb
- `public/robots.txt` → Sitemap: https://tesis-ia.com/sitemap.xml
- `src/pages/sitemap.xml.ts` → genera sitemap dinámico
- `src/pages/llms.txt.ts` y `llms-full.txt.ts` → para LLMs

## Comandos (pnpm)
```bash
pnpm install
pnpm dev      # http://localhost:4321
pnpm build    # dist/
pnpm preview
```

## Deploy en Netlify (tesis-ia)

**1. Desde dashboard Netlify (recomendado para monorepo):**
- New site → Import from Git → selecciona repo `Trabajo-BeSocial-HispanoTesis`
- **Base directory:** `tesis-ia`
- **Build command:** `pnpm run build`
- **Publish directory:** `dist`
- **Node version:** `22` (ya en `tesis-ia/netlify.toml` y `.nvmrc`)
- Deploy → luego en Domain settings → Add custom domain `tesis-ia.com` + `www.tesis-ia.com` → activa HTTPS.

**2. Con Netlify CLI (desde `tesis-ia/`):**
```bash
pnpm install -g netlify-cli
netlify login
netlify init   # selecciona Create & configure a new site, base dir: .
netlify deploy --build --prod
# o solo drag & drop de `dist/` en https://app.netlify.com/drop
```

**Config incluida:**
- `tesis-ia/netlify.toml` → `command = "pnpm run build"`, `publish = "dist"`, `NODE_VERSION=22`, `NETLIFY_USE_PNPM=true`
- `tesis-ia/public/_headers` → CSP, HSTS, cache para `/_astro/*` (1 año immutable), permite `https://api.whatsapp.com`, `https://wa.me`, `https://images.unsplash.com`, `https://fonts.gstatic.com`
- `tesis-ia/.nvmrc` → `22.12.0`
- `astro.config.mjs` → `site: 'https://tesis-ia.com'`

**Dominio `tesis-ia.com`:**
- En tu DNS agrega `CNAME @` → `apex-loadbalancer.netlify.com` o `A` según Netlify, y `CNAME www` → `tu-sitio.netlify.app`. Netlify provee HTTPS automático.

## Contacto CTA
Todos los CTA apuntan a WhatsApp `+51 992 005 096` via `https://api.whatsapp.com/send/?phone=51992005096...&type=phone_number&app_absent=0` con mensaje `Vengo de tesis-ia.com` + email `informes@asesorestesisperu.com`.
