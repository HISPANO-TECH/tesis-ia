// Fuente única de los planes: la usan PlanesSection y el modal de promoción
// del Pack, para que los precios y beneficios no se dupliquen ni se desincronicen.

export const WHATSAPP_PHONE = "51992005096";

const WA_BASE = `https://api.whatsapp.com/send/?phone=${WHATSAPP_PHONE}&text=`;
const WA_SUFFIX = "&type=phone_number&app_absent=0";

export function waLink(text: string) {
  return WA_BASE + encodeURIComponent(text) + WA_SUFFIX;
}

export function waPlan(plan: string) {
  return waLink(
    `Hola, quiero contactarme para recibir información sobre asesoría en tesis universitaria en Perú. Vengo de tesis-ia.com y quiero el plan ${plan} del Pack IAs Investigador Pro. ¿Cómo adquiero mi acceso?`
  );
}

export interface PlanFeature {
  label: string;
  value: string;
  muted?: boolean;
}

export interface Plan {
  name: string;
  subtitle: string;
  price: string;
  badge: string | null;
  resumen: string;
  features: PlanFeature[];
  cta: string;
}

export const PLANES: Plan[] = [
  {
    name: "IMPULSO",
    subtitle: "Recién empieza su tesis",
    price: "20",
    badge: null,
    // Resumen corto para el modal (una línea por plan)
    resumen: "Pack de IAs + kit metodológico + 1 asesoría grupal al mes.",
    features: [
      { label: "Acceso a IAs", value: "Pack IAs Investigador Pro" },
      { label: "Plantillas y manuales", value: "Kit básico (Prompts, manuales, videos, plantillas)" },
      { label: "Asesoría grupal", value: "1 sesión grupal / mes" },
      { label: "Asesoría individual", value: "—", muted: true },
      { label: "Revisión de capítulos", value: "—", muted: true },
      { label: "Soporte", value: "Comunidad WhatsApp" },
    ],
    cta: "Empezar con Impulso",
  },
  {
    name: "AVANCE",
    subtitle: "Tiene avance, quiere terminar más rápido",
    price: "35",
    badge: "Más vendido",
    resumen: "Todo lo anterior + grupales semanales y revisión de 1 capítulo al mes.",
    features: [
      { label: "Acceso a IAs", value: "Pack IAs Investigador Pro" },
      { label: "Plantillas y manuales", value: "Kit básico (Prompts, manuales, videos, plantillas)" },
      { label: "Asesoría grupal", value: "1 sesión grupal / semanal" },
      { label: "Asesoría individual", value: "—", muted: true },
      { label: "Revisión de capítulos", value: "Revisión integral de 1 capítulo/mes con feedback" },
      { label: "Soporte", value: "Comunidad + prioridad" },
    ],
    cta: "Elegir Avance",
  },
  {
    name: "GRADUACIÓN",
    subtitle: "Quiere sustentar cuanto antes",
    price: "49",
    badge: "Asesoría 1:1",
    resumen: "Todo lo anterior + 1 sesión personalizada al mes y línea directa con tu asesor.",
    features: [
      { label: "Acceso a IAs", value: "Pack IAs Investigador Pro" },
      { label: "Plantillas y manuales", value: "Kit básico (Prompts, manuales, videos, plantillas)" },
      { label: "Asesoría grupal", value: "1 sesión grupal / semanal" },
      { label: "Asesoría individual", value: "1 sesión personalizada / mes" },
      { label: "Revisión de capítulos", value: "Revisión integral de 1 capítulo/mes con feedback" },
      { label: "Soporte", value: "Línea directa con asesor asignado" },
    ],
    cta: "Ir por Graduación",
  },
];
