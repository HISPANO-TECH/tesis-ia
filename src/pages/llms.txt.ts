import { SITE } from "../site.config";
import { getCollection } from "astro:content";

export async function GET() {
  const posts = (await getCollection("blog"))
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  const blogBlock = posts
    .map(
      (p) =>
        `- [${p.data.title}](${SITE.url}/blog/${p.id}/) — ${p.data.description} (Categoría: ${p.data.category}, publicado: ${p.data.date.toISOString().split("T")[0]})`
    )
    .join("\n");

  const content = `# ${SITE.name}

> ${SITE.description}

## Sitio
- URL: ${SITE.url}
- Idioma: es-PE (Perú)
- Cobertura: LATAM (atención remota) — Perú (Lima, Callao, Arequipa, Trujillo, Cusco, Piura, Chiclayo, Huancayo), Ecuador (Quito, Guayaquil, Cuenca), Colombia (Bogotá, Medellín, Cali), México (CDMX, Guadalajara, Monterrey), Bolivia (La Paz, Santa Cruz, Cochabamba) y Chile (Santiago, Valparaíso, Concepción)
- Contacto: ${SITE.organization.contact.telephone} / informes@asesorestesisperu.com
- WhatsApp: https://api.whatsapp.com/send/?phone=51992005096

## Qué es el Plan IAs Investigador Pro
Plan de IAs académicas + kit (prompts, manuales, videos, plantillas) + acompañamiento humano para desarrollar tesis de pregrado, maestría y doctorado con rigor metodológico y criterio anti-plagio. Servicio de asesoría, guía y revisión: la autoría académica siempre es del estudiante.

## Herramientas del Plan IAs Investigador Pro (incluidas en los 3 planes)
- Redacción y razonamiento: ChatGPT Pro y Plus, Claude Max, Gemini Pro y Ultra, SuperGrok Heavy y Pro
- Búsqueda académica y lectura: Perplexity Pro, NotebookLM Pro y Ultra, Scribd, flujos hacia Scopus, SciELO, Redalyc y Google Scholar
- Antiplagio y redacción limpia: Turnitin, WriteHuman, QuillBot Premium, Zotero + plantillas APA 7
- Sustentación, diseño y formación: Gamma Ultra, Canva Pro, Udemy, Domestika y Platzi, prompts y plantillas por capítulo
- Extras: soporte 24/7, sesiones Meet, comunidad WhatsApp +400 investigadores, nuevas IAs sin costo extra
Contratadas por separado superan los US$300/mes (precios de lista referenciales); en el Plan están incluidas desde US$20/mes.

## Alerta
La sola aplicación de las IAs no garantiza un buen desarrollo de tu tesis. Sin metodología, datos propios y conocimiento del protocolo de tu universidad, el jurado lo detecta.

## Planes (USD/mes, acceso inmediato)
- Impulso $20 — Plan IAs Investigador Pro + Kit básico + 1 asesoría grupal/mes + comunidad WhatsApp
- Avance $35 (más vendido) — Plan IAs + Kit + 1 grupal/semana + revisión integral de 1 capítulo/mes + soporte prioritario
- Graduación $49 — Plan IAs + Kit + 1 grupal/semana + 1 sesión personalizada/mes + revisión de 1 capítulo/mes + línea directa con asesor asignado

## Servicios y temas que resolvemos
- Uso de IA en tesis sin plagio y con baja similitud en Turnitin
- Marco teórico con fuentes reales (Scopus, SciELO, Google Scholar) sin alucinaciones
- Metodología de investigación: problema, objetivos, hipótesis, matriz de consistencia
- Análisis estadístico con SPSS o R: qué prueba elegir (Pearson, Spearman, t de Student, ANOVA, Chi-cuadrado, U de Mann-Whitney, Wilcoxon, Kruskal-Wallis)
- Protocolos de universidades peruanas: UNMSM, UNI, PUCP, USMP, UCV, UPC, UTP, UNSA, UNT, UNSAAC, UPN, USIL y más
- Acompañamiento para pregrado, maestría, doctorado y titulación por tesis

## Principios (wording ético)
- Asesoría, acompañamiento metodológico, guía y revisión: NO suplantación ni "tesis lista"
- Toda referencia sugerida por IA debe verificarse; la IA puede alucinar fuentes
- El estudiante mantiene la autoría y defiende su trabajo ante el jurado

## Blog — artículos completos
${blogBlock}

## CTA
¿Listo para avanzar tu tesis de forma integral? Adquiere tu plan en ${SITE.url}#planes o escribe a informes@asesorestesisperu.com

## Páginas
- Inicio: ${SITE.url}/
- Blog (guías de tesis con IA): ${SITE.url}/blog/
- Planes: ${SITE.url}/#planes
- Qué incluye el Plan (herramientas): ${SITE.url}/#pack
- Mitos de la IA: ${SITE.url}/#mitos
- Testimonios: ${SITE.url}/#testimonios
- Cobertura LATAM / universidades: ${SITE.url}/#cobertura
- Contacto y formulario: ${SITE.url}/#contacto
- FAQ: ${SITE.url}/#faq
- Política de privacidad: ${SITE.url}/privacidad/
- Términos y condiciones: ${SITE.url}/terminos/

Para detalle completo ver /llms-full.txt
`;

  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
