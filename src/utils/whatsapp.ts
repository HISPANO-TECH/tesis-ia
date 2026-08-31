// Centraliza el link de WhatsApp para mantenimiento escalable
// Usa api.whatsapp.com con phone 51927580985 y mensaje que alude a tesis-ia.com
export const WHATSAPP_PHONE = "51927580985";
export const WHATSAPP_BASE = `https://api.whatsapp.com/send/?phone=${WHATSAPP_PHONE}`;

const suffix = "&type=phone_number&app_absent=0";

export function waLink(message: string) {
  return `${WHATSAPP_BASE}&text=${encodeURIComponent(message)}${suffix}`;
}

// Mensajes base - wording seguro (asesoría, no suplantación)
export const WA_MESSAGES = {
  general: "Hola, quiero contactarme para recibir información sobre asesoría en tesis universitaria en Perú. Vengo de tesis-ia.com - Pack IAs Investigador Pro",
  generalCorto: "Hola, quiero contactarme para recibir información sobre asesoría en tesis universitaria en Perú. Vengo de tesis-ia.com",
  plan: (plan: string) => `Hola, quiero contactarme para recibir información sobre asesoría en tesis universitaria en Perú. Vengo de tesis-ia.com y quiero el plan ${plan} del Pack IAs Investigador Pro. ¿Cómo adquiero mi acceso?`,
  integral: "Hola, quiero contactarme para recibir información sobre asesoría en tesis universitaria en Perú. Vengo de tesis-ia.com - Pack IAs Investigador Pro y quiero avanzar mi tesis de forma integral",
} as const;

// Links listos
export const WA_LINKS = {
  general: waLink(WA_MESSAGES.general),
  generalCorto: waLink(WA_MESSAGES.generalCorto),
  integral: waLink(WA_MESSAGES.integral),
  plan: (plan: string) => waLink(WA_MESSAGES.plan(plan)),
} as const;
