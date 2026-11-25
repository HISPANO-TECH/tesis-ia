// Sorteo de 25 canastas navideñas — fuente única de textos y datos de /navidad.
// Fuente: bases-sorteo-canastas-HT.docx e informe-correcciones-sorteo.docx (24/11/2026).
// Las bases completas están en src/config/bases-sorteo.ts. Si cambian fechas, actualizar
// también public/api/navidad.php.

export const EMPRESA = {
  razonSocial: "Mate Fácil E.I.R.L.",
  ruc: "20513965703",
  domicilio: "Alameda Lorenzo de Vidaurre 216, Los Próceres, Surco, Lima, Perú",
  correo: "informes@tesis-ia.com",
} as const;

export const NAVIDAD = {
  marca: "Hispanotech",
  totalCanastas: 25,
  cierreInscripciones: "2026-12-19T19:30:00-05:00",
  fechaSorteo: "2026-12-19T20:00:00-05:00",
  cierreTexto: "sábado 19 de diciembre de 2026, 7:30 p. m. (hora de Perú)",
  sorteoTexto: "sábado 19 de diciembre de 2026, 8:00 p. m. (hora de Perú)",
  canalSorteo: "en vivo por Zoom",
  costoEnvio: "Entrega solo en Lima Metropolitana. El costo del envío o recojo lo asume el ganador.",
  urlBases: "/condiciones-sorteo/",
} as const;

export const NAVIDAD_HERO = {
  eyebrow: "Sorteo navideño 2026 · Hispanotech",
  subtitulo: "Participación gratuita, sin compra",
  texto:
    "Sorteo para mayores de 18 años que residen en Lima Metropolitana y son estudiantes de 8.º, 9.º o 10.º ciclo, egresados o bachilleres en proceso de titulación.",
  chips: ["25 ganadores", "Participación gratuita", "Solo Lima Metropolitana"],
};

export const NAVIDAD_CANASTA = [
  { icon: "lucide:cake-slice", titulo: "Panetón", texto: "Incluido en la canasta." },
  { icon: "lucide:coffee", titulo: "Café embolsado", texto: "Incluido en la canasta." },
  { icon: "lucide:cup-soda", titulo: "Tomatodo", texto: "Solo en algunas canastas." },
  { icon: "lucide:gift", titulo: "Regalos sorpresa", texto: "Se sortean junto con las 25 canastas." },
];
export const NAVIDAD_NOTA_PREMIO =
  "Imágenes referenciales: no muestran el contenido exacto. El contenido puede variar según disponibilidad, sin reducir el valor del premio. No canjeable por dinero en efectivo.";

export const NAVIDAD_PASOS = [
  { icon: "lucide:clipboard-list", titulo: "Completa tus datos", texto: "Son seis campos. Cada persona puede inscribirse una sola vez." },
  { icon: "lucide:scroll-text", titulo: "Acepta las bases", texto: "Recibir promociones es opcional y no influye en el sorteo." },
  { icon: "lucide:ticket", titulo: "Recibe tu código", texto: "Lo verás en pantalla y te llegará al correo que registraste." },
  { icon: "lucide:video", titulo: "Únete al sorteo por Zoom", texto: "Enviaremos el enlace a todos los inscritos antes del sorteo, por el grupo de WhatsApp y por correo." },
];

// ---- Formulario ----
export const FORM_TITULO = "Participa por una de las 25 canastas navideñas";
export const CONDICIONES_ACADEMICAS = [
  "Estudiante de 8.º ciclo",
  "Estudiante de 9.º ciclo",
  "Estudiante de 10.º ciclo",
  "Egresado de universidad",
  "Bachiller en proceso de obtener el título profesional",
];
export const DISTRITOS = [
  "Ancón", "Ate", "Barranco", "Breña", "Carabayllo", "Chaclacayo", "Chorrillos", "Cieneguilla", "Comas", "El Agustino",
  "Independencia", "Jesús María", "La Molina", "La Victoria", "Lima (Cercado)", "Lince", "Los Olivos", "Lurigancho-Chosica", "Lurín",
  "Magdalena del Mar", "Miraflores", "Pachacámac", "Pucusana", "Pueblo Libre", "Puente Piedra", "Punta Hermosa", "Punta Negra", "Rímac",
  "San Bartolo", "San Borja", "San Isidro", "San Juan de Lurigancho", "San Juan de Miraflores", "San Luis", "San Martín de Porres",
  "San Miguel", "Santa Anita", "Santa María del Mar", "Santa Rosa", "Santiago de Surco", "Surquillo", "Villa El Salvador", "Villa María del Triunfo",
];

export const NAVIDAD_BASES = [
  "Participación gratuita y sin compra, para mayores de 18 años que residen en Lima Metropolitana.",
  "Debes estar en 8.º, 9.º o 10.º ciclo, ser egresado, o ser bachiller en proceso de obtener el título profesional.",
  "Una inscripción por persona. No participan colaboradores de Mate Fácil E.I.R.L. ni de Hispanotech, ni sus familiares directos.",
  "Se eligen al azar 25 ganadores y 10 suplentes, en vivo por Zoom.",
  "El ganador responde dentro de las 48 horas posteriores al anuncio y presenta carnet universitario, constancia de egresado o constancia de bachiller.",
  "Entrega solo en Lima Metropolitana. El costo del envío o recojo lo asume el ganador y se coordina como máximo hasta el 23 de diciembre de 2026.",
];

export const NAVIDAD_FAQ = [
  { q: "¿Tiene algún costo participar?", a: "No. La participación es gratuita y no requiere compra. Si ganas, el costo del envío o recojo de la canasta lo asumes tú." },
  { q: "¿Quiénes pueden participar?", a: "Mayores de 18 años que residen en Lima Metropolitana y son estudiantes de 8.º, 9.º o 10.º ciclo, egresados de una universidad o bachilleres en proceso de obtener el título profesional." },
  { q: "¿Debo unirme al grupo de WhatsApp?", a: "No es obligatorio y no influye en el sorteo ni en el premio. Al inscribirte podrás unirte al grupo, donde compartimos el enlace de Zoom. También lo enviamos por correo." },
  { q: "¿Cómo sé si gané?", a: "Anunciamos los resultados durante la sesión de Zoom y los comunicamos al correo que registraste. Tienes 48 horas desde el anuncio para responder." },
  { q: "¿Qué documento presento si gano?", a: "Carnet universitario, constancia de egresado o constancia de bachiller. No lo pedimos al inscribirte." },
  { q: "¿Qué hacen con mis datos?", a: "Los usamos para administrar el sorteo, contactar a los ganadores y coordinar la entrega. Solo te enviaremos promociones si marcas la casilla opcional." },
];

export const NAVIDAD_CIERRE = {
  titulo: "Participa por una canasta navideña",
  texto: "Inscríbete gratis hasta el sábado 19 de diciembre de 2026, 7:30 p. m. (hora de Perú).",
};

export const AVISO_PLATAFORMAS =
  "Esta promoción no está patrocinada, avalada, administrada ni asociada con Meta (Facebook, Instagram ni WhatsApp). Los participantes liberan a Meta de toda responsabilidad relacionada con esta promoción.";

// ---- Espacios de video y fotos (los llena marketing) ----
// Para reemplazar: subir el archivo a public/navidad/ y cambiar la ruta aquí.
export const NAVIDAD_MEDIA = {
  // POR REEMPLAZAR: video del banner que entregará marketing (1920x1080, MP4 H.264, sin audio, ≤ 4 MB).
  // Mientras sea null, el banner muestra la imagen de fondo (bannerPoster).
  bannerVideo: null as string | null,
  bannerVideoMovil: null as string | null, // opcional 1080x1920
  bannerPoster: "/navidad/premio-canasta.webp",
  // Video vertical con las canastas (720x1280). Se puede reemplazar por el de marketing.
  comoParticiparVideo: "/navidad/canastas-video.mp4",
  comoParticiparPoster: "/navidad/canastas-video-poster.webp",
  // Imagen de fondo del cierre (con zoom suave)
  ctaImagen: "/navidad/premio-canasta.webp",
};

// Imágenes entregadas por marketing (24/11/2026), 1080x1350 px. Se pueden agregar o quitar cards.
export const NAVIDAD_GALERIA = [
  { src: "/navidad/canastas/canasta-navidena-1.webp", titulo: "Canasta con lazo dorado", alt: "Canasta navideña en caja Feliz Navidad con lazo dorado, panetón, café y termo con tazas" },
  { src: "/navidad/canastas/canasta-navidena-2.webp", titulo: "Canasta con lazo granate", alt: "Canasta navideña en caja roja con lazo granate, panetón, arroz, avena y fideos" },
  { src: "/navidad/canastas/canasta-navidena-3.webp", titulo: "Canasta con lazo azul", alt: "Canasta navideña con lazo azul, panetón, aceite, azúcar y avena" },
  { src: "/navidad/canastas/canasta-navidena-4.webp", titulo: "Canasta con lazo verde", alt: "Canasta navideña en caja Feliz Navidad con lazo verde, panetón, café, aceite y arroz" },
  { src: "/navidad/canastas/canasta-navidena-5.webp", titulo: "Canasta navideña en casa", alt: "Canasta navideña en una sala junto al árbol, con panetón, arroz, avena y termo con tazas" },
];
