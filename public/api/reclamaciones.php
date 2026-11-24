<?php
// public/api/reclamaciones.php — Libro de Reclamaciones virtual de Mate Fácil E.I.R.L. (tesis-ia.com).
// Guarda cada hoja con número correlativo en api/data/reclamaciones.csv (carpeta bloqueada) y
// envía copia al consumidor y al proveedor.
require_once __DIR__ . '/config.php';
date_default_timezone_set('America/Lima');
const REC_CSV = __DIR__ . '/data/reclamaciones.csv';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_response(405, ['ok' => false, 'error' => 'Método no permitido.']);
$in = $_POST;
if (!empty($in[HONEYPOT_FIELD])) json_response(200, ['ok' => true, 'numero' => 'LR-0000']);

$clean = function ($v, int $max): string {
    return mb_substr(trim(strip_tags(is_string($v) ? $v : '')), 0, $max);
};
$d = [];
foreach (['nombre' => 120, 'documento' => 20, 'domicilio' => 200, 'telefono' => 20, 'email' => 160, 'apoderado' => 120,
          'bien' => 20, 'monto' => 20, 'descripcion' => 300, 'tipo' => 20, 'detalle' => 3000, 'pedido' => 2000] as $k => $max) {
    $d[$k] = $clean($in[$k] ?? '', $max);
}
$err = [];
if (mb_strlen($d['nombre']) < 5) $err['nombre'] = 1;
if (!preg_match('/^[0-9A-Za-z]{8,12}$/', $d['documento'])) $err['documento'] = 1;
if (mb_strlen($d['domicilio']) < 5) $err['domicilio'] = 1;
if (!preg_match('/^[0-9 +]{7,15}$/', $d['telefono'])) $err['telefono'] = 1;
if (!is_valid_email($d['email'])) $err['email'] = 1;
if (!in_array($d['bien'], ['Producto', 'Servicio'], true)) $err['bien'] = 1;
if (!in_array($d['tipo'], ['Reclamo', 'Queja'], true)) $err['tipo'] = 1;
foreach (['descripcion', 'detalle', 'pedido'] as $k) if (mb_strlen($d[$k]) < 5) $err[$k] = 1;
if ($err) json_response(422, ['ok' => false, 'error' => 'Completa los campos obligatorios.', 'fields' => $err]);

if (!is_dir(dirname(REC_CSV))) @mkdir(dirname(REC_CSV), 0750, true);
$fh = @fopen(REC_CSV, 'c+');
if (!$fh || !flock($fh, LOCK_EX)) json_response(500, ['ok' => false, 'error' => 'No pudimos registrar tu hoja. Inténtalo en unos minutos.']);
$n = 0;
while (($row = fgetcsv($fh, 0, ',', '"', '')) !== false) {
    if (($row[0] ?? '') !== 'numero') $n = max($n, (int)preg_replace('/\D/', '', $row[0] ?? ''));
}
$numero = sprintf('LR-%05d', $n + 1);
$fecha = date('d/m/Y H:i');
fseek($fh, 0, SEEK_END);
if (ftell($fh) === 0) fputcsv($fh, array_merge(['numero', 'fecha'], array_keys($d), ['respuesta_proveedor', 'fecha_respuesta']), ',', '"', '');
$fila = array_map(function ($v) { return preg_match('/^[=+\-@\t\r]/', $v) ? "'" . $v : $v; }, array_values($d));
$ok = fputcsv($fh, array_merge([$numero, $fecha], $fila, ['', '']), ',', '"', '');
$ok = fflush($fh) && $ok;
flock($fh, LOCK_UN);
fclose($fh);
if (!$ok) json_response(500, ['ok' => false, 'error' => 'No pudimos registrar tu hoja. Inténtalo en unos minutos.']);

$etq = ['nombre' => 'Consumidor', 'documento' => 'Documento', 'domicilio' => 'Domicilio', 'telefono' => 'Teléfono', 'email' => 'Correo',
    'apoderado' => 'Padre, madre o apoderado', 'bien' => 'Bien contratado', 'monto' => 'Monto reclamado (S/)', 'descripcion' => 'Descripción del bien',
    'tipo' => 'Tipo', 'detalle' => 'Detalle', 'pedido' => 'Pedido del consumidor'];
$html = '<div style="font-family:Arial,sans-serif;max-width:640px"><h2>Hoja de Reclamación ' . $numero . '</h2><p>Fecha: ' . $fecha
    . '<br>Proveedor: Mate Fácil E.I.R.L. · RUC 20513965703<br>Alameda Lorenzo de Vidaurre 216, Los Próceres, Surco, Lima</p><table>';
foreach ($etq as $k => $t) {
    if ($d[$k] !== '') $html .= '<tr><td style="padding:5px 10px;color:#64748b;vertical-align:top">' . $t . '</td><td style="padding:5px 10px">'
        . nl2br(htmlspecialchars($d[$k], ENT_QUOTES, 'UTF-8')) . '</td></tr>';
}
$html .= '</table><p>El proveedor responderá en un plazo no mayor de 15 días hábiles. Formular un reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para presentar una denuncia ante el Indecopi.</p></div>';
enviar_correo(MAIL_TO_REAL, "[Libro de Reclamaciones] {$numero} — {$d['tipo']}", $html, $d['email']);
$copia = enviar_correo($d['email'], "Copia de tu Hoja de Reclamación {$numero}", $html, MAIL_REPLY_TO, 'Libro de Reclamaciones - Tesis IA');
json_response(200, ['ok' => true, 'numero' => $numero, 'fecha' => $fecha, 'correo' => $copia]);
