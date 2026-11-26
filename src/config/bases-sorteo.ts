// Bases completas del sorteo (texto de /condiciones-sorteo).
// Fuente: bases-sorteo-canastas-HT.docx. Los ajustes hechos al texto están explicados en
// docs/navidad/Navidad-TesisIA-04-Analisis-legal.docx.
import { AVISO_PLATAFORMAS } from "./navidad";

export const BASES_VERSION = "26 de noviembre de 2026";
type Bloque = { p?: string; ul?: string[]; ol?: string[] };
export const BASES: { id: string; titulo: string; bloques: Bloque[] }[] = [
  { id: "organizador", titulo: "Organizador", bloques: [
    { p: "La promoción es organizada por MATE FÁCIL E.I.R.L., con RUC 20513965703, promotora de Hispanotech y con domicilio en Alameda Lorenzo de Vidaurre 216, Los Próceres, Surco, Lima, Perú. La marca de la promoción es Hispanotech y la página oficial es tesis-ia.com." },
    { p: "Consultas: informes@tesis-ia.com" } ] },
  { id: "vigencia", titulo: "Vigencia", bloques: [
    { p: "La promoción inicia con su publicación en tesis-ia.com. Las inscripciones cierran el sábado 19 de diciembre de 2026 a las 7:30 p. m. (hora de Perú) y el sorteo se realiza el mismo día a las 8:00 p. m. (hora de Perú)." } ] },
  { id: "participantes", titulo: "Quiénes pueden participar", bloques: [
    { ul: [
      "Personas mayores de 18 años.",
      "Que residan en Lima Metropolitana, zona donde se entrega el premio.",
      "Que cumplan al menos una de estas condiciones: cursar el 8.º, 9.º o 10.º ciclo de una universidad; ser egresado de una universidad; o ser bachiller y estar en proceso de obtener el título profesional." ] },
    { p: "Si resultas ganador, deberás presentar carnet universitario, constancia de egresado o constancia de bachiller. Si no lo presentas, no se entrega la canasta y se asigna el suplente correspondiente. Mate Fácil E.I.R.L. - Hispano Tech se reserva el derecho de consultar bases de datos académicas, como la de SUNEDU u otras, para verificar la situación académica del participante." },
    { p: "No pueden participar los colaboradores de Mate Fácil E.I.R.L. ni de Hispanotech, ni sus familiares directos." } ] },
  { id: "como-participar", titulo: "Cómo participar", bloques: [
    { ol: [
      "Ingresa al formulario de inscripción en tesis-ia.com/navidad, completa tus datos y acepta las presentes bases. La casilla para recibir promociones es opcional y viene desmarcada.",
      "Únete al grupo de WhatsApp del sorteo.",
      "Recibe tu código de participación.",
      "Únete a la sesión de Zoom del sorteo. El enlace se comparte con todos los inscritos, antes de la fecha, a través del grupo de WhatsApp y al correo que registraron." ] },
    { p: "La participación es gratuita y no requiere ninguna compra. Cada persona puede inscribirse una sola vez. Son requisitos para participar registrarse en el formulario y unirse al grupo de WhatsApp del sorteo. Los miembros del grupo pueden ver el número y el perfil de los demás." } ] },
  { id: "premios", titulo: "Premios", bloques: [
    { p: "Se sortearán 25 canastas navideñas y regalos sorpresa. Cada canasta incluye productos navideños, entre ellos panetón y café embolsado y, en algunos casos, tomatodo. El contenido exacto puede variar según disponibilidad, sin reducir el valor del premio. Los premios no son canjeables por dinero en efectivo." } ] },
  { id: "sorteo", titulo: "Sorteo y selección de ganadores", bloques: [
    { ul: [
      "Fecha y hora: sábado 19 de diciembre de 2026, 8:00 p. m. (hora de Perú).",
      "Método: selección aleatoria en vivo, por Zoom, a partir de la lista de inscritos que cumplen las bases. Se utiliza una herramienta de sorteo aleatorio ante los participantes.",
      "Ganadores: 25 ganadores y 10 suplentes, en el orden en que sean seleccionados.",
      "Número de canastas: las 25 canastas se sortean al alcanzar la meta de 1000 participantes. Si participan menos de 1000 personas, Mate Fácil E.I.R.L. podrá sortear un número menor de canastas y lo comunicará a los inscritos antes del sorteo.",
      "Anuncio: los resultados se anuncian durante la sesión y se comunican al correo electrónico registrado.",
      "Confirmación: el ganador debe responder dentro de las 48 horas posteriores al anuncio. Si no responde, o no cumple las condiciones, se asigna el suplente correspondiente." ] },
    { p: "Si el sorteo debe postergarse por causas de fuerza mayor, se comunicará la nueva fecha a todos los inscritos al correo electrónico registrado." } ] },
  { id: "entrega", titulo: "Entrega del premio", bloques: [
    { ul: [
      "La entrega se realiza únicamente en Lima Metropolitana.",
      "El envío o recojo se coordina con el ganador por correo electrónico o llamada, y su costo lo asume el ganador.",
      "La entrega debe coordinarse como máximo hasta el 23 de diciembre de 2026." ] } ] },
  { id: "datos", titulo: "Datos personales", bloques: [
    { p: "Mate Fácil E.I.R.L. trata los datos que entregas de la siguiente manera:" },
    { ul: [
      "Datos recopilados: nombres y apellidos, DNI, correo electrónico, celular, especialidad, distrito de residencia, condición académica y situación de la tesis. El documento que acredita la condición académica se solicita solo a los ganadores.",
      "Finalidad: administrar el sorteo, verificar la situación académica de los participantes en bases de datos académicas como la de SUNEDU, contactar a los ganadores y coordinar la entrega del premio.",
      "Promociones: solo si marcas la casilla correspondiente, que viene desmarcada por defecto, aceptas recibir comunicaciones comerciales.",
      "Conservación: los datos se conservan por el tiempo necesario para cumplir estas finalidades y las obligaciones legales aplicables.",
      "Derechos: puedes acceder, rectificar, cancelar u oponerte al tratamiento de tus datos, así como revocar tu consentimiento para promociones, escribiendo a informes@tesis-ia.com." ] } ] },
  { id: "imagen", titulo: "Imagen de los ganadores", bloques: [
    { p: "Si resultas ganador, puedes autorizar por escrito el uso de tu nombre e imagen para difundir el sorteo en las redes de Hispanotech. No autorizarlo no afecta la entrega del premio." } ] },
  { id: "conducta", titulo: "Conducta durante el sorteo", bloques: [
    { p: "Se espera un trato respetuoso en la sesión de Zoom, en el grupo de WhatsApp y en los demás canales de comunicación. Mate Fácil E.I.R.L. puede excluir a quien incumpla estas bases o intente afectar el desarrollo de la promoción." } ] },
  { id: "cambios", titulo: "Cambios en la promoción", bloques: [
    { p: "Mate Fácil E.I.R.L. puede modificar estas bases por causas justificadas, sin reducir los premios anunciados. Cualquier cambio se publicará en tesis-ia.com. Si un producto de la canasta no está disponible, se reemplaza por otro de igual o mayor valor." } ] },
  { id: "plataformas", titulo: "Redes sociales y plataformas", bloques: [
    { p: AVISO_PLATAFORMAS + " Las redes sociales se usan solo como medio de difusión, sin perjuicio de los derechos que la ley reconoce a los consumidores." } ] },
  { id: "reclamos", titulo: "Consultas, reclamos y legislación", bloques: [
    { p: "Para consultas o reclamos sobre la promoción, escribe a informes@tesis-ia.com o usa el Libro de Reclamaciones virtual. Estas bases se rigen por las leyes de la República del Perú, incluido el Código de Protección y Defensa del Consumidor." } ] },
];
