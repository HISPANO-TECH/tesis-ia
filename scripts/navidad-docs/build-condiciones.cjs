// Genera docs/navidad/Navidad-TesisIA-03-Condiciones-del-Sorteo.docx
// Uso (desde tesis-ia/): node scripts/navidad-docs/build-condiciones.cjs
// Lo escrito entre [[ ]] se muestra entre corchetes y resaltado: falta confirmarlo.
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType,
  AlignmentType, HeadingLevel, LevelFormat, BorderStyle, Footer, PageNumber,
} = require("docx");

const OUT = path.resolve(__dirname, "../../docs/navidad/Navidad-TesisIA-03-Condiciones-del-Sorteo.docx");
const W = 9638;
const runs = (s, o = {}) => s.split(/(\[\[.*?\]\])/).filter(Boolean).map((x) =>
  x.startsWith("[[") ? new TextRun({ text: `[${x.slice(2, -2)}]`, font: "Arial", ...o, highlight: "yellow", color: "B91C1C" })
    : new TextRun({ text: x, font: "Arial", ...o }));
const p = (s, o = {}) => new Paragraph({ spacing: { after: 120, line: 276 }, children: runs(s, o) });
const h2 = (s) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: runs(s) });
const li = (s) => new Paragraph({ numbering: { reference: "b", level: 0 }, spacing: { after: 70, line: 276 }, children: runs(s) });
const border = { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" };
const cell = (s, w, o = {}) => new TableCell({
  width: { size: w, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
  borders: { top: border, bottom: border, left: border, right: border },
  shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: "auto" } : undefined,
  children: [new Paragraph({ children: runs(s, { size: 20, ...o.run }) })],
});
const table = (head, rows, c1 = 2900) => new Table({
  width: { size: W, type: WidthType.DXA }, columnWidths: [c1, W - c1],
  rows: [
    ...(head ? [new TableRow({ tableHeader: true, children: head.map((t, i) => cell(t, i ? W - c1 : c1, { fill: "0B1D3A", run: { bold: true, color: "FFFFFF" } })) })] : []),
    ...rows.map(([a, b]) => new TableRow({ cantSplit: true, children: [cell(a, c1, { fill: "F1F5F9", run: { bold: true } }), cell(b, W - c1)] })),
  ],
});

const body = [
  new Paragraph({ heading: HeadingLevel.TITLE, children: runs("Condiciones del Sorteo Navideño 2026") }),
  p("Sorteo de 25 canastas navideñas · HispanoTech", { size: 26, color: "64748B" }),
  p("Estas son las reglas para participar en el sorteo. Al completar el formulario y marcar la casilla de aceptación, confirmas que las leíste y que estás de acuerdo con ellas."),
  h2("Resumen"),
  table(null, [
    ["Premio", "25 canastas navideñas, una por ganador"],
    ["Costo de participar", "Gratis"],
    ["Quiénes participan", "Personas mayores de 18 años que residan en el Perú"],
    ["Cierre de inscripciones", "[[14 de diciembre de 2026, 11:59 p. m., hora de Perú]]"],
    ["Fecha del sorteo", "16 de diciembre de 2026, [[8:00 p. m., hora de Perú]]"],
    ["Dónde verlo", "En vivo por [[Facebook y TikTok de HispanoTech]]"],
    ["Dónde inscribirse", "tesis-ia.com/navidad"],
  ]),
  h2("1. Organizador"),
  p("El sorteo es organizado por HispanoTech, [[razón social]], con RUC [[número de RUC]] y domicilio en [[dirección]], en adelante «el organizador». Contacto: informes@asesorestesisperu.com y WhatsApp +51 992 005 096."),
  p("[[Autorización del sorteo: número y entidad, si corresponde]]"),
  h2("2. Vigencia"),
  p("Las inscripciones se reciben desde la publicación de estas condiciones hasta el [[14 de diciembre de 2026 a las 11:59 p. m.]], hora de Perú. Los registros enviados después de ese momento no participan."),
  h2("3. Quiénes pueden participar"),
  li("Personas naturales mayores de 18 años, con documento de identidad vigente y residencia en el Perú."),
  li("Estudiantes, egresados, bachilleres, titulados y personas que cursan o culminaron un posgrado. Quien esté en otra etapa puede participar marcando «Otro» en el formulario."),
  li("[[No participan los trabajadores del organizador ni sus familiares directos.]]"),
  h2("4. Cómo participar"),
  p("Para que tu participación sea válida debes cumplir los dos pasos antes del cierre de inscripciones:"),
  new Paragraph({ numbering: { reference: "n", level: 0 }, spacing: { after: 70 }, children: runs("Completa el formulario de tesis-ia.com/navidad con datos verdaderos. Al terminar recibirás un código de participación (por ejemplo, NAV-0001).") }),
  new Paragraph({ numbering: { reference: "n", level: 0 }, spacing: { after: 120 }, children: runs("Únete al grupo de WhatsApp con el botón que aparece después de registrarte y permanece en él hasta el día del sorteo.") }),
  p("No necesitas comprar ni contratar ningún servicio. Aceptar promociones es opcional y no influye en tus posibilidades de ganar."),
  h2("5. Una inscripción por persona"),
  p("Cada persona puede inscribirse una sola vez, con un número de WhatsApp y un correo propios. El organizador puede anular los registros duplicados, con datos falsos, hechos a nombre de otra persona sin su permiso o generados con medios automáticos."),
  h2("6. Premios"),
  li("Se sortean 25 canastas navideñas. Cada participante puede ganar como máximo una."),
  li("Cada canasta contiene: [[lista definitiva de productos]]."),
  li("Las imágenes de la página son referenciales. Si un producto no está disponible, se reemplaza por otro de valor igual o mayor."),
  li("El premio no se cambia por dinero ni por otros productos o servicios. [[El ganador puede autorizar por escrito a otra persona para recogerlo.]]"),
  h2("7. Cómo se eligen los ganadores"),
  p("El sorteo se realiza el 16 de diciembre de 2026 a las [[8:00 p. m., hora de Perú]], en vivo por [[Facebook y TikTok de HispanoTech]]. Se eligen al azar 25 ganadores y [[10]] suplentes entre los códigos de participación válidos, mediante [[nombre de la herramienta o método de sorteo]]."),
  p("Si el sorteo no pudiera realizarse ese día por una causa ajena al organizador, la nueva fecha se anunciará en la página y en el grupo de WhatsApp."),
  h2("8. Anuncio y contacto con los ganadores"),
  p("Los resultados se anuncian durante la transmisión y en el grupo de WhatsApp, con el código de participación y [[el nombre y la inicial del apellido]]. El organizador escribirá a cada ganador al WhatsApp que registró."),
  p("El ganador tiene las 48 horas siguientes al sorteo para responder y confirmar sus datos. Si no responde, no cumple estas condiciones o no acepta el premio, la canasta pasa al siguiente suplente."),
  h2("9. Entrega de las canastas"),
  li("Lugar o modalidad: [[recojo en una dirección de Lima, envío a domicilio o ambos]]."),
  li("Cobertura: [[solo Lima o también provincias]]."),
  li("Costo del envío: [[asumido por el organizador o por el ganador]]."),
  li("Plazo: las canastas se entregan hasta el [[fecha límite de entrega]]."),
  p("Para recibir la canasta, el ganador debe mostrar su documento de identidad y su código de participación. El organizador nunca pedirá claves, datos de tarjetas ni pagos a cuentas bancarias para reclamar el premio."),
  h2("10. Datos personales"),
  p("Los datos del formulario (nombre, WhatsApp, correo, etapa académica, carrera, estado de la tesis e intereses) se usan para gestionar la inscripción, realizar el sorteo, contactar a los ganadores y entregar los premios, según la Ley N.º 29733, Ley de Protección de Datos Personales."),
  li("Solo si marcas la casilla opcional, también los usaremos para enviarte promociones de cursos, herramientas de IA y servicios académicos. Puedes retirar esa autorización cuando quieras."),
  li("Al unirte al grupo de WhatsApp, tu número y tu perfil pueden ser visibles para los demás miembros."),
  li("Conservaremos los datos hasta [[plazo de conservación]]."),
  li("Para acceder a tus datos, corregirlos, eliminarlos u oponerte a su uso, escribe a informes@asesorestesisperu.com con el asunto «Derechos ARCO». Más información en la Política de Privacidad: tesis-ia.com/privacidad."),
  h2("11. Imagen de los ganadores"),
  p("El organizador solo publicará fotos o videos de un ganador si este lo autoriza por escrito. No autorizarlo no afecta la entrega del premio."),
  h2("12. Conducta en el grupo"),
  p("El organizador puede retirar del grupo y del sorteo a quien envíe spam, ofensas, contenido ilegal o intente alterar el resultado. Salir del grupo antes del sorteo deja sin efecto la participación."),
  h2("13. Redes sociales y fallas técnicas"),
  p("Este sorteo no está patrocinado, avalado ni administrado por Facebook, Instagram, TikTok ni WhatsApp, y no está asociado a ellos. El organizador no responde por fallas de internet, de los equipos del participante o de esas plataformas que estén fuera de su control, sin perjuicio de los derechos que la ley reconoce a los participantes."),
  h2("14. Cambios"),
  p("Si por una causa justificada fuera necesario modificar estas condiciones, el cambio se publicará en esta página con su fecha y se avisará en el grupo. Ningún cambio reducirá el número de premios ni afectará a quienes ya hayan ganado."),
  h2("15. Consultas, reclamos y ley aplicable"),
  p("Escríbenos a informes@asesorestesisperu.com o al WhatsApp +51 992 005 096, de lunes a sábado de 9:00 a. m. a 8:00 p. m. Estas condiciones se rigen por las leyes del Perú, y cada participante conserva su derecho de acudir a las autoridades competentes."),
  p("Última actualización: [[fecha de publicación]]", { italics: true, color: "64748B" }),

  // Hoja interna
  new Paragraph({ pageBreakBefore: true, heading: HeadingLevel.HEADING_1, children: runs("Hoja interna: no se publica") }),
  p("Datos que faltan para publicar. En el texto aparecen entre corchetes y resaltados."),
  table(["Dato", "Qué hay que decidir"], [
    ["Organizador", "Razón social, RUC y dirección."],
    ["Autorización", "Consultar con el área legal si el sorteo necesita autorización del Ministerio del Interior y cuánto demora. No se pudo confirmar en fuentes públicas."],
    ["Cierre de inscripciones", "Propuesta: 14 de diciembre, 11:59 p. m. La fecha anterior (20 de diciembre) quedaba después del nuevo sorteo."],
    ["Hora y canal del sorteo", "Se mantuvo 8:00 p. m. por Facebook y TikTok."],
    ["Método y suplentes", "Herramienta para elegir al azar y cantidad de suplentes (propuesta: 10)."],
    ["Canasta", "Lista definitiva de productos."],
    ["Entrega", "Lugar, cobertura, quién paga el envío y fecha límite."],
    ["Exclusiones y recojo", "Si se excluye a trabajadores y familiares, y si otra persona puede recoger el premio."],
    ["Publicación de ganadores", "Cómo se muestra el nombre de cada ganador."],
    ["Datos personales", "Plazo de conservación. La Política de Privacidad actual dice hasta 24 meses y todavía no menciona este sorteo; conviene actualizarla."],
  ]),
  h2("Datos para crear la página"),
  table(null, [
    ["Dirección sugerida", "tesis-ia.com/condiciones-sorteo-navidad"],
    ["Título en Google", "Condiciones del Sorteo Navideño 2026"],
    ["Descripción en Google", "Conoce las condiciones del sorteo de 25 canastas navideñas de HispanoTech: requisitos, fechas, premios, ganadores y entrega."],
    ["Enlaces hacia la página", "Casilla de aceptación del formulario, sección Bases de /navidad y pie de página."],
  ]),
];

const H = (size, color, before, after) => ({ run: { font: "Arial", size, bold: true, color }, paragraph: { spacing: { before, after }, keepNext: true } });
const doc = new Document({
  title: "Condiciones del Sorteo Navideño 2026", creator: "Equipo web tesis-ia.com",
  styles: { default: { document: { run: { font: "Arial", size: 22 } }, title: H(44, "0B1D3A", 0, 120), heading1: H(32, "B91C1C", 0, 160), heading2: H(26, "1E3A8A", 280, 120) } },
  numbering: { config: [["b", LevelFormat.BULLET, "•"], ["n", LevelFormat.DECIMAL, "%1."]].map(([reference, format, text]) => ({
    reference, levels: [{ level: 0, format, text, alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 560, hanging: 300 } } } }] })) },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: ["Página ", PageNumber.CURRENT], font: "Arial", size: 16, color: "64748B" })] })] }) },
    children: body,
  }],
});
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(OUT, b); console.log("OK", OUT); });
