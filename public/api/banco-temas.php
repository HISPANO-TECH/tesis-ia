<?php
// public/api/banco-temas.php — Lead magnet "Banco de temas de tesis 2027-2030".
// 1) Valida el formulario (nombre, WhatsApp, correo, carrera, situación de la tesis).
// 2) Guarda el registro en api/data/banco-temas-registros.csv (no se envía a la hoja de Google)
//    y avisa a BT_AVISO (informes@asesorestesisperu.com).
// 3) Responde con el PDF de la carrera (api/data/banco-temas/<carrera>.pdf, bloqueado a la web).
require_once __DIR__ . '/config.php';
date_default_timezone_set('America/Lima');

const BT_CSV = __DIR__ . '/data/banco-temas-registros.csv';
const BT_PDFS = __DIR__ . '/data/banco-temas';
// Correo que recibe el aviso de cada descarga (distinto al de los demás formularios)
const BT_AVISO = 'informes@asesorestesisperu.com';
const BT_CARRERAS = [
    'administracion' => 'Administración de Empresas', 'contabilidad' => 'Contabilidad',
    'marketing-negocios-internacionales' => 'Marketing y Negocios Internacionales', 'ingenieria-civil' => 'Ingeniería Civil',
    'ingenieria-industrial' => 'Ingeniería Industrial', 'ingenieria-sistemas' => 'Ingeniería de Sistemas / Cómputo',
    'ingenieria-ambiental' => 'Ingeniería Ambiental', 'psicologia' => 'Psicología', 'medicina-humana' => 'Medicina Humana',
    'enfermeria' => 'Enfermería', 'derecho' => 'Derecho', 'educacion' => 'Educación (Inicial / Primaria)',
    'ciencias-comunicacion' => 'Ciencias de la Comunicación',
];
const BT_SITUACIONES = ['En cero, recién iniciando', 'Plan de tesis aprobado', 'Plan aprobado y avanzando el informe', 'Levantamiento de observaciones'];
const BT_COLUMNAS = ['Fecha', 'Nombre', 'WhatsApp', 'Correo', 'Carrera', 'Situación de la tesis', 'Acepta privacidad', 'Acepta promociones'];

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') json_response(204, []);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_response(405, ['ok' => false, 'error' => 'Método no permitido.']);
$in = $_POST;
if (!empty($in[HONEYPOT_FIELD])) json_response(422, ['ok' => false, 'error' => 'No pudimos procesar el formulario.']);

$clean = function ($v, int $max): string {
    return mb_substr(trim((string)preg_replace('/\s+/u', ' ', strip_tags(is_string($v) ? $v : ''))), 0, $max);
};
$nombre = $clean($in['nombre'] ?? '', 120);
$correo = mb_strtolower($clean($in['correo'] ?? '', 160));
$celular = preg_replace('/\D/', '', $clean($in['celular'] ?? '', 30));
if (strlen($celular) === 11 && strpos($celular, '51') === 0) $celular = substr($celular, 2);
$carrera = $clean($in['carrera'] ?? '', 60);
$situacion = $clean($in['situacion'] ?? '', 60);
$promos = !empty($in['promos']);

$err = [];
if (mb_strlen($nombre) < 5 || strpos($nombre, ' ') === false) $err['nombre'] = 'Escribe tus nombres y apellidos.';
if (!preg_match('/^9\d{8}$/', $celular)) $err['celular'] = 'Celular peruano inválido.';
if (!is_valid_email($correo)) $err['correo'] = 'Correo inválido.';
if (!isset(BT_CARRERAS[$carrera])) $err['carrera'] = 'Selecciona tu carrera.';
if (!in_array($situacion, BT_SITUACIONES, true)) $err['situacion'] = 'Selecciona la situación de tu tesis.';
if (empty($in['privacidad'])) $err['privacidad'] = 'Debes aceptar la política de privacidad.';
if ($err) json_response(422, ['ok' => false, 'error' => 'Revisa los campos marcados.', 'fields' => $err]);

$pdf = BT_PDFS . '/' . $carrera . '.pdf';
if (!is_file($pdf)) json_response(500, ['ok' => false, 'error' => 'El archivo de tu carrera no está disponible. Escríbenos a informes@tesis-ia.com.']);

if (ENABLE_RATE_LIMIT) {
    $lock = sys_get_temp_dir() . '/bt_' . md5($_SERVER['REMOTE_ADDR'] ?? '0') . '.lock';
    if (is_file($lock) && (time() - (int)filemtime($lock)) < 10) json_response(429, ['ok' => false, 'error' => 'Espera unos segundos antes de volver a intentar.']);
    @touch($lock);
}

// ---- Registro en el CSV del hosting. Cada descarga queda registrada.
$fila = [date('Y-m-d H:i:s'), $nombre, $celular, $correo, BT_CARRERAS[$carrera], $situacion, 'si', $promos ? 'si' : 'no'];
$fila = array_map(function ($v) { return preg_match('/^[=+\-@\t\r]/', $v) ? "'" . $v : $v; }, $fila);
if (!is_dir(dirname(BT_CSV))) @mkdir(dirname(BT_CSV), 0750, true);
$fh = @fopen(BT_CSV, 'a');
if (!$fh || !flock($fh, LOCK_EX)) json_response(500, ['ok' => false, 'error' => 'No pudimos registrar tus datos. Inténtalo en unos minutos.']);
if (filesize(BT_CSV) === 0) fputcsv($fh, BT_COLUMNAS, ',', '"', '');
fputcsv($fh, $fila, ',', '"', '');
fflush($fh);
flock($fh, LOCK_UN);
fclose($fh);

// ---- Aviso a BT_AVISO (si falla, el registro igual quedó en el CSV)
$html = '<table style="font-family:Arial,sans-serif;border-collapse:collapse">';
foreach (array_combine(BT_COLUMNAS, $fila) as $k => $v) {
    $html .= '<tr><td style="padding:6px 12px;color:#64748b">' . $k . '</td><td style="padding:6px 12px"><strong>'
        . htmlspecialchars($v, ENT_QUOTES, 'UTF-8') . '</strong></td></tr>';
}
enviar_correo(BT_AVISO, '[Banco de temas] ' . $nombre . ' — ' . BT_CARRERAS[$carrera], $html . '</table>', $correo);

// ---- Entrega del PDF
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="banco-temas-tesis-' . $carrera . '.pdf"');
header('Content-Length: ' . filesize($pdf));
header('Cache-Control: no-store');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Expose-Headers: Content-Disposition');
readfile($pdf);
exit;
