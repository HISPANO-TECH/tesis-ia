# Estructura de componentes — tesis-ia.com

Escalable y mantenible. Separa por dominio:

```
src/components/
├── layout/          # Navbar, Footer (usados en Layout.astro)
│   ├── Navbar.astro
│   ├── Footer.astro
│   └── index.ts
├── sections/        # Secciones de landing (una por archivo)
│   ├── Hero.astro
│   ├── AlertSection.astro
│   ├── MitosSection.astro
│   ├── PlanesSection.astro
│   ├── TestimoniosSection.astro
│   ├── SeoPeruSection.astro  # SEO nacional Perú/regiones/universidades
│   ├── BlogSection.astro
│   ├── FormSection.astro
│   ├── CtaSection.astro
│   ├── FaqSection.astro
│   └── index.ts
├── ui/              # UI reutilizable
│   ├── WhatsAppFloat.astro
│   └── index.ts
└── index.ts         # Barrel global
```

**Uso:**
```astro
// Antes (plano)
import Navbar from "../components/Navbar.astro"

// Ahora (escalable)
import Navbar from "../components/layout/Navbar.astro"
// o
import { Navbar, Footer } from "../components/layout"
// o
import { Hero, PlanesSection } from "../components/sections"
```

**Convenciones:**
- `layout` → solo usado en `src/layouts/Layout.astro`
- `sections` → cada sección con `id` para anclas `/#alerta`, `/#planes`, etc.
- `ui` → elementos flotantes, botones, etc.
- `utils/whatsapp.ts` → centraliza links de WhatsApp (DRY)
- `config/index.ts` → re-export de `site.config.ts` para `import { SITE } from "@/config"`
