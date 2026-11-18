<?php
// public/api/navidad.php — Inscripción al sorteo "50 Canastas Navideñas" (tesis-ia.com/navidad).
// 1) Valida los datos contra las mismas opciones del formulario (src/config/navidad.ts).
// 2) Evita duplicados por WhatsApp o correo (1 inscripción por persona).
// 3) Guarda la inscripción en api/data/navidad-inscritos.csv (carpeta bloqueada por .htaccess)
//    con un código correlativo NAV-0001, NAV-0002…
// 4) Notifica por correo a MAIL_TO_REAL. Si el correo falla, la inscripción igual queda guardada.

require_once __DIR__ . '/config.php';
date_default_timezone_set('America/Lima');

const NAV_CSV = __DIR__ . '/data/navidad-inscritos.csv';
// POR CONFIRMAR: misma fecha que src/config/navidad.ts (cierreInscripciones)
const NAV_CIERRE = '2026-12-20T23:59:00-05:00';

const NAV_ETAPAS = [
    'Octavo ciclo', 'Noveno ciclo', 'Décimo ciclo', 'Egresado', 'Bachiller', 'Titulado',
    'Estudiante de maestría', 'Egresado de maestría', 'Estudiante de doctorado', 'Otro',
];
const NAV_SITUACIONES = [
    'Todavía no tengo tema de tesis.',
    'Tengo un tema, pero todavía no tengo avances.',
    'Tengo un tema y algunos avances de investigación.',
    'Tengo mi plan o proyecto de tesis elaborado.',
    'Tengo mi plan de tesis aprobado y estoy desarrollando la investigación.',
    'Estoy desarrollando el informe final de tesis.',
    'Tengo el informe terminado y estoy pendiente de revisión o sustentación.',
    'Mi tesis fue observada y necesito levantar las observaciones.',
    'Ya terminé mi tesis y quiero publicar un artículo científico.',
    'Todavía no necesito realizar una tesis.',
];
const NAV_APOYOS = [
    'Encontrar un tema de tesis.',
    'Aprender a desarrollar mi tesis con inteligencia artificial.',
    'Aprender metodología de investigación.',
    'Aprender análisis estadístico (SPSS, Stata, R).',
    'Recibir asesoría para terminar mi tesis.',
    'Publicar un artículo científico.',
    'Capacitarme en herramientas de IA para investigación.',
    'Por ahora, solamente deseo participar en el sorteo.',
];

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    json_response(204, []);
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(405, ['ok' => false, 'error' => 'Método no permitido.']);
}

$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!is_array($input)) {
    $input = $_POST;
}

// Honeypot: finge éxito para no dar pistas al bot
if (!empty($input[HONEYPOT_FIELD])) {
    json_response(200, ['ok' => true, 'codigo' => 'NAV-0000']);
}

if (time() > strtotime(NAV_CIERRE)) {
    json_response(403, ['ok' => false, 'error' => 'Las inscripciones para el sorteo ya cerraron. ¡Gracias por tu interés!']);
}

// Rate limit por IP (20 s)
if (ENABLE_RATE_LIMIT) {
    $lock = sys_get_temp_dir() . '/nav_' . md5($_SERVER['REMOTE_ADDR'] ?? '0') . '.lock';
    if (is_file($lock) && (time() - (int)filemtime($lock)) < 20) {
        json_response(429, ['ok' => false, 'error' => 'Espera unos segundos antes de volver a enviar.']);
    }
    @touch($lock);
}

// Texto plano limpio (sin HTML, espacios normalizados). Se escapa al mostrar.
$clean = function ($v, int $max = 160): string {
    $v = is_string($v) ? $v : '';
    $v = trim(preg_replace('/\s+/u', ' ', strip_tags($v)));
    return mb_substr($v, 0, $max);
};

$nombre    = $clean($input['nombre'] ?? '', 120);
$whatsapp  = preg_replace('/\D/', '', (string)($input['whatsapp'] ?? ''));
if (strlen($whatsapp) === 11 && str_starts_with($whatsapp, '51')) $whatsapp = substr($whatsapp, 2);
$email     = mb_strtolower($clean($input['email'] ?? '', 160));
$etapa     = $clean($input['etapa'] ?? '', 60);
$carrera   = $clean($input['carrera'] ?? '', 120);
$situacion = $clean($input['situacion'] ?? '', 120);
$apoyosIn  = $input['apoyo'] ?? [];
$apoyos    = array_values(array_unique(array_filter(
    array_map(fn($a) => $clean($a, 120), is_array($apoyosIn) ? $apoyosIn : [$apoyosIn]),
    fn($a) => in_array($a, NAV_APOYOS, true)
)));
$aceptaBases  = !empty($input['acepta_bases']);
$aceptaPromos = !empty($input['acepta_promos']);

$errores = [];
if (mb_strlen($nombre) < 5 || !str_contains($nombre, ' ')) $errores['nombre'] = 'Escribe tus nombres y apellidos.';
if (!preg_match('/^9\d{8}$/', $whatsapp))                   $errores['whatsapp'] = 'Celular peruano inválido.';
if (!is_valid_email($email))                                 $errores['email'] = 'Correo inválido.';
if (!in_array($etapa, NAV_ETAPAS, true))                     $errores['etapa'] = 'Selecciona tu etapa académica.';
if (mb_strlen($carrera) < 3)                                 $errores['carrera'] = 'Indica tu carrera.';
if (!in_array($situacion, NAV_SITUACIONES, true))            $errores['situacion'] = 'Selecciona tu situación de tesis.';
if (!$apoyos)                                                $errores['apoyo'] = 'Marca al menos una opción.';
if (!$aceptaBases)                                           $errores['acepta_bases'] = 'Debes aceptar las bases.';
if ($errores) {
    json_response(422, ['ok' => false, 'error' => 'Revisa los campos marcados.', 'fields' => $errores]);
}

// Evita fórmulas al abrir el CSV en Excel (CSV injection)
$csvSafe = fn(string $v): string => preg_match('/^[=+\-@\t\r]/', $v) ? "'" . $v : $v;

// ---- Registro con bloqueo exclusivo: deduplicación + código correlativo atómicos ----
if (!is_dir(dirname(NAV_CSV))) @mkdir(dirname(NAV_CSV), 0750, true);
$fh = @fopen(NAV_CSV, 'c+');
if (!$fh || !flock($fh, LOCK_EX)) {
    json_response(500, ['ok' => false, 'error' => 'No pudimos registrar tu inscripción. Inténtalo en unos minutos.']);
}
$total = 0;
$duplicado = false;
rewind($fh);
while (($row = fgetcsv($fh, 0, ',', '"', '')) !== false) {
    if ($row === [null] || ($row[0] ?? '') === 'codigo') continue;
    $total++;
    if (($row[3] ?? '') === $whatsapp || ($row[4] ?? '') === $email) $duplicado = true;
}
if ($duplicado) {
    flock($fh, LOCK_UN); fclose($fh);
    json_response(409, ['ok' => false, 'duplicado' => true,
        'error' => 'Este número de WhatsApp o correo ya está inscrito. ¡Ya estás participando! Recuerda unirte al grupo de WhatsApp.']);
}
$codigo = sprintf('NAV-%04d', $total + 1);
$fecha  = date('Y-m-d H:i:s');
fseek($fh, 0, SEEK_END);
if ($total === 0 && ftell($fh) === 0) {
    fputcsv($fh, ['codigo', 'fecha', 'nombre', 'whatsapp', 'email', 'etapa', 'carrera', 'situacion_tesis',
                  'apoyo', 'acepta_bases', 'acepta_promociones', 'ip'], ',', '"', '');
}
fputcsv($fh, array_map($csvSafe, [
    $codigo, $fecha, $nombre, $whatsapp, $email, $etapa, $carrera, $situacion,
    implode(' | ', $apoyos), 'si', $aceptaPromos ? 'si' : 'no', $_SERVER['REMOTE_ADDR'] ?? '',
]), ',', '"', '');
fflush($fh);
flock($fh, LOCK_UN);
fclose($fh);

// ---- Notificación por correo (no bloquea la inscripción si falla) ----
$e = fn(string $v): string => htmlspecialchars($v, ENT_QUOTES, 'UTF-8');
$row = fn(string $k, string $v): string =>
    "<tr><td style='padding:7px 12px;color:#64748b;font-size:13px'>{$k}</td><td style='padding:7px 12px;color:#0f172a;font-weight:600'>{$e($v)}</td></tr>";
$subject = "[Navidad] {$codigo} — {$nombre} — {$etapa}";
$html = '<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden">
  <div style="background:#0B1D3A;padding:18px 24px;color:#fff;font-size:18px;font-weight:700">🎄 Sorteo 50 Canastas — <span style="color:#f59e0b">' . $codigo . '</span></div>
  <table style="width:100%;border-collapse:collapse;padding:6px 12px">'
    . $row('Nombre', $nombre) . $row('WhatsApp', '+51 ' . $whatsapp) . $row('Correo', $email)
    . $row('Etapa', $etapa) . $row('Carrera', $carrera) . $row('Tesis', $situacion)
    . $row('Apoyo de interés', implode(' / ', $apoyos)) . $row('Acepta promociones', $aceptaPromos ? 'Sí' : 'No')
  . '</table>
  <div style="background:#fffbeb;padding:10px 24px;font-size:12px;color:#92400e">tesis-ia.com/navidad · ' . $fecha . '</div>
</div>';
$headers  = "From: " . MAIL_FROM_NAME . " <" . MAIL_FROM . ">\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n";
@mail(MAIL_TO_REAL, '=?UTF-8?B?' . base64_encode($subject) . '?=', $html, $headers, '-f ' . MAIL_FROM);

json_response(200, [
    'ok' => true,
    'codigo' => $codigo,
    'message' => "¡Listo, {$e(explode(' ', $nombre)[0])}! Tu código es {$codigo}.",
]);
