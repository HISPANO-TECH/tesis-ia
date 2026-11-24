// Campaña "25 Canastas Navideñas" — fuente única de textos y datos de /navidad.
// Lo marcado con POR CONFIRMAR debe validarlo el supervisor antes de publicar
// (ver docs/navidad/Navidad-TesisIA-01-Textos.docx).

export const NAVIDAD = {
  marca: "HispanoTech",
  totalCanastas: 25,

  // El link del grupo de WhatsApp NO va aquí (sería visible en la página): está en
  // public/api/navidad.php (NAV_GRUPO_WHATSAPP) y solo se entrega tras un registro válido.

  // POR CONFIRMAR: fechas de cierre de inscripciones y del sorteo (hora Perú, UTC-5).
  cierreInscripciones: "2026-12-14T23:59:00-05:00",
  fechaSorteo: "2026-12-16T20:00:00-05:00",
  cierreTexto: "14 de diciembre de 2026, 11:59 p. m.",
  sorteoTexto: "16 de diciembre de 2026, 8:00 p. m. (hora de Perú)",
  // POR CONFIRMAR: canal de la transmisión en vivo del sorteo.
  canalSorteo: "en vivo por Facebook y TikTok de HispanoTech",
} as const;

export const NAVIDAD_HERO = {
  eyebrow: "Campaña navideña 2026 · HispanoTech",
  titulo: "25 Canastas Navideñas",
  subtitulo: "¡Esta Navidad, HispanoTech premia tu esfuerzo académico!",
  texto:
    "Participa en el sorteo de 25 canastas navideñas y forma parte de nuestra comunidad de estudiantes, egresados y profesionales que quieren llevar sus investigaciones al siguiente nivel.",
  chips: ["25 ganadores", "Inscripción gratuita", "Sorteo en vivo"],
  ctaPrincipal: "Quiero participar",
  ctaSecundario: "Unirme al grupo de WhatsApp", // lleva al formulario
};

// Contenido referencial de cada canasta (POR CONFIRMAR con el proveedor).
export const NAVIDAD_CANASTA = [
  { icon: "lucide:cake-slice", titulo: "Panetón", texto: "El clásico infaltable de la mesa navideña peruana." },
  { icon: "lucide:coffee", titulo: "Chocolate para taza", texto: "Para la chocolatada en familia." },
  { icon: "lucide:candy", titulo: "Chocolates y bombones", texto: "Una selección dulce para compartir." },
  { icon: "lucide:gift", titulo: "Detalles navideños", texto: "Galletas, golosinas y adornos de temporada." },
];

export const NAVIDAD_PASOS = [
  {
    icon: "lucide:clipboard-list",
    titulo: "Completa el formulario",
    texto: "Datos personales, tu situación académica y el estado de tu tesis. Te toma 2 minutos.",
  },
  {
    icon: "lucide:message-circle",
    titulo: "Únete al grupo de WhatsApp",
    texto: "Es parte de la participación: ahí anunciamos el sorteo, los ganadores y contenido académico gratuito.",
  },
  {
    icon: "lucide:ticket",
    titulo: "Recibe tu código",
    texto: "Al inscribirte obtienes un código de participación único. Guárdalo: con él se identifica a los ganadores.",
  },
  {
    icon: "lucide:radio",
    titulo: "Mira el sorteo en vivo",
    texto: "Sorteamos las 25 canastas de forma pública y transparente. ¡Mucha suerte!",
  },
];

export const NAVIDAD_COMUNIDAD = {
  titulo: "Más que un sorteo: una comunidad que investiga contigo",
  texto:
    "HispanoTech es una plataforma tecnológica de investigación académica. Reunimos a estudiantes, egresados y profesionales que quieren desarrollar su tesis y sus investigaciones con método, inteligencia artificial y acompañamiento real.",
  beneficios: [
    "Tips de metodología de investigación y redacción académica",
    "Herramientas de inteligencia artificial aplicadas a tu tesis",
    "Talleres y capacitaciones gratuitas para la comunidad",
    "Avisos de cursos y asesorías durante 2027",
  ],
};

// ---- Formulario (según la propuesta aprobada en las capturas) ----
export const FORM_TITULO = "Participa por una de las 25 canastas navideñas de HispanoTech";

export const ETAPAS = [
  "Octavo ciclo",
  "Noveno ciclo",
  "Décimo ciclo",
  "Egresado",
  "Bachiller",
  "Titulado",
  "Estudiante de maestría",
  "Egresado de maestría",
  "Estudiante de doctorado",
  "Otro",
];

export const CARRERAS_EJEMPLO = [
  "Ingeniería Civil",
  "Ingeniería de Sistemas",
  "Ingeniería Industrial",
  "Derecho",
  "Medicina",
  "Administración",
  "Psicología",
  "Educación",
  "Enfermería",
  "Contabilidad",
];

export const SITUACION_TESIS = [
  "Todavía no tengo tema de tesis.",
  "Tengo un tema, pero todavía no tengo avances.",
  "Tengo un tema y algunos avances de investigación.",
  "Tengo mi plan o proyecto de tesis elaborado.",
  "Tengo mi plan de tesis aprobado y estoy desarrollando la investigación.",
  "Estoy desarrollando el informe final de tesis.",
  "Tengo el informe terminado y estoy pendiente de revisión o sustentación.",
  "Mi tesis fue observada y necesito levantar las observaciones.",
  "Ya terminé mi tesis y quiero publicar un artículo científico.",
  "Todavía no necesito realizar una tesis.",
];

export const APOYOS = [
  "Encontrar un tema de tesis.",
  "Aprender a desarrollar mi tesis con inteligencia artificial.",
  "Aprender metodología de investigación.",
  "Aprender análisis estadístico (SPSS, Stata, R).",
  "Recibir asesoría para terminar mi tesis.",
  "Publicar un artículo científico.",
  "Capacitarme en herramientas de IA para investigación.",
  "Por ahora, solamente deseo participar en el sorteo.",
];

// POR CONFIRMAR: bases legales finales.
export const NAVIDAD_BASES = [
  "La participación es gratuita y está dirigida a personas mayores de 18 años residentes en Perú.",
  `Para participar debes completar el formulario y unirte al grupo de WhatsApp de la comunidad antes del cierre de inscripciones.`,
  "Solo se admite una inscripción por persona (número de WhatsApp y correo únicos). Los registros duplicados o con datos falsos serán anulados.",
  "Se sortearán 25 canastas navideñas; cada participante puede ganar como máximo una canasta.",
  "Los ganadores se anunciarán durante la transmisión en vivo y en el grupo de WhatsApp, y serán contactados al número registrado.",
  "Si un ganador no responde dentro de las 48 horas siguientes al sorteo, se elegirá un ganador suplente.",
  "La entrega se coordinará directamente con cada ganador. El premio no es canjeable por dinero.",
];

export const NAVIDAD_FAQ = [
  {
    q: "¿Tiene algún costo participar?",
    a: "No. La inscripción es 100 % gratuita. Nunca te pediremos pagos ni datos bancarios para entregarte tu canasta.",
  },
  {
    q: "¿Quiénes pueden participar?",
    a: "Estudiantes de los últimos ciclos, egresados, bachilleres, titulados y estudiantes o egresados de maestría y doctorado. Si estás en otra etapa, también puedes participar marcando «Otro».",
  },
  {
    q: "¿Es obligatorio unirme al grupo de WhatsApp?",
    a: "Sí. El ingreso al grupo es parte del proceso de participación: ahí se anuncia el sorteo, se comparten los resultados y se coordina la entrega.",
  },
  {
    q: "¿Cómo sé si gané?",
    a: "Los 25 ganadores se anuncian en la transmisión en vivo y en el grupo de WhatsApp. Además te escribiremos al número que registraste, indicando tu código de participación.",
  },
  {
    q: "¿Qué hacen con mis datos?",
    a: "Los usamos para gestionar el sorteo. Solo si lo autorizas expresamente, también te enviaremos información de cursos, herramientas de IA y servicios académicos, conforme a la Ley N.º 29733 de Protección de Datos Personales.",
  },
];

export const NAVIDAD_CIERRE = {
  titulo: "Tu esfuerzo académico merece celebrarse",
  texto: "Inscríbete hoy, únete a la comunidad y participa por una de las 25 canastas navideñas.",
};

// ---- Espacios de video y fotos (los llena marketing) ----
// Para reemplazar: subir el archivo a public/navidad/ y cambiar la ruta aquí.
export const NAVIDAD_MEDIA = {
  // POR REEMPLAZAR: video del banner que entregará marketing (1920x1080, MP4 H.264, sin audio, ≤ 4 MB).
  // Mientras sea null, el banner muestra la imagen de fondo (bannerPoster).
  bannerVideo: null as string | null,
  bannerVideoMovil: null as string | null, // opcional 1080x1920
  bannerPoster: "/navidad/hero-poster.webp",
  // POR REEMPLAZAR: video vertical de "Cómo participar" (1080x1920, MP4 H.264, con audio, ≤ 15 MB).
  comoParticiparVideo: "/navidad/como-participar.mp4",
  comoParticiparPoster: "/navidad/como-participar-poster.webp",
  // Fondo animado 3D (Blender) del CTA final.
  ctaVideoMp4: "/navidad/hero-navidad.mp4",
  ctaVideoWebm: "/navidad/hero-navidad.webm",
  ctaPoster: "/navidad/hero-poster.webp",
};

// POR REEMPLAZAR: fotos reales de las canastas (1080x1350 px, 4:5, WebP/JPG ≤ 200 KB).
// Hoy son renders 3D referenciales. Se pueden agregar o quitar cards libremente.
export const NAVIDAD_GALERIA = [
  { src: "/navidad/canastas/canasta-1.webp", titulo: "Canasta navideña HispanoTech", alt: "Canasta navideña de mimbre rojo con panetón, chocolates y adornos" },
  { src: "/navidad/canastas/canasta-2.webp", titulo: "Lista para compartir en familia", alt: "Canasta navideña vista de costado junto a regalos" },
  { src: "/navidad/canastas/canasta-3.webp", titulo: "Todo lo que trae", alt: "Vista superior del contenido de la canasta navideña" },
  { src: "/navidad/canastas/canasta-4.webp", titulo: "Panetón navideño", alt: "Primer plano del panetón dentro de la canasta" },
  { src: "/navidad/canastas/canasta-5.webp", titulo: "Chocolates y dulces", alt: "Primer plano de bombones dorados y bastón de caramelo" },
  { src: "/navidad/canastas/canasta-6.webp", titulo: "25 canastas por entregar", alt: "Canasta navideña junto al árbol de Navidad y regalos" },
];
