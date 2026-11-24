<?php
// public/api/navidad.php — Inscripción al sorteo "25 Canastas Navideñas" (tesis-ia.com/navidad).
// 1) Valida los datos contra las mismas opciones del formulario (src/config/navidad.ts).
// 2) Evita duplicados por WhatsApp o correo (1 inscripción por persona).
// 3) Guarda la inscripción en api/data/navidad-inscritos.csv (carpeta bloqueada por .htaccess)
//    con un código correlativo NAV-0001, NAV-0002…
// 4) Notifica por correo a MAIL_TO_REAL y envía al participante su confirmación (código,
//    botón del grupo de WhatsApp y fecha del sorteo). Si un correo falla, la inscripción igual queda guardada.

require_once __DIR__ . '/config.php';
date_default_timezone_set('America/Lima');

const NAV_CSV = __DIR__ . '/data/navidad-inscritos.csv';
// POR CONFIRMAR: link de invitación real del grupo. Solo se entrega tras un registro válido
// (nunca se escribe en el HTML, así nadie entra al grupo sin dejar sus datos).
const NAV_GRUPO_WHATSAPP = 'https://chat.whatsapp.com/HISPANOTECH-NAVIDAD-2026';
// POR CONFIRMAR: mismas fechas que src/config/navidad.ts
const NAV_CIERRE = '2026-12-14T23:59:00-05:00';
const NAV_CIERRE_TEXTO = '14 de diciembre de 2026, 11:59 p. m.';
const NAV_SORTEO_TEXTO = '16 de diciembre de 2026, 8:00 p. m. (hora de Perú)';
const NAV_CANAL_SORTEO = 'en vivo por Facebook y TikTok de HispanoTech';

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
if (strlen($whatsapp) === 11 && strpos($whatsapp, '51') === 0) $whatsapp = substr($whatsapp, 2);
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
if (mb_strlen($nombre) < 5 || strpos($nombre, ' ') === false) $errores['nombre'] = 'Escribe tus nombres y apellidos.';
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
$codigoExistente = '';
$emailExistente = '';
$nombreExistente = '';
rewind($fh);
while (($row = fgetcsv($fh, 0, ',', '"', '')) !== false) {
    if ($row === [null] || ($row[0] ?? '') === 'codigo') continue;
    $total++;
    if (!$duplicado && (($row[3] ?? '') === $whatsapp || ($row[4] ?? '') === $email)) {
        $duplicado = true;
        $codigoExistente = $row[0] ?? '';
        $nombreExistente = ltrim($row[2] ?? '', "'");
        $emailExistente = $row[4] ?? '';
    }
}
if ($duplicado) {
    flock($fh, LOCK_UN); fclose($fh);
    // Ya registrado: se le vuelve a mostrar su código y el acceso al grupo (ya dejó sus datos)
    // y se le REENVÍA la confirmación al correo con el que se inscribió (no al que escribió ahora).
    $codigoExistente = ltrim($codigoExistente, "'");
    $reenviado = $emailExistente !== '' && is_valid_email($emailExistente)
        && nav_enviar_confirmacion($emailExistente, explode(' ', $nombreExistente)[0] ?: 'participante', $codigoExistente);
    json_response(409, ['ok' => false, 'duplicado' => true, 'codigo' => $codigoExistente,
        'grupo' => NAV_GRUPO_WHATSAPP, 'correo' => $reenviado,
        'error' => 'Este número de WhatsApp o correo ya está inscrito. ¡Ya estás participando! Te reenviamos la confirmación a tu correo.']);
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
  <div style="background:#0B1D3A;padding:18px 24px;color:#fff;font-size:18px;font-weight:700">🎄 Sorteo 25 Canastas — <span style="color:#f59e0b">' . $codigo . '</span></div>
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
if (!@mail(MAIL_TO_REAL, '=?UTF-8?B?' . base64_encode($subject) . '?=', $html, $headers, '-f ' . MAIL_FROM)) {
    @file_put_contents(sys_get_temp_dir() . '/mail_errors.log',
        '[' . date('c') . "] FAIL navidad.php aviso interno ({$codigo})" . PHP_EOL, FILE_APPEND);
}

// ---- Confirmación al participante (código + grupo de WhatsApp + fecha del sorteo) ----
$correoEnviado = nav_enviar_confirmacion($email, explode(' ', $nombre)[0], $codigo);

json_response(200, [
    'ok' => true,
    'codigo' => $codigo,
    'grupo' => NAV_GRUPO_WHATSAPP,
    'correo' => $correoEnviado, // true si el servidor aceptó enviar la confirmación
    'message' => "¡Listo, {$e(explode(' ', $nombre)[0])}! Tu código es {$codigo}.",
]);

/**
 * Correo de confirmación al participante. Multipart (texto + HTML) para mejor entrega.
 * Si falla, solo se registra en el log: la inscripción ya quedó guardada.
 */
function nav_enviar_confirmacion(string $email, string $nombre, string $codigo): bool
{
    $h = fn(string $v): string => htmlspecialchars($v, ENT_QUOTES, 'UTF-8');
    $grupo = NAV_GRUPO_WHATSAPP;
    $img = SITE_URL . '/navidad/og-navidad.jpg';
    $web = SITE_URL . '/navidad';
    $subject = "🎄 ¡Ya estás participando! Tu código es {$codigo}";

    $text = "¡Hola, {$nombre}!\n\n"
        . "Tu inscripción al sorteo de las 25 Canastas Navideñas de HispanoTech quedó registrada.\n\n"
        . "Tu código de participación: {$codigo}\n"
        . "Guárdalo: con él identificamos a los ganadores.\n\n"
        . "ÚLTIMO PASO OBLIGATORIO: únete al grupo de WhatsApp para que tu participación sea válida:\n{$grupo}\n\n"
        . "Sorteo: " . NAV_SORTEO_TEXTO . ", " . NAV_CANAL_SORTEO . ".\n"
        . "Los ganadores se anuncian en el grupo y les escribimos al WhatsApp registrado.\n\n"
        . "Importante: la participación es gratuita. Nunca te pediremos pagos ni datos bancarios para entregarte tu canasta.\n\n"
        . "¡Felices fiestas!\nComunidad HispanoTech · {$web}\n";

    $html = '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#eef2f7">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
  <tr><td style="background:#0B1D3A;padding:18px 28px;color:#fbbf24;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">Campaña navideña 2026 · HispanoTech</td></tr>
  <tr><td><img src="' . $h($img) . '" width="600" alt="Canasta navideña HispanoTech" style="display:block;width:100%;max-width:600px;height:auto;border:0"></td></tr>
  <tr><td style="padding:30px 28px 8px">
    <h1 style="margin:0;font-size:26px;line-height:1.25;color:#0B1D3A">¡Hola, ' . $h($nombre) . '! Ya estás participando 🎄</h1>
    <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:#334155">Tu inscripción al sorteo de las <strong>25 Canastas Navideñas</strong> de HispanoTech quedó registrada.</p>
  </td></tr>
  <tr><td align="center" style="padding:22px 28px 6px">
    <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:1px">Tu código de participación</p>
    <div style="display:inline-block;border:2px dashed #f59e0b;background:#fffbeb;border-radius:14px;padding:12px 26px;font-size:30px;font-weight:bold;letter-spacing:4px;color:#0B1D3A">' . $h($codigo) . '</div>
    <p style="margin:10px 0 0;font-size:13px;color:#64748b">Guárdalo: con él identificamos a los ganadores.</p>
  </td></tr>
  <tr><td style="padding:26px 28px 6px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border-left:4px solid #dc2626;border-radius:10px">
      <tr><td style="padding:16px 18px;font-size:15px;line-height:1.5;color:#991b1b"><strong>Último paso obligatorio:</strong> únete al grupo de WhatsApp para que tu participación sea válida.</td></tr>
    </table>
  </td></tr>
  <tr><td align="center" style="padding:18px 28px 8px">
    <a href="' . $h($grupo) . '" style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;font-weight:bold;font-size:16px;padding:15px 30px;border-radius:999px">Unirme al grupo de WhatsApp</a>
  </td></tr>
  <tr><td style="padding:24px 28px 4px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px">
      <tr><td style="padding:16px 18px;font-size:14px;line-height:1.7;color:#334155">
        <strong style="color:#0B1D3A">📅 Sorteo:</strong> ' . $h(NAV_SORTEO_TEXTO) . ', ' . $h(NAV_CANAL_SORTEO) . '.<br>
        <strong style="color:#0B1D3A">🏆 Ganadores:</strong> se anuncian en el grupo y les escribimos al WhatsApp que registraste.<br>
        <strong style="color:#0B1D3A">🔒 Gratis y seguro:</strong> nunca te pediremos pagos ni datos bancarios para entregarte tu canasta.
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:22px 28px 30px;font-size:15px;line-height:1.6;color:#334155">¡Mucha suerte y felices fiestas!<br><strong style="color:#0B1D3A">Comunidad HispanoTech</strong></td></tr>
  <tr><td style="background:#fffbeb;padding:14px 28px;font-size:12px;line-height:1.5;color:#92400e">Recibes este correo porque te inscribiste en <a href="' . $h($web) . '" style="color:#92400e">tesis-ia.com/navidad</a>. Si no fuiste tú, puedes ignorarlo.</td></tr>
</table>
</td></tr></table>
</body></html>';

    $b = 'nav_' . md5(uniqid((string)mt_rand(), true));
    $headers  = "From: HispanoTech - Tesis IA <" . MAIL_FROM . ">\r\n";
    $headers .= "Reply-To: " . MAIL_TO_REAL . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: multipart/alternative; boundary=\"{$b}\"\r\n";
    $body  = "--{$b}\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($text)) . "\r\n";
    $body .= "--{$b}\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($html)) . "\r\n";
    $body .= "--{$b}--";

    $ok = @mail($email, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers, '-f ' . MAIL_FROM);
    if (!$ok) {
        @file_put_contents(sys_get_temp_dir() . '/mail_errors.log',
            '[' . date('c') . "] FAIL navidad.php confirmacion a {$email} ({$codigo})\n", FILE_APPEND);
    }
    return $ok;
}
