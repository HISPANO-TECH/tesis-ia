// Fuente única del contenido del Plan IAs Investigador Pro: la usan el Hero
// (tarjeta lateral) y la sección #pack, para que la lista de IAs no se duplique
// ni se desincronice entre secciones.

export interface PackCategoria {
  /** Etiqueta corta de la categoría (REDACCIÓN, INVESTIGA, …) */
  cat: string;
  /** Título largo para la sección #pack */
  titulo: string;
  icon: string;
  /** Nombres de las IAs: se resaltan uno a uno, no como texto corrido */
  ias: string[];
}

export const PACK_CATEGORIAS: PackCategoria[] = [
  {
    cat: "Redacción",
    titulo: "Redacción y razonamiento",
    icon: "lucide:pen-line",
    ias: ["Claude Max", "ChatGPT Pro", "ChatGPT Plus", "SuperGrok", "Gemini"],
  },
  {
    cat: "Investiga",
    titulo: "Búsqueda académica y lectura",
    icon: "lucide:search-check",
    ias: ["Perplexity Pro", "NotebookLM Pro", "Scribd"],
  },
  {
    cat: "Humaniza",
    titulo: "Humanización y parafraseo",
    icon: "lucide:wand",
    ias: ["WriteHuman", "QuillBot Premium"],
  },
  {
    cat: "Detecta",
    titulo: "Antiplagio y detección de IA",
    icon: "lucide:shield-check",
    ias: ["Turnitin ilimitado (similitud + IA)"],
  },
  {
    cat: "Sustenta",
    titulo: "Sustentación y formación",
    icon: "lucide:graduation-cap",
    ias: ["Canva Pro", "Cursos Udemy", "Cursos Platzi"],
  },
];

/**
 * Cifra comercial de accesos del Plan. Es una etiqueta de marketing, no el
 * largo de PACK_CATEGORIAS: algunas entradas agrupan más de una herramienta
 * (Turnitin similitud + IA, los cursos) y el Plan suma IAs nuevas sin costo.
 */
export const IAS_LABEL = "15+";

/** Beneficios principales del Plan: lo que el tesista se lleva, no la marca. */
export const PACK_BENEFICIOS = [
  {
    titulo: "Fuentes que sí existen",
    desc: "Cada referencia con enlace y DOI comprobable desde Scopus, SciELO, Redalyc y Scholar.",
    icon: "lucide:link",
  },
  {
    titulo: "Capítulos que avanzan",
    desc: "Borradores, corrección de estilo y discusión de resultados con versiones de pago, sin límites.",
    icon: "lucide:file-text",
  },
  {
    titulo: "Similitud bajo control",
    desc: "Turnitin ilimitado + humanización y parafraseo antes de que tu universidad revise.",
    icon: "lucide:shield-check",
  },
  {
    titulo: "Listo para sustentar",
    desc: "Diapositivas, figuras y tablas, más cursos y formación continua incluidos.",
    icon: "lucide:presentation",
  },
  {
    titulo: "Kit metodológico propio",
    desc: "Prompts por capítulo, manuales, videos y plantillas con el criterio que el jurado espera.",
    icon: "lucide:list-checks",
  },
  {
    titulo: "Asesor humano y soporte",
    desc: "Acompañamiento real, sesiones Meet, comunidad de +400 investigadores y soporte 24/7.",
    icon: "lucide:users",
  },
];
