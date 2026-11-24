<?php
// public/api/navidad.php — Inscripción al sorteo de 25 canastas navideñas (tesis-ia.com/navidad).
// 1) Valida los seis campos y las aceptaciones (mismas opciones que src/config/navidad.ts).
// 2) Una inscripción por persona: DNI, celular y correo no se repiten.
// 3) Guarda en api/data/sorteo-inscritos.csv (carpeta bloqueada por .htaccess). El archivo anterior
//    (navidad-inscritos.csv, condiciones antiguas) no se modifica.
// 4) Avisa a MAIL_TO_REAL y envía la confirmación al participante.

require_once __DIR__ . '/config.php';
date_default_timezone_set('America/Lima');

const NAV_CSV = __DIR__ . '/data/sorteo-inscritos.csv';
// Link del grupo de WhatsApp del sorteo (https://chat.whatsapp.com/...). Vacío = no se muestra.
// Se entrega solo después de inscribirse. Es opcional: no condiciona la participación.
const NAV_GRUPO_WHATSAPP = '';
// Mismas fechas que src/config/navidad.ts y src/config/bases-sorteo.ts
const NAV_CIERRE = '2026-12-19T19:30:00-05:00';
const NAV_SORTEO_TEXTO = 'sábado 19 de diciembre de 2026, 8:00 p. m. (hora de Perú)';
const NAV_BASES_VERSION = '2026-11-24';
const NAV_CONDICIONES = [
    'Estudiante de 8.º ciclo', 'Estudiante de 9.º ciclo', 'Estudiante de 10.º ciclo',
    'Egresado de universidad', 'Bachiller en proceso de obtener el título profesional',
];
const NAV_DISTRITOS = [
    'Ancón', 'Ate', 'Barranco', 'Breña', 'Carabayllo', 'Chaclacayo', 'Chorrillos', 'Cieneguilla', 'Comas', 'El Agustino',
    'Independencia', 'Jesús María', 'La Molina', 'La Victoria', 'Lima (Cercado)', 'Lince', 'Los Olivos', 'Lurigancho-Chosica', 'Lurín',
    'Magdalena del Mar', 'Miraflores', 'Pachacámac', 'Pucusana', 'Pueblo Libre', 'Puente Piedra', 'Punta Hermosa', 'Punta Negra', 'Rímac',
    'San Bartolo', 'San Borja', 'San Isidro', 'San Juan de Lurigancho', 'San Juan de Miraflores', 'San Luis', 'San Martín de Porres',
    'San Miguel', 'Santa Anita', 'Santa María del Mar', 'Santa Rosa', 'Santiago de Surco', 'Surquillo', 'Villa El Salvador', 'Villa María del Triunfo',
];

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') json_response(204, []);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_response(405, ['ok' => false, 'error' => 'Método no permitido.']);

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) $input = $_POST;

// Trampa antispam: finge éxito para no dar pistas al bot
if (!empty($input[HONEYPOT_FIELD])) json_response(200, ['ok' => true, 'codigo' => 'HT-0000']);

if (time() >= strtotime(NAV_CIERRE)) {
    json_response(403, ['ok' => false, 'error' => 'Las inscripciones para el sorteo ya cerraron. ¡Gracias por tu interés!']);
}

// Texto plano limpio (sin HTML, espacios normalizados). Se escapa al mostrar.
$clean = function ($v, int $max = 160): string {
    $v = is_string($v) ? $v : '';
    return mb_substr(trim((string)preg_replace('/\s+/u', ' ', strip_tags($v))), 0, $max);
};
$nombre    = $clean($input['nombre'] ?? '', 120);
$dni       = preg_replace('/\D/', '', $clean($input['dni'] ?? '', 20));
$email     = mb_strtolower($clean($input['email'] ?? '', 160));
$celular   = preg_replace('/\D/', '', $clean($input['celular'] ?? '', 30));
if (strlen($celular) === 11 && strpos($celular, '51') === 0) $celular = substr($celular, 2);
$distrito  = $clean($input['distrito'] ?? '', 60);
$condicion = $clean($input['condicion'] ?? '', 80);
$promos    = !empty($input['acepta_promos']);

$errores = [];
if (mb_strlen($nombre) < 5 || strpos($nombre, ' ') === false) $errores['nombre'] = 'Escribe tus nombres y apellidos.';
if (!preg_match('/^\d{8}$/', $dni))                 $errores['dni'] = 'El DNI tiene 8 dígitos.';
if (!is_valid_email($email))                        $errores['email'] = 'Correo inválido.';
if (!preg_match('/^9\d{8}$/', $celular))            $errores['celular'] = 'Celular peruano inválido.';
if (!in_array($distrito, NAV_DISTRITOS, true))      $errores['distrito'] = 'Selecciona tu distrito.';
if (!in_array($condicion, NAV_CONDICIONES, true))   $errores['condicion'] = 'Selecciona tu condición académica.';
if (empty($input['declara']))                       $errores['declara'] = 'Debes confirmar que cumples los requisitos.';
if (empty($input['acepta_bases']))                  $errores['acepta_bases'] = 'Debes aceptar las bases.';
if ($errores) json_response(422, ['ok' => false, 'error' => 'Revisa los campos marcados.', 'fields' => $errores]);

// Límite por IP (10 s) después de validar, para no castigar errores de tipeo
if (ENABLE_RATE_LIMIT) {
    $lock = sys_get_temp_dir() . '/nav_' . md5($_SERVER['REMOTE_ADDR'] ?? '0') . '.lock';
    if (is_file($lock) && (time() - (int)filemtime($lock)) < 10) {
        json_response(429, ['ok' => false, 'error' => 'Espera unos segundos antes de volver a enviar.']);
    }
    @touch($lock);
}

// Evita fórmulas al abrir el CSV en Excel (CSV injection)
$csvSafe = function (string $v): string { return preg_match('/^[=+\-@\t\r]/', $v) ? "'" . $v : $v; };

// ---- Registro con bloqueo exclusivo: deduplicación + código correlativo atómicos ----
if (!is_dir(dirname(NAV_CSV))) @mkdir(dirname(NAV_CSV), 0750, true);
$fh = @fopen(NAV_CSV, 'c+');
if (!$fh || !flock($fh, LOCK_EX)) {
    json_response(500, ['ok' => false, 'error' => 'No pudimos registrar tu inscripción. Inténtalo en unos minutos.']);
}
$ultimo = 0;
$previo = null;
while (($row = fgetcsv($fh, 0, ',', '"', '')) !== false) {
    if ($row === [null] || ($row[0] ?? '') === 'codigo') continue;
    $ultimo = max($ultimo, (int)preg_replace('/\D/', '', $row[0] ?? ''));
    if (!$previo && (($row[3] ?? '') === $dni || ($row[4] ?? '') === $email || ($row[5] ?? '') === $celular)) $previo = $row;
}
if ($previo) {
    flock($fh, LOCK_UN);
    fclose($fh);
    // La confirmación se reenvía solo al correo con el que se inscribió; aquí no se muestran sus datos.
    nav_enviar_confirmacion($previo[4], explode(' ', ltrim($previo[2], "'"))[0], $previo[0]);
    json_response(409, ['ok' => false, 'duplicado' => true,
        'error' => 'Ya existe una inscripción con este DNI, correo o celular. Reenviamos la confirmación al correo registrado.']);
}
$codigo = sprintf('HT-%04d', $ultimo + 1);
$fecha = date('Y-m-d H:i:s');
fseek($fh, 0, SEEK_END);
if (ftell($fh) === 0) {
    fputcsv($fh, ['codigo', 'fecha', 'nombre', 'dni', 'email', 'celular', 'distrito', 'condicion_academica',
                  'declara_requisitos', 'acepta_bases_version', 'acepta_promociones'], ',', '"', '');
}
$escrito = fputcsv($fh, array_map($csvSafe, [$codigo, $fecha, $nombre, $dni, $email, $celular, $distrito, $condicion,
    'si', NAV_BASES_VERSION, $promos ? 'si' : 'no']), ',', '"', '');
$escrito = fflush($fh) && $escrito;
flock($fh, LOCK_UN);
fclose($fh);
if (!$escrito) json_response(500, ['ok' => false, 'error' => 'No pudimos registrar tu inscripción. Inténtalo en unos minutos.']);

// ---- Aviso interno (no bloquea la inscripción si falla) ----
$filas = ['Código' => $codigo, 'Nombre' => $nombre, 'DNI' => $dni, 'Correo' => $email, 'Celular' => '+51 ' . $celular,
    'Distrito' => $distrito, 'Condición académica' => $condicion, 'Acepta promociones' => $promos ? 'Sí' : 'No', 'Fecha' => $fecha];
$html = '<table style="font-family:Arial,sans-serif;border-collapse:collapse">';
foreach ($filas as $k => $v) {
    $html .= '<tr><td style="padding:6px 12px;color:#64748b">' . $k . '</td><td style="padding:6px 12px"><strong>'
        . htmlspecialchars($v, ENT_QUOTES, 'UTF-8') . '</strong></td></tr>';
}
enviar_correo(MAIL_TO_REAL, "[Sorteo] {$codigo} — {$nombre}", $html . '</table>', $email);

$correo = nav_enviar_confirmacion($email, explode(' ', $nombre)[0], $codigo);
json_response(200, ['ok' => true, 'codigo' => $codigo, 'correo' => $correo, 'grupo' => NAV_GRUPO_WHATSAPP]);

/** Confirmación al participante. Es informativa: no incluye publicidad. */
function nav_enviar_confirmacion(string $email, string $nombre, string $codigo): bool
{
    $h = function (string $v): string { return htmlspecialchars($v, ENT_QUOTES, 'UTF-8'); };
    $bases = SITE_URL . '/condiciones-sorteo/';
    $grupo = NAV_GRUPO_WHATSAPP === '' ? '' :
        '<p style="font-size:14px;color:#334155">Para recibir el enlace de Zoom también por WhatsApp, <a href="' . $h(NAV_GRUPO_WHATSAPP)
        . '">únete al grupo del sorteo</a>. Es opcional y no condiciona el premio. Los demás miembros podrán ver tu número.</p>';
    $html = '<!doctype html><html lang="es"><head><meta charset="utf-8"></head><body style="margin:0;background:#eef2f7;padding:24px 12px">
<table role="presentation" align="center" width="100%" style="max-width:600px;background:#fff;border-radius:16px;border-collapse:separate;overflow:hidden;font-family:Arial,sans-serif;color:#0f172a">
<tr><td style="background:#0B1D3A;padding:18px 28px;color:#fbbf24;font-size:13px;font-weight:bold">Sorteo navideño 2026 · Hispanotech</td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 12px;font-size:24px;color:#0B1D3A">¡Hola, ' . $h($nombre) . '! Tu inscripción quedó registrada</h1>
<p style="font-size:15px;line-height:1.6">Participas en el sorteo de <strong>25 canastas navideñas</strong>. Este es tu código:</p>
<p style="text-align:center"><span style="display:inline-block;border:2px dashed #f59e0b;background:#fffbeb;border-radius:12px;padding:12px 26px;font-size:28px;font-weight:bold;letter-spacing:3px">' . $h($codigo) . '</span></p>
<p style="font-size:15px;line-height:1.7"><strong>Sorteo:</strong> ' . $h(NAV_SORTEO_TEXTO) . ', en vivo por Zoom. Te enviaremos el enlace a este correo antes de la fecha.<br>
<strong>Si ganas:</strong> tienes 48 horas desde el anuncio para responder y debes presentar carnet universitario, constancia de egresado o constancia de bachiller.<br>
<strong>Entrega:</strong> solo en Lima Metropolitana. El costo del envío o recojo lo asume el ganador.</p>' . $grupo . '
<p style="font-size:14px"><a href="' . $bases . '">Lee las bases completas</a> · Consultas: informes@tesis-ia.com</p>
</td></tr>
<tr><td style="background:#f8fafc;padding:16px 28px;font-size:12px;line-height:1.5;color:#475569">Mate Fácil E.I.R.L. · RUC 20513965703 · Alameda Lorenzo de Vidaurre 216, Los Próceres, Surco, Lima.<br>
Promoción no patrocinada, avalada, administrada ni asociada con Meta. Recibes este correo porque te inscribiste en tesis-ia.com/navidad.</td></tr>
</table></body></html>';
    return enviar_correo($email, "Tu código del sorteo es {$codigo}", $html, MAIL_REPLY_TO, 'Hispanotech - Tesis IA');
}
