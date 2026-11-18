// Genera los 2 Word de revisión de la página /navidad para el supervisor:
//   docs/navidad/Navidad-TesisIA-01-Textos.docx
//   docs/navidad/Navidad-TesisIA-02-Imagenes-y-Videos.docx
// Uso (desde tesis-ia/):  node scripts/navidad-docs/build-docs.cjs <carpeta_miniaturas>
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType,
  AlignmentType, HeadingLevel, LevelFormat, BorderStyle, ImageRun, PageBreak, Footer, Header,
  PageNumber, TableOfContents,
} = require("docx");

const ROOT = path.resolve(__dirname, "../..");
const OUT = path.join(ROOT, "docs/navidad");
const THUMBS = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });

// ---------- datos de la página (misma fuente que src/config/navidad.ts) ----------
const cfgSrc = fs.readFileSync(path.join(ROOT, "src/config/navidad.ts"), "utf8");
const arr = (name) => {
  const m = cfgSrc.match(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\n\\];`));
  return [...m[1].matchAll(/^\s*"([^"]+)",?$/gm)].map((x) => x[1]);
};
const ETAPAS = arr("ETAPAS");
const CARRERAS = arr("CARRERAS_EJEMPLO");
const SITUACION = arr("SITUACION_TESIS");
const APOYOS = arr("APOYOS");

// ---------- estilos ----------
const NAVY = "0B1D3A", GOLD = "B7791F", RED = "B91C1C", GREY = "64748B", LIGHT = "F1F5F9", CREAM = "FFF7E0";
const W = 9638; // ancho útil A4 con márgenes de 2 cm (DXA)
const border = { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" };
const borders = { top: border, bottom: border, left: border, right: border };

const t = (text, o = {}) => new TextRun({ text, font: "Arial", ...o });
const p = (children, o = {}) =>
  new Paragraph({ children: Array.isArray(children) ? children : [t(children)], spacing: { after: 120 }, ...o });
const h1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [t(text)] });
const h2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [t(text)] });
const h3 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [t(text)] });
const bullet = (children) => new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 },
  children: Array.isArray(children) ? children : [t(children)] });
const num = (ref, text) => new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 60 }, children: [t(text)] });
const note = (text) => new Paragraph({ spacing: { before: 60, after: 160 },
  shading: { type: ShadingType.CLEAR, fill: "FEF3C7", color: "auto" },
  border: { left: { style: BorderStyle.SINGLE, size: 18, color: "F59E0B", space: 6 } },
  children: [t("Nota: ", { bold: true, color: "92400E" }), t(text, { color: "78350F" })] });
const pending = (text) => t(` [POR CONFIRMAR${text ? ": " + text : ""}]`, { bold: true, color: RED, highlight: "yellow" });

function cell(content, width, o = {}) {
  const kids = (Array.isArray(content) ? content : [content]).map((c) =>
    c instanceof Paragraph ? c : new Paragraph({ children: Array.isArray(c) ? c : [typeof c === "string" ? t(c, o.run) : c], spacing: { after: 40 } }));
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA }, children: kids,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR, color: "auto" } : undefined,
  });
}
function table(widths, header, rows) {
  return new Table({
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({ tableHeader: true, children: header.map((h, i) => cell(h, widths[i], { fill: NAVY, run: { bold: true, color: "FFFFFF", size: 20 } })) }),
      ...rows.map((r, ri) => new TableRow({ children: r.map((c, i) => cell(c, widths[i], { fill: i === 0 ? LIGHT : (ri % 2 ? "FFFFFF" : "FAFAFA"), run: i === 0 ? { bold: true, size: 20 } : { size: 20 } })) })),
    ],
  });
}
// Tabla "Elemento | Texto en la página"
const kv = (rows) => table([2600, W - 2600], ["Elemento", "Texto que se muestra en la página"], rows);
const spacer = () => new Paragraph({ spacing: { after: 120 }, children: [] });

function cover(titulo, subtitulo, extra) {
  return [
    new Paragraph({ spacing: { before: 1800, after: 120 }, children: [t("TESIS-IA.COM · HISPANOTECH", { bold: true, color: GOLD, size: 22 })] }),
    new Paragraph({ spacing: { after: 200 }, children: [t(titulo, { bold: true, size: 56, color: NAVY })] }),
    new Paragraph({ spacing: { after: 480 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: "F59E0B", space: 8 } },
      children: [t(subtitulo, { size: 28, color: GREY })] }),
    table([2600, W - 2600], ["Dato", "Detalle"], [
      ["Página", "https://tesis-ia.com/navidad"],
      ["Campaña", "Sorteo de 50 Canastas Navideñas 2026"],
      ["Estado", [[t("Borrador para revisión del supervisor", { bold: true, color: RED })]]],
      ["Fecha", "18 de noviembre de 2026"],
      ...extra,
    ]),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

const styles = {
  default: { document: { run: { font: "Arial", size: 22 } } },
  paragraphStyles: [
    { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { font: "Arial", size: 34, bold: true, color: NAVY }, paragraph: { spacing: { before: 360, after: 160 }, keepNext: true, outlineLevel: 0 } },
    { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { font: "Arial", size: 28, bold: true, color: "1E3A8A" }, paragraph: { spacing: { before: 280, after: 120 }, keepNext: true, outlineLevel: 1 } },
    { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { font: "Arial", size: 24, bold: true, color: RED }, paragraph: { spacing: { before: 200, after: 100 }, keepNext: true, outlineLevel: 2 } },
  ],
};
const numbering = { config: [
  { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
  ...["n1", "n2", "n3", "n4", "n5"].map((reference) => ({ reference, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] })),
] };
const page = { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } };
const headerFooter = (label) => ({
  headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [t(label, { size: 16, color: GREY })] })] }) },
  footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [t("Página ", { size: 16, color: GREY }), new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: GREY })] })] }) },
});
const observaciones = () => [
  h1("Observaciones del supervisor"),
  p("Use esta tabla para indicar cambios. Si un texto está aprobado, puede marcar «OK»."),
  table([2400, 4838, 2400], ["Sección", "Observación / cambio solicitado", "Estado"],
    Array.from({ length: 8 }, () => [" ", " ", " "])),
];

// =====================================================================================
// WORD 1 — TEXTOS
// =====================================================================================
function docTextos() {
  const c = [];
  c.push(...cover("Página de Navidad", "Documento 1 de 2 · Textos de cada sección", [
    ["Objetivo de este documento", "Que el supervisor revise y apruebe el texto exacto que verá el usuario en cada sección de la página."],
  ]));

  c.push(h1("1. Resumen de la campaña"));
  c.push(p([t("Objetivo: ", { bold: true }), t("captar estudiantes, egresados y profesionales mediante el sorteo de 50 canastas navideñas, conocer en qué etapa de su tesis está cada persona e incorporarlos al grupo de WhatsApp de la comunidad HispanoTech. Así, quienes ingresen en diciembre pueden convertirse en clientes de cursos, herramientas de IA y servicios académicos en enero, febrero y marzo de 2027.")]));
  c.push(p([t("Posicionamiento: ", { bold: true }), t("presentar a HispanoTech como una plataforma tecnológica de investigación académica, no solo como una empresa que brinda asesoría de tesis.")]));
  c.push(p([t("Flujo del usuario:", { bold: true })]));
  ["Publicidad en Facebook, Instagram y TikTok → llega a tesis-ia.com/navidad.",
   "Completa el formulario (datos personales + situación académica + estado de tesis + intereses).",
   "Recibe en pantalla su código de participación (NAV-0001, NAV-0002…) y, recién ahí, el botón del grupo de WhatsApp.",
   "Se une al grupo de WhatsApp de la comunidad (paso obligatorio para participar).",
   "Sorteo en vivo y anuncio de los 50 ganadores en el grupo."].forEach((s) => c.push(num("n1", s)));

  c.push(h1("2. Datos que el supervisor debe confirmar"));
  c.push(p("La página ya funciona con estos valores provisionales. Están en un único archivo (src/config/navidad.ts), así que cambiarlos toma minutos."));
  c.push(table([2800, 3600, 3238], ["Dato", "Valor provisional en la página", "Qué se necesita"], [
    ["Link del grupo de WhatsApp", "https://chat.whatsapp.com/HISPANOTECH-NAVIDAD-2026 (no funciona, es de ejemplo). Se configura en public/api/navidad.php", "El link de invitación real del grupo"],
    ["Cierre de inscripciones", "20 de diciembre de 2026, 11:59 p. m.", "Fecha y hora definitivas"],
    ["Fecha del sorteo", "22 de diciembre de 2026, 8:00 p. m. (hora de Perú)", "Fecha y hora definitivas"],
    ["Canal del sorteo en vivo", "Facebook y TikTok de HispanoTech", "Redes donde se transmitirá"],
    ["Contenido de la canasta", "Panetón, chocolate para taza, chocolates/bombones, detalles navideños", "Lista real según el proveedor"],
    ["Ámbito de entrega", "«La entrega se coordinará con cada ganador»", "¿Solo Lima o también provincias? ¿Quién asume el envío?"],
    ["Bases legales", "7 reglas propuestas (sección 8)", "Validación final (y legal, si corresponde)"],
    ["Marca", "Se usa «HispanoTech» dentro de tesis-ia.com", "Confirmar si se muestra HispanoTech, Tesis IA o ambas"],
    ["Video del banner", "Imagen fija 3D mientras llega el video", "Video de marketing (ver Documento 2)"],
    ["Video «Cómo participar»", "Video 3D de ejemplo", "Video vertical de marketing (ver Documento 2)"],
    ["Fotos del carrusel", "6 renders 3D referenciales", "Fotos reales de las canastas (ver Documento 2)"],
  ]));

  c.push(h1("3. Estructura de la página"));
  c.push(table([700, 2800, 6138], ["#", "Sección", "Para qué sirve"], [
    ["1", "Banner principal (video de marketing) + formulario", "Anuncia las 50 canastas con cuenta regresiva y, al lado, el formulario de inscripción por pasos."],
    ["2", "El premio", "Muestra la canasta en 3D y qué contiene."],
    ["3", "Mira nuestras canastas", "Carrusel de cards con fotos de las canastas (solo imágenes y un título corto)."],
    ["4", "Cómo participar + video", "Los 4 pasos a la izquierda y un video vertical a la derecha."],
    ["5", "Comunidad HispanoTech", "Posiciona a HispanoTech como plataforma de investigación."],
    ["6", "Formulario por pasos", "Preguntas 1 a 7 divididas en 4 pasos (A, B, C, D), uno a la vez."],
    ["7", "Mensaje de inscripción exitosa", "Entrega el código y, recién ahí, el botón del grupo de WhatsApp."],
    ["8", "Franja del grupo de WhatsApp", "Botón destacado para entrar al grupo."],
    ["9", "Bases del sorteo", "Reglas, fechas y condiciones."],
    ["10", "Preguntas frecuentes", "Resuelve dudas antes de que escriban."],
    ["11", "Cierre (CTA con fondo animado 3D)", "Último llamado a participar, sobre el video 3D de la canasta."],
    ["—", "Elementos globales", "Nieve animada en toda la página, botón «Nieve: sí/no», botón flotante de WhatsApp, menú con enlace «Navidad»."],
  ]));

  c.push(new Paragraph({ children: [new PageBreak()] }));
  c.push(h1("4. Textos por sección"));

  c.push(h2("Sección 1 · Banner principal"));
  c.push(kv([
    ["Etiqueta superior", "Campaña navideña 2026 · HispanoTech"],
    ["Título (H1)", "50 CANASTAS NAVIDEÑAS"],
    ["Subtítulo", "¡Esta Navidad, HispanoTech premia tu esfuerzo académico!"],
    ["Párrafo", "Participa en el sorteo de 50 canastas navideñas y forma parte de nuestra comunidad de estudiantes, egresados y profesionales que quieren llevar sus investigaciones al siguiente nivel."],
    ["Etiquetas (chips)", "50 ganadores · Inscripción gratuita · Sorteo en vivo"],
    ["Formulario (a la derecha)", "Encabezado: «Inscríbete gratis» · «4 pasos · 2 minutos · acceso al grupo de WhatsApp». Es el mismo formulario por pasos de la sección 6."],
    ["Cuenta regresiva", "«El sorteo empieza en» · Días · Horas · Min · Seg"],
    ["Fondo", [[t("Video de marketing en bucle, sin sonido. Mientras no llegue, se muestra una imagen 3D fija."), pending("video de marketing")]]],
    ["Línea de fecha", [[t("Sorteo: 22 de diciembre de 2026, 8:00 p. m. (hora de Perú), en vivo por Facebook y TikTok de HispanoTech."), pending("fecha y canal")]]],
  ]));

  c.push(h2("Sección 2 · El premio"));
  c.push(kv([
    ["Etiqueta", "El premio"],
    ["Título (H2)", "Una canasta llena de Navidad para 50 investigadores"],
    ["Párrafo", "Cada ganador recibe una canasta navideña para compartir en familia. Porque detrás de cada tesis hay meses de esfuerzo, y queremos celebrarlo contigo."],
    ["Sello sobre la imagen", "50 ganadores"],
    ["Ítem 1", "Panetón — El clásico infaltable de la mesa navideña peruana."],
    ["Ítem 2", "Chocolate para taza — Para la chocolatada en familia."],
    ["Ítem 3", "Chocolates y bombones — Una selección dulce para compartir."],
    ["Ítem 4", "Detalles navideños — Galletas, golosinas y adornos de temporada."],
    ["Nota al pie", [[t("* Imagen referencial. El contenido puede variar según disponibilidad del proveedor."), pending("contenido real")]]],
  ]));
  c.push(note("Siguiendo la recomendación de la propuesta, la canasta se presenta con buena imagen sin detallar marcas ni precios. El presupuesto referencial (50 canastas × S/ 35 = S/ 1,750 + transporte, armado y difusión) NO se muestra en la página."));

  c.push(h2("Sección 3 · Mira nuestras canastas"));
  c.push(kv([
    ["Título (H2)", "Mira nuestras canastas"],
    ["Card 1", "Canasta navideña HispanoTech"],
    ["Card 2", "Lista para compartir en familia"],
    ["Card 3", "Todo lo que trae"],
    ["Card 4", "Panetón navideño"],
    ["Card 5", "Chocolates y dulces"],
    ["Card 6", "50 canastas por entregar"],
    ["Funcionamiento", "Carrusel: avanza solo cada 4 segundos, flechas, puntos y deslizamiento con el dedo en celular."],
  ]));
  c.push(note("Las fotos actuales son renders 3D referenciales. Cuando marketing entregue las fotos reales, se reemplazan sin tocar el diseño; se pueden agregar o quitar cards y cambiar el título de cada una."));

  c.push(h2("Sección 4 · Cómo participar (con video)"));
  c.push(kv([
    ["Etiqueta", "Cómo participar"],
    ["Título (H2)", "4 pasos y ya estás participando"],
    ["Párrafo", "Inscripciones abiertas hasta el 20 de diciembre de 2026, 11:59 p. m."],
    ["Paso 1", "Completa el formulario — Datos personales, tu situación académica y el estado de tu tesis. Te toma 2 minutos."],
    ["Paso 2", "Únete al grupo de WhatsApp — Es parte de la participación: ahí anunciamos el sorteo, los ganadores y contenido académico gratuito."],
    ["Paso 3", "Recibe tu código — Al inscribirte obtienes un código de participación único. Guárdalo: con él se identifica a los ganadores."],
    ["Paso 4", "Mira el sorteo en vivo — Sorteamos las 50 canastas de forma pública y transparente. ¡Mucha suerte!"],
    ["Botones", "IR AL FORMULARIO · UNIRME AL GRUPO (ambos llevan al formulario)"],
    ["Video (a la derecha)", [[t("Video vertical dentro de un marco de celular, con botón de reproducir y el texto «Así participas en 1 minuto»."), pending("video de marketing")]]],
  ]));

  c.push(h2("Sección 5 · Comunidad HispanoTech"));
  c.push(kv([
    ["Etiqueta", "Comunidad HispanoTech"],
    ["Título (H2)", "Más que un sorteo: una comunidad que investiga contigo"],
    ["Párrafo", "HispanoTech es una plataforma tecnológica de investigación académica. Reunimos a estudiantes, egresados y profesionales que quieren desarrollar su tesis y sus investigaciones con método, inteligencia artificial y acompañamiento real."],
    ["Beneficio 1", "Tips de metodología de investigación y redacción académica"],
    ["Beneficio 2", "Herramientas de inteligencia artificial aplicadas a tu tesis"],
    ["Beneficio 3", "Talleres y capacitaciones gratuitas para la comunidad"],
    ["Beneficio 4", "Avisos de cursos y asesorías durante 2027"],
    ["Texto bajo la imagen", "Estudiantes · Egresados · Maestría · Doctorado"],
  ]));

  c.push(new Paragraph({ children: [new PageBreak()] }));
  c.push(h2("Sección 6 · Formulario de inscripción (por pasos)"));
  c.push(kv([
    ["Etiqueta", "Inscripción gratuita · 4 pasos"],
    ["Título del formulario", "Participa por una de las 50 canastas navideñas de HispanoTech"],
    ["Párrafo", "Solo 2 minutos. Al terminar recibirás tu código de participación y el acceso al grupo de WhatsApp."],
    ["Indicador de pasos", "A Datos · B Académico · C Tesis · D Intereses (con barra de progreso; los pasos completados se marcan con ✓)"],
    ["Botones", "ANTERIOR · SIGUIENTE (pasos A–C) · QUIERO PARTICIPAR (paso D)"],
    ["Contador", "Paso 1 de 4 … Paso 4 de 4"],
  ]));
  c.push(note("Para que no se vea largo, el formulario muestra un solo paso a la vez. No deja avanzar si faltan datos en el paso actual, y las 10 opciones de tesis se muestran en dos columnas."));
  c.push(note("Se piden pocos datos, como recomienda la propuesta: lo suficiente para segmentar y luego ofrecer servicios, capacitación o herramientas. Todas las preguntas son obligatorias salvo el consentimiento de promociones."));

  c.push(h3("Paso A. Datos personales"));
  c.push(table([3400, 3300, 2938], ["Pregunta", "Tipo de respuesta / ejemplo", "Validación"], [
    ["1. Nombres y apellidos *", "Texto · «Ej.: María Fernanda Quispe Rojas»", "Mínimo nombre y apellido"],
    ["2. Número de WhatsApp *", "Celular con prefijo +51 · «9XX XXX XXX»", "9 dígitos, empieza con 9; no se repite"],
    ["3. Correo electrónico *", "Correo · «tucorreo@gmail.com»", "Formato válido; no se repite"],
  ]));
  c.push(h3("Paso B. Situación académica"));
  c.push(p([t("4. ¿En qué etapa de tu formación académica te encuentras? *", { bold: true }), t("  (lista desplegable, una opción)")]));
  ETAPAS.forEach((e) => c.push(bullet(e)));
  c.push(p([t("5. ¿A qué carrera o especialidad perteneces? *", { bold: true }), t("  (respuesta abierta, con sugerencias al escribir)")]));
  c.push(p([t("Sugerencias: ", { italics: true }), t(CARRERAS.join(", ") + ".", { italics: true })]));
  c.push(h3("Paso C. Estado de tu tesis"));
  c.push(p([t("6. ¿En qué situación se encuentra actualmente tu proyecto de tesis o investigación? *", { bold: true }), t("  (selección única)")]));
  SITUACION.forEach((s) => c.push(num("n2", s)));
  c.push(note("Es la pregunta más valiosa para HispanoTech: permite identificar con precisión en qué etapa comercial se encuentra cada persona."));
  c.push(h3("Paso D. Tus intereses"));
  c.push(p([t("7. ¿Qué tipo de apoyo te interesaría recibir de HispanoTech? *", { bold: true }), t("  (puedes marcar varias)")]));
  APOYOS.forEach((a) => c.push(bullet(a)));
  c.push(note("«Por ahora, solamente deseo participar en el sorteo» es excluyente: si se marca, se desmarcan las demás (y viceversa). Esta pregunta ayuda a identificar demanda real y diseñar nuevos productos."));
  c.push(h3("Paso D. Consentimientos (separados, Ley N.º 29733)"));
  c.push(kv([
    ["Obligatorio", "* Acepto las bases del sorteo y la política de privacidad, y autorizo el uso de mis datos para gestionar mi participación."],
    ["Opcional", "(Opcional) Acepto recibir promociones y comunicaciones de HispanoTech sobre cursos, herramientas de IA y servicios académicos, conforme a la normativa peruana de protección de datos personales."],
    ["Botón de envío", "QUIERO PARTICIPAR  (mientras envía: «Registrando…»)"],
  ]));

  c.push(h2("Sección 7 · Mensaje de inscripción exitosa"));
  c.push(kv([
    ["Título", "¡Ya estás inscrito, [Nombre]!"],
    ["Texto", "Tu código de participación es: NAV-0001 (correlativo)"],
    ["Aviso en rojo", "Último paso obligatorio: únete al grupo de WhatsApp para que tu participación sea válida."],
    ["Botón", "UNIRME AL GRUPO DE WHATSAPP"],
    ["Texto pequeño", "Toma una captura de esta pantalla para guardar tu código."],
  ]));
  c.push(h3("Mensajes del sistema"));
  c.push(kv([
    ["Campos incompletos", "Revisa los campos marcados en rojo."],
    ["Ya inscrito", "Se muestra la misma pantalla de éxito con el título «¡Ya estabas inscrito, [Nombre]!», su código original y el botón del grupo."],
    ["Inscripciones cerradas", "Las inscripciones para el sorteo ya cerraron. ¡Gracias por tu interés!"],
    ["Envíos seguidos", "Espera unos segundos antes de volver a enviar."],
    ["Servidor sin respuesta", "No pudimos registrar tu inscripción en este momento. Te abrimos WhatsApp con tus datos para registrarte manualmente."],
  ]));

  c.push(h2("Sección 8 · Franja del grupo de WhatsApp"));
  c.push(kv([
    ["Título (H2)", "Únete al grupo de WhatsApp de la comunidad"],
    ["Párrafo", "Ahí anunciamos el sorteo en vivo, publicamos la lista de ganadores y compartimos contenido académico gratuito. Para entrar, primero completa el formulario: al terminar te mostramos el acceso al grupo."],
    ["Botón", "INSCRIBIRME Y UNIRME  →  lleva al formulario"],
  ]));

  c.push(h2("Sección 9 · Bases del sorteo"));
  c.push(kv([
    ["Etiqueta", "Bases del sorteo"],
    ["Título (H2)", "Reglas claras, sorteo transparente"],
    ["Recuadros", "Cierre de inscripciones: 20 de diciembre de 2026, 11:59 p. m. · Sorteo: 22 de diciembre de 2026, 8:00 p. m. (hora de Perú)"],
  ]));
  c.push(p([t("Reglas (en orden):", { bold: true }), pending("validación de las bases")]));
  [
    "La participación es gratuita y está dirigida a personas mayores de 18 años residentes en Perú.",
    "Para participar debes completar el formulario y unirte al grupo de WhatsApp de la comunidad antes del cierre de inscripciones.",
    "Solo se admite una inscripción por persona (número de WhatsApp y correo únicos). Los registros duplicados o con datos falsos serán anulados.",
    "Se sortearán 50 canastas navideñas; cada participante puede ganar como máximo una canasta.",
    "Los ganadores se anunciarán durante la transmisión en vivo y en el grupo de WhatsApp, y serán contactados al número registrado.",
    "Si un ganador no responde dentro de las 48 horas siguientes al sorteo, se elegirá un ganador suplente.",
    "La entrega se coordinará directamente con cada ganador. El premio no es canjeable por dinero.",
  ].forEach((b) => c.push(num("n3", b)));

  c.push(h2("Sección 10 · Preguntas frecuentes"));
  c.push(table([3200, W - 3200], ["Pregunta", "Respuesta"], [
    ["¿Tiene algún costo participar?", "No. La inscripción es 100 % gratuita. Nunca te pediremos pagos ni datos bancarios para entregarte tu canasta."],
    ["¿Quiénes pueden participar?", "Estudiantes de los últimos ciclos, egresados, bachilleres, titulados y estudiantes o egresados de maestría y doctorado. Si estás en otra etapa, también puedes participar marcando «Otro»."],
    ["¿Es obligatorio unirme al grupo de WhatsApp?", "Sí. El ingreso al grupo es parte del proceso de participación: ahí se anuncia el sorteo, se comparten los resultados y se coordina la entrega."],
    ["¿Cómo sé si gané?", "Los 50 ganadores se anuncian en la transmisión en vivo y en el grupo de WhatsApp. Además te escribiremos al número que registraste, indicando tu código de participación."],
    ["¿Qué hacen con mis datos?", "Los usamos para gestionar el sorteo. Solo si lo autorizas expresamente, también te enviaremos información de cursos, herramientas de IA y servicios académicos, conforme a la Ley N.º 29733 de Protección de Datos Personales."],
  ]));

  c.push(h2("Sección 11 · Cierre (CTA con fondo animado)"));
  c.push(kv([
    ["Título (H2)", "Tu esfuerzo académico merece celebrarse"],
    ["Párrafo", "Inscríbete hoy, únete a la comunidad y participa por una de las 50 canastas navideñas."],
    ["Botones", "QUIERO PARTICIPAR · UNIRME AL GRUPO DE WHATSAPP (ambos llevan al formulario)"],
    ["Despedida", "¡Felices fiestas te desea toda la comunidad HispanoTech! 🎄"],
    ["Fondo", "Video 3D animado de la canasta (se reproduce solo cuando la sección está en pantalla)."],
  ]));

  c.push(h2("Textos para Google y redes (SEO / compartir)"));
  c.push(kv([
    ["Título de la pestaña", "Sorteo de 50 Canastas Navideñas | Tesis IA - Plan IAs Investigador Pro"],
    ["Descripción", "¡Esta Navidad, HispanoTech premia tu esfuerzo académico! Inscríbete gratis, únete a la comunidad y participa por una de las 50 canastas navideñas."],
    ["Imagen al compartir", "og-navidad.jpg (1200 × 630 px) — ver Documento 2"],
  ]));

  c.push(h1("5. Captación de leads: el grupo solo se entrega tras el formulario"));
  ["Todos los botones «Unirme al grupo de WhatsApp» de la página llevan al formulario; ninguno abre el grupo directamente.",
   "El link del grupo no está escrito en la página (no se puede copiar del código fuente): lo entrega el servidor solo cuando la inscripción es válida.",
   "El formulario aparece dos veces (banner y sección de inscripción); al registrarse en uno, ambos muestran el acceso al grupo.",
   "Si alguien ya estaba inscrito y vuelve a llenar el formulario, recibe de nuevo su código y el botón del grupo (ya dejó sus datos)."].forEach((x) => c.push(bullet(x)));

  c.push(h1("6. Qué pasa con cada inscripción (funcionamiento)"));
  ["Se valida en el navegador y otra vez en el servidor (no se aceptan opciones inventadas ni números inválidos).",
   "Se guarda en un archivo protegido del servidor (api/data/navidad-inscritos.csv), que se abre en Excel. No es accesible desde la web.",
   "No se permite inscribir dos veces el mismo WhatsApp ni el mismo correo.",
   "Se asigna el código correlativo y llega una notificación a informes@asesorestesisperu.com.",
   "Se registra por separado si la persona aceptó o no recibir promociones (para respetar su consentimiento).",
   "Pasada la fecha de cierre, el formulario deja de aceptar inscripciones automáticamente."].forEach((s) => c.push(bullet(s)));

  c.push(new Paragraph({ children: [new PageBreak()] }));
  c.push(...observaciones());

  return new Document({ creator: "Equipo web tesis-ia.com", title: "Página de Navidad — Textos", styles, numbering,
    sections: [{ properties: { page }, ...headerFooter("Navidad 2026 · Documento 1 · Textos"), children: c }] });
}

// =====================================================================================
// WORD 2 — IMÁGENES Y VIDEOS
// =====================================================================================
function kb(file) {
  const f = path.join(ROOT, "public/navidad", file);
  if (!fs.existsSync(f)) return "—";
  const s = fs.statSync(f).size;
  return s > 1024 * 1024 ? `${(s / 1024 / 1024).toFixed(2)} MB` : `${Math.round(s / 1024)} KB`;
}
function thumb(name, w, h) {
  const f = path.join(THUMBS, name);
  if (!THUMBS || !fs.existsSync(f)) return p([t("(miniatura no disponible)", { italics: true, color: GREY })]);
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 120 },
    children: [new ImageRun({ type: "jpg", data: fs.readFileSync(f), transformation: { width: w, height: h },
      altText: { title: name, description: name, name } })] });
}

const ASSETS = [
  { file: "(video de marketing)", tipo: "Video — POR ENTREGAR", seccion: "1 · Banner principal (fondo)", dim: "1920 × 1080 px (+ opcional 1080 × 1920 para celular)", ratio: "16:9 (9:16 celular)",
    formato: "MP4 H.264, sin audio, 6–15 s en bucle, ≤ 4 MB",
    detalle: [
      "Lo entrega marketing. Se reproduce solo, en silencio y en bucle detrás del texto del banner.",
      "El texto va a la izquierda: conviene que lo importante del video (la canasta, personas) esté al centro-derecha.",
      "Se coloca en public/navidad/ y se activa en src/config/navidad.ts (NAVIDAD_MEDIA.bannerVideo). Mientras no exista, se muestra hero-poster.webp.",
    ] },
  { file: "como-participar.mp4", tipo: "Video vertical — POR REEMPLAZAR", seccion: "4 · Cómo participar (a la derecha)", dim: "720 × 1280 px (ejemplo) · marketing: 1080 × 1920 px", ratio: "9:16",
    formato: "MP4 H.264 · con audio permitido", thumb: ["vertical.jpg", 180, 320],
    detalle: [
      "Hoy es un video de ejemplo (recorte vertical de la animación 3D). Marketing lo reemplaza por un video tipo reel que explique cómo participar.",
      "Recomendado: 1080 × 1920 px, 30–60 s, MP4 H.264, ≤ 15 MB, con subtítulos incluidos (muchos lo verán sin sonido).",
      "No se reproduce solo: el usuario toca el botón de play. Póster: como-participar-poster.webp (720 × 1280).",
    ] },
  { file: "canastas/canasta-1.webp … canasta-6.webp", tipo: "6 fotos — POR REEMPLAZAR", seccion: "3 · Mira nuestras canastas (carrusel)", dim: "1080 × 1350 px c/u", ratio: "4:5 (vertical)",
    formato: "WebP · 46–82 KB c/u", thumb: ["galeria.jpg", 600, 125],
    detalle: [
      "Hoy son renders 3D referenciales de la misma canasta desde 6 ángulos (vista completa, costado, desde arriba, panetón, dulces, con el árbol).",
      "Marketing puede reemplazarlas por fotos reales: 1080 × 1350 px (4:5), JPG o WebP, ≤ 200 KB, con buena luz y la canasta al centro.",
      "En pantalla: cards de ~300 px de ancho en escritorio (4 visibles) y casi todo el ancho en celular. La parte inferior lleva un título sobre un degradado oscuro.",
    ] },
  { file: "hero-navidad.mp4", alt2: "hero-navidad.webm", tipo: "Video", seccion: "11 · Cierre / CTA (fondo animado)", dim: "1920 × 1080 px", ratio: "16:9",
    formato: "MP4 (H.264) + WebM (VP9) · sin audio", thumb: ["poster.jpg", 560, 315],
    detalle: [
      "Duración: 6 segundos (144 fotogramas a 24 fps) en bucle perfecto: el último cuadro empalma con el primero.",
      "Contenido: la canasta navideña sobre una mesa de madera, regalos y esferas alrededor, árbol de Navidad y guirnaldas desenfocadas (bokeh) con luces que titilan, nieve cayendo y una órbita suave de cámara (±10°).",
      "Composición: la canasta queda en el tercio derecho. En celulares se recorta al centro-derecha y la canasta sigue visible.",
      "Se reproduce en silencio y en bucle solo cuando la sección de cierre está en pantalla (no consume datos antes). Con «ahorro de datos» o «reducir movimiento» se muestra solo el póster.",
      "Se oscurece con un velo azul noche para que el texto blanco centrado se lea bien.",
    ] },
  { file: "hero-poster.webp", tipo: "Imagen", seccion: "1 · Banner (fondo provisional) y 11 · CTA (póster)", dim: "1920 × 1080 px", ratio: "16:9", formato: "WebP",
    detalle: ["Hoy es el fondo fijo del banner mientras llega el video de marketing, y el póster del video del CTA."] },
  { file: "canasta-3d.webp", tipo: "Imagen 3D", seccion: "2 · El premio", dim: "1200 × 1200 px", ratio: "1:1", formato: "WebP con fondo transparente", thumb: ["canasta.jpg", 360, 360],
    detalle: [
      "Canasta de mimbre rojo con franjas blancas, cinturón negro con hebilla dorada y asa en arco (inspirada en la referencia de las capturas).",
      "Contenido modelado: panetón en caja azul de marca con detalles dorados, lata de chocolate para taza, caja de chocolates, bombones dorados, bastón de caramelo, regalito, galletas, ramas de pino, acebo, piña y esferas.",
      "En pantalla: hasta 560 × 560 px (escritorio) y ancho completo en celular. Flota suavemente y se inclina en 3D al pasar el mouse.",
    ] },
  { file: "regalos-3d.webp", tipo: "Imagen 3D", seccion: "3 · Cómo participar y 5 · Formulario (decoración)", dim: "1000 × 1000 px", ratio: "1:1", formato: "WebP con fondo transparente", thumb: ["regalos.jpg", 300, 300],
    detalle: ["Pila de tres regalos (azul con cinta dorada, rojo con cinta blanca, dorado con cinta roja) con lazos.", "En pantalla: 288–320 px de ancho, solo en pantallas grandes (no aparece en celular para no recargar)."] },
  { file: "esferas-3d.webp", tipo: "Imagen 3D", seccion: "5 · Formulario (decoración izquierda)", dim: "800 × 800 px", ratio: "1:1", formato: "WebP con fondo transparente", thumb: ["esferas.jpg", 280, 280],
    detalle: ["Tres esferas navideñas (roja brillante, dorada con glitter, azul con franjas blancas) con acebo.", "En pantalla: 256 px de ancho, solo en pantallas muy grandes (≥1280 px)."] },
  { file: "birrete-3d.webp", tipo: "Imagen 3D", seccion: "4 · Comunidad HispanoTech", dim: "800 × 800 px", ratio: "1:1", formato: "WebP con fondo transparente", thumb: ["birrete.jpg", 280, 280],
    detalle: ["Birrete de graduación azul noche con nieve encima, acebo y borla dorada: une la Navidad con el mundo académico.", "En pantalla: dentro de una tarjeta azul de hasta 460 × 460 px."] },
  { file: "og-navidad.jpg", alt2: "og-navidad.webp", tipo: "Imagen", seccion: "Compartir en redes + 10 · Cierre (fondo)", dim: "1200 × 630 px", ratio: "1.91:1", formato: "JPG (redes) + WebP (fondo de la web)", thumb: ["og.jpg", 480, 252],
    detalle: ["Es la imagen que aparece al compartir el enlace en WhatsApp, Facebook o LinkedIn.", "También se usa, oscurecida, como fondo de la sección de cierre."] },
];

function docImagenes() {
  const c = [];
  c.push(...cover("Página de Navidad", "Documento 2 de 2 · Imágenes y videos", [
    ["Objetivo de este documento", "Detallar cada imagen y video de la página: dónde va, medidas en píxeles, formato, peso y cómo se produjo."],
    ["Carpeta en el proyecto", "tesis-ia/public/navidad/"],
  ]));

  c.push(h1("1. Resumen de archivos"));
  c.push(table([2500, 2300, 1700, 1700, 1438], ["Archivo", "Sección", "Medidas", "Formato", "Peso"],
    ASSETS.map((a) => [a.file + (a.alt2 ? ` (+ ${a.alt2})` : ""), a.seccion, a.dim, a.formato.split(" ")[0], kb(a.file) + (a.alt2 ? ` / ${kb(a.alt2)}` : "")])));
  c.push(spacer());
  c.push(note("Todas las piezas 3D se modelaron, iluminaron y renderizaron en Blender 5.3 (motor EEVEE), desde cero y sin imágenes de stock ni marcas comerciales. Por eso pueden usarse libremente en web y redes."));

  c.push(h1("2. Detalle de cada pieza"));
  ASSETS.forEach((a, i) => {
    c.push(h2(`${i + 1}. ${a.file}`));
    if (a.thumb) c.push(thumb(...a.thumb));
    c.push(table([2600, W - 2600], ["Dato", "Detalle"], [
      ["Tipo", a.tipo], ["Sección donde aparece", a.seccion], ["Medidas", a.dim], ["Proporción", a.ratio],
      ["Formato", a.formato], ["Peso", kb(a.file) + (a.alt2 ? ` (${a.alt2}: ${kb(a.alt2)})` : "")],
    ]));
    a.detalle.forEach((d) => c.push(bullet(d)));
  });

  c.push(h2("Efectos animados (no son archivos)"));
  c.push(table([2600, W - 2600], ["Efecto", "Detalle"], [
    ["Nieve en toda la página", "Copos blancos que caen sobre todas las secciones (dibujados en el navegador, 0 KB extra). Cantidad según el tamaño de pantalla (máx. 160). Se pausa si la pestaña no está visible. Botón «Nieve: sí/no» abajo a la izquierda."],
    ["Flotación 3D", "Las imágenes 3D suben y bajan suavemente."],
    ["Inclinación 3D", "Tarjetas e imágenes se inclinan siguiendo el mouse (solo computadoras)."],
    ["Aparición al hacer scroll", "Títulos y tarjetas aparecen con un desvanecido; el título del banner aparece letra por letra."],
    ["Accesibilidad", "Si el usuario activó «reducir movimiento» en su equipo, se desactivan la nieve, el video y las animaciones."],
  ]));

  c.push(new Paragraph({ children: [new PageBreak()] }));
  c.push(h1("3. Medidas para reemplazar o agregar piezas"));
  c.push(p("Si el equipo de diseño quiere cambiar alguna pieza (por ejemplo, una foto real de la canasta), estas son las medidas recomendadas para que encaje sin modificar la página:"));
  c.push(table([2700, 2200, 2200, 2538], ["Pieza", "Medida recomendada", "Formato", "Peso máximo"], [
    ["Video del banner (escritorio)", "1920 × 1080 px, 6–15 s, en bucle, sin audio", "MP4 H.264 (+ WebM opcional)", "4 MB"],
    ["Video «Cómo participar»", "1080 × 1920 px (vertical), 30–60 s, subtítulos", "MP4 H.264", "15 MB"],
    ["Fotos del carrusel de canastas", "1080 × 1350 px (4:5), 4 a 8 fotos", "JPG o WebP", "200 KB c/u"],
    ["Video del banner (versión celular, opcional)", "1080 × 1920 px", "MP4 H.264", "3 MB"],
    ["Póster del video", "1920 × 1080 px", "WebP o JPG", "250 KB"],
    ["Canasta / producto principal", "1200 × 1200 px, fondo transparente", "WebP o PNG", "300 KB"],
    ["Decoraciones 3D", "800 × 800 a 1000 × 1000 px, fondo transparente", "WebP o PNG", "150 KB"],
    ["Imagen para redes (Open Graph)", "1200 × 630 px", "JPG", "300 KB"],
    ["Historia / reel para anuncios", "1080 × 1920 px", "MP4 o JPG", "—"],
    ["Post cuadrado para anuncios", "1080 × 1080 px", "JPG o PNG", "—"],
  ]));
  c.push(note("Si se usa una foto real de canasta, que tenga fondo transparente (recortada) para que conserve el efecto de flotación y sombra."));

  c.push(h1("4. Cómo se produjeron las piezas 3D"));
  ["Script de Blender: tesis-ia/scripts/blender/navidad_scene.py — construye por código la canasta, los regalos, las esferas, el birrete y la escena completa (mesa, árbol, guirnaldas, nieve, luces y cámara).",
   "Comando: blender -b --factory-startup -P scripts/blender/navidad_scene.py -- <canasta|regalos|esferas|birrete|og|poster|video> <carpeta_salida>",
   "Post-proceso: scripts/blender/postprocess.py convierte los PNG a WebP/JPG y los fotogramas del video a MP4 y WebM con ffmpeg.",
   "Ventaja: cualquier cambio (colores, texto del panetón, encuadre, duración) se vuelve a renderizar en minutos sin rehacer nada a mano."].forEach((s) => c.push(bullet(s)));

  c.push(new Paragraph({ children: [new PageBreak()] }));
  c.push(...observaciones());

  return new Document({ creator: "Equipo web tesis-ia.com", title: "Página de Navidad — Imágenes y videos", styles, numbering,
    sections: [{ properties: { page }, ...headerFooter("Navidad 2026 · Documento 2 · Imágenes y videos"), children: c }] });
}

(async () => {
  for (const [name, doc] of [["Navidad-TesisIA-01-Textos.docx", docTextos()], ["Navidad-TesisIA-02-Imagenes-y-Videos.docx", docImagenes()]]) {
    fs.writeFileSync(path.join(OUT, name), await Packer.toBuffer(doc));
    console.log("OK", path.join(OUT, name));
  }
})();
