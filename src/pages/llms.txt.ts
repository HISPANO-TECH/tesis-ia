import { SITE } from "../site.config";

export async function GET() {
  const content = `# ${SITE.name}

> ${SITE.description}

## Sitio
- URL: ${SITE.url}
- Idioma: es-PE
- Contacto: ${SITE.organization.contact.telephone} / informes@asesorestesisperu.com

## Qué es el Pack IAs Investigador Pro
Pack de IAs académicas + kit (prompts, manuales, videos, plantillas) + acompañamiento humano para desarrollar tesis de pregrado, maestría y doctorado con rigor metodológico y criterio anti-plagio.

## Alerta
La sola aplicación de las IAs no garantiza un buen desarrollo de tu tesis. Sin metodología, datos propios y conocimiento del protocolo de tu universidad, el jurado lo detecta.

## Planes
- Impulso — US$20/mes — Pack IAs + kit + 1 grupal/mes + comunidad WhatsApp
- Avance (más vendido) — US$35/mes — Pack IAs + kit + 1 grupal/semana + revisión 1 capítulo/mes + soporte prioritario
- Graduación — US$49/mes — Pack IAs + kit + 1 grupal/semana + 1 individual/mes + revisión 1 capítulo/mes + línea directa

## Mitos clave (resumen)
- IA no escribe tu tesis sola sin datos propios
- IA no conoce tu protocolo universitario sin humano
- Turnitin se reduce con parafraseo + humanización + referencias propias
- IAs gratuitas alucinan; se necesitan IAs con Scopus y bases académicas
- Marco teórico requiere estructura y fuentes reales proporcionadas por ti

## CTA
¿Listo para avanzar tu tesis de forma integral? Adquiere tu plan en ${SITE.url}#planes o WhatsApp +51 927 580 985 (https://api.whatsapp.com/send/?phone=51927580985)

## Páginas
- Inicio: ${SITE.url}/
- Planes: ${SITE.url}/#planes
- Mitos: ${SITE.url}/#mitos
- FAQ: ${SITE.url}/#faq

Para detalle completo ver /llms-full.txt
`;

  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
