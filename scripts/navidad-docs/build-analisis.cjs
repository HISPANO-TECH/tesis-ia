// Genera docs/navidad/Navidad-TesisIA-04-Analisis-legal.docx — node scripts/navidad-docs/build-analisis.cjs
const fs = require("fs"), path = require("path");
const { Document, Packer, Paragraph, TextRun, ExternalHyperlink, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, HeadingLevel, AlignmentType, Footer, PageNumber } = require("docx");
const W = 9638, line = { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" };
const t = (text, o = {}) => new TextRun({ text, font: "Arial", ...o });
const p = (s) => new Paragraph({ spacing: { after: 120, line: 276 }, children: [t(s)] });
const h = (s) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [t(s)] });
const src = (label, link) => new Paragraph({ spacing: { after: 60 }, children: [new ExternalHyperlink({ link, children: [t(label, { color: "1D4ED8", underline: {} })] })] });
const table = (ws, head, rows) => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: ws, rows: [head, ...rows].map((r, i) => new TableRow({ tableHeader: !i, cantSplit: true,
  children: r.map((c, k) => new TableCell({ width: { size: ws[k], type: WidthType.DXA }, margins: { top: 70, bottom: 70, left: 110, right: 110 }, borders: { top: line, bottom: line, left: line, right: line },
    shading: !i ? { type: ShadingType.CLEAR, fill: "0B1D3A", color: "auto" } : undefined, children: [new Paragraph({ children: [t(c, { size: 19, bold: !i || !k, color: !i ? "FFFFFF" : "0F172A" })] })] })) })) });
const body = [
  new Paragraph({ heading: HeadingLevel.TITLE, children: [t("Análisis web y legal del sorteo navideño")] }),
  p("tesis-ia.com/navidad · 24 de noviembre de 2026. Compara la página con bases-sorteo-canastas-HT.docx e informe-correcciones-sorteo.docx."),
  h("Conclusión"),
  p("La nueva versión de la página coincide con las bases en fechas, premios, requisitos, entrega y contacto. Antes de publicarla, un abogado debe validar los puntos de la sección 1. Este documento identifica riesgos; no reemplaza una asesoría legal."),
  h("1. Riesgos que requieren una decisión"),
  table([2100, 4338, 3200], ["Tema", "Riesgo", "Recomendación"], [
    ["Costo de envío", "La promoción se anuncia como gratuita, pero el ganador paga el envío o incluso el recojo. Ocultarlo podría considerarse engañoso.", "Ya se muestra junto al formulario, en el premio, las bases y el correo. Definir un rango de costo y ofrecer un recojo sin pago."],
    ["Plazos de suplentes", "El ganador responde hasta el 21 de diciembre, 8:00 p. m. Si el suplente también tiene 48 horas, llega al 23 de diciembre, fecha límite de coordinación.", "Dar 24 horas al suplente o ampliar la fecha de entrega."],
    ["Regalos sorpresa", "No se indica cuántos son ni en qué consisten.", "Publicar cantidad y descripción, o retirarlos."],
    ["Tomatodo", "Solo algunas canastas lo tienen: los premios no son iguales y no se dice cuántas lo incluyen.", "Indicar cuántas lo incluyen y cómo se asignan."],
    ["Imágenes 3D", "Muestran chocolates y regalos que las bases no prometen.", "Se advierte que son referenciales. Reemplazarlas por fotos reales."],
    ["Asistencia a Zoom", "Las bases dicen «únete a la sesión», pero no si ausentarse descalifica.", "Aclarar que no es obligatorio estar conectado para ganar."],
    ["Inscritos anteriores", "Aceptaron 50 canastas y otras fechas, y no entregaron DNI ni distrito.", "Revisar cuántos son y comunicarles el cambio. Su archivo se conserva aparte; con la versión nueva deben volver a inscribirse."],
    ["Conservación de datos", "«El tiempo necesario» no es un plazo concreto.", "Definir un plazo, por ejemplo 12 meses después del sorteo, y eliminar los datos."],
    ["Banco de datos", "Se recogen DNI y otros datos en un servidor que puede estar fuera del Perú.", "Confirmar la inscripción del banco de datos y el tratamiento de la transferencia internacional."],
    ["Exclusión por DNI", "El formulario pide DNI; un residente extranjero con carné de extranjería no puede inscribirse.", "Aceptar carné de extranjería o justificar la limitación en las bases."],
    ["Libro de Reclamaciones", "Se creó el libro virtual. Sus requisitos formales y el plazo de 15 días hábiles no se verificaron en la norma oficial.", "Validarlo con el abogado y asignar un responsable de responder."],
  ]),
  h("2. Normativa consultada"),
  p("Autorización del sorteo: según las fuentes consultadas, el Decreto Legislativo 1246 (2016) retiró a ONAGI la autorización de promociones comerciales, y un artículo de 2026 indica que hoy no existe autorización previa. Son fuentes secundarias: falta confirmarlo en la norma oficial."),
  src("El Comercio: ONAGI ya no autorizará promociones comerciales", "https://elcomercio.pe/economia/peru/onagi-autorizara-fiscalizara-promociones-comerciales-228491-noticia/"),
  src("Impulsa Studio: rifas y sorteos en línea", "https://impulsastudio.pe/blog/rifas-sorteos-online"),
  p("Promociones: la Ley 32323 exige consentimiento libre, previo, informado, expreso e inequívoco, revocable en cualquier momento. La casilla es opcional, separada y desmarcada."),
  src("El Peruano: Ley N.º 32323", "https://busquedas.elperuano.pe/dispositivo/NL/2397811-2"),
  p("Datos personales: rige la Ley 29733 y su reglamento, aprobado por el Decreto Supremo 016-2024-JUS."),
  src("Gob.pe: Decreto Supremo N.º 016-2024-JUS", "https://www.gob.pe/institucion/anpd/normas-legales/6554453-16-2024-jus"),
  p("Empresa: un directorio público asocia el RUC 20513965703 con MATE FACIL EIRL. Confirmar la ficha en SUNAT."),
  src("RUC.pe: Mate Facil EIRL", "https://ruc.pe/mate-facil-eirl/"),
  h("3. Contradicciones entre los dos Word y qué se usó"),
  table([2100, 4338, 3200], ["Tema", "Contradicción", "Se usó"], [
    ["Empresa", "Bases: Mate Fácil E.I.R.L. Informe: Separado Fácil E.I.R.L.", "Mate Fácil E.I.R.L., que coincide con el RUC"],
    ["Documento", "Bases: carnet universitario. Informe: «cuaderno universitario»", "Carnet universitario"],
    ["Enlace de Zoom", "Bases: por el grupo de WhatsApp. Informe: el grupo no puede ser requisito", "Grupo de WhatsApp (opcional) y correo a todos los inscritos"],
    ["Documento adjunto", "Las bases lo listan como dato recopilado, pero lo piden solo al ganador", "Solo al ganador"],
    ["Correo", "Bases, sección 13: informes@tesis-ia (incompleto)", "informes@tesis-ia.com"],
    ["Fecha límite", "El informe la da por pendiente; las bases indican 23 de diciembre", "23 de diciembre"],
  ]),
  h("4. Ajustes al texto de las bases"),
  p("Además de resolver lo anterior: se puso el enlace del formulario, se aclaró la redacción de la vigencia y de los requisitos académicos («y/o»), se unificó el trato en «tú», se precisó que el grupo de WhatsApp es opcional y que muestra el número a los demás miembros y que no autorizar el uso de la imagen no afecta el premio, y se agregó el Libro de Reclamaciones."),
  h("5. Estado de las correcciones del informe"),
  table([4838, 4800], ["Punto", "Estado"], [
    ["Canastas, fechas, Zoom, residencia, correo y aviso de cantidad", "Corregido"],
    ["Grupo obligatorio, sección Comunidad, planes y WhatsApp en la barra", "Retirado de la página del sorteo"],
    ["Cuenta regresiva, nombre en la confirmación y «No llenar»", "Corregido"],
    ["Formulario único de seis campos, sin estado de tesis ni intereses", "Corregido"],
    ["Empresa, bases completas, aviso de Meta, nota del premio y Libro de Reclamaciones", "Agregado"],
    ["Consentimiento de promociones (Ley 32323) y política de privacidad del sorteo", "Agregado"],
    ["Grupo de WhatsApp después de inscribirse", "Preparado y oculto: falta el enlace"],
    ["Herramienta del sorteo y transmisión por Facebook o TikTok", "Pendiente de decisión"],
    ["Envío del enlace de Zoom a los inscritos", "Pendiente: debe enviarlo el equipo"],
  ]),
];
const H = (size, color, before) => ({ run: { font: "Arial", size, bold: true, color }, paragraph: { spacing: { before, after: 120 }, keepNext: true } });
Packer.toBuffer(new Document({ title: "Análisis web y legal del sorteo navideño", styles: { default: { document: { run: { font: "Arial", size: 21 } }, title: H(40, "0B1D3A", 0), heading1: H(27, "1E3A8A", 280) } },
  sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: ["Página ", PageNumber.CURRENT], font: "Arial", size: 16 })] })] }) }, children: body }] }))
  .then((b) => { fs.writeFileSync(path.resolve(__dirname, "../../docs/navidad/Navidad-TesisIA-04-Analisis-legal.docx"), b); console.log("OK"); });
