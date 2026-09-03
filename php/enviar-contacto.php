<?php
/**
 * ============================================================
 *  enviar-contacto.php - API del formulario de tesis-ia.com
 * ============================================================
 *  Recibe POST (form-urlencoded o JSON), valida y envía un correo
 *  a informes@asesorestesisperu.com (config.php) usando el método
 *  configurado (mail() o SMTP Gmail).
 *
 *  SUBIR a la raíz del hosting (public_html) junto a config.php
 *  y lib/. Requiere PHP 7+ con extensiones:
 *    - mbstring  (casi siempre activa en cPanel)
 *    - openssl   (para STARTTLS de SMTP)
 *
 *  Ejemplo de respuesta JSON:
 *    {"ok":true,"mensaje":"¡Gracias! Tu solicitud fue enviada a informes@asesorestesisperu.com"}
 *    {"ok":false,"error":"..."}
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/mailer.php';

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');

/* ---------- Leer entrada (JSON o form) ---------- */
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = $_POST;
}

/* ---------- Protecciones básicas ---------- */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    exit;
}

// Honeypot anti-bots (el campo "website" oculto debe estar vacío)
if (!empty($data['website'])) {
    echo json_encode(['ok' => true, 'error' => '', 'mensaje' => 'Gracias, mensaje registrado.']);
    exit;
}

// Límite por sesión: máximo 5 envíos por minuto
if (session_status() === PHP_SESSION_NONE) { @session_start(); }
$ahora = time();
$_SESSION['envios'] = array_filter($_SESSION['envios'] ?? [], fn($t) => $t > $ahora - 60);
if (count($_SESSION['envios'] ?? []) >= 5) {
    http_response_code(429);
    echo json_encode(['ok' => false, 'error' => 'Demasiados envíos. Inténtalo en un minuto.']);
    exit;
}

/* ---------- Sanitizar y validar ---------- */
function limpiar($v) { return trim(strip_tags((string)$v)); }
function soloNumeros($v) { return preg_replace('/\D/', '', (string)$v); }

$nombre      = limpiar($data['nombre'] ?? '');
$whatsapp    = soloNumeros($data['whatsapp'] ?? '');
$email       = limpiar($data['email'] ?? '');
$universidad = limpiar($data['universidad'] ?? '');
$carrera     = limpiar($data['carrera'] ?? '');
$nivel       = limpiar($data['nivel'] ?? '');
$avance      = limpiar($data['avance'] ?? '');
$plan        = limpiar($data['plan'] ?? '');
$mensaje     = limpiar($data['mensaje'] ?? '');

$errores = [];
if (mb_strlen($nombre) < 2)                       { $errores[] = 'nombre'; }
if (!preg_match('/^\d{9}$/', $whatsapp))          { $errores[] = 'whatsapp'; }
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) { $errores[] = 'email'; }
if (mb_strlen($universidad) < 2)                  { $errores[] = 'universidad'; }
if (mb_strlen($carrera) < 2)                      { $errores[] = 'carrera'; }
if (mb_strlen($mensaje) < 10)                     { $errores[] = 'mensaje'; }

if (!empty($errores)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Campos inválidos: ' . implode(', ', $errores), 'campos' => $errores]);
    exit;
}

/* ---------- Construir correo ---------- */
$asunto = "Nuevo lead formulario tesis-ia.com - {$nombre} - {$carrera}";

$fila = fn($k, $v) => ($v !== '' ? "<tr><td style='padding:6px 10px;color:#475569'>{$k}</td><td style='padding:6px 10px;font-weight:600;color:#0f172a'>{$v}</td></tr>" : '');

$html =
'<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
  <div style="background:#0B1D3A;padding:16px 20px;color:#fff">
    <span style="font-size:18px;font-weight:700">Tesis<span style="color:#f59e0b">IA</span>.com</span>
    <span style="float:right;font-size:12px;color:#f59e0b">Nuevo contacto</span>
  </div>
  <table style="width:100%;border-collapse:collapse;padding:8px 0">
    ' . $fila('Nombre', $nombre) . '
    ' . $fila('WhatsApp', $whatsapp) . '
    ' . $fila('Email', $email) . '
    ' . $fila('Universidad', $universidad) . '
    ' . $fila('Carrera', $carrera) . '
    ' . $fila('Nivel', $nivel) . '
    ' . $fila('Avance', $avance) . '
    ' . $fila('Plan de interés', $plan) . '
  </table>
  <div style="padding:14px 20px;border-top:1px solid #e2e8f0">
    <strong style="font-size:12px;color:#475569;text-transform:uppercase">Tema / duda</strong>
    <p style="color:#0f172a;margin:6px 0 0">' . nl2br(htmlspecialchars($mensaje)) . '</p>
  </div>
  <div style="background:#fffbeb;padding:10px 20px;font-size:11px;color:#92400e">
    Enviado desde el formulario de contacto de tesis-ia.com
  </div>
</div>';

$texto =
"Formulario de contacto - tesis-ia.com\n\n" .
"Nombre: {$nombre}\nWhatsApp: {$whatsapp}\nEmail: {$email}\n" .
"Universidad: {$universidad}\nCarrera: {$carrera}\nNivel: {$nivel}\nAvance: {$avance}\n" .
"Plan interés: {$plan}\n\nTema/duda:\n{$mensaje}\n";

/* Remitente visible: en SMTP Gmail es obligatorio SMTP_USER */
$from = (METODO_ENVIO === 'smtp' && defined('SMTP_USER')) ? SMTP_USER : EMAIL_FROM;

$resultado = enviarCorreo(EMAIL_INFORMES, $asunto, $html, $texto, $from, EMAIL_FROM_NAME);

/* ---------- Respuesta ---------- */
if (is_array($resultado) && isset($resultado['ok']) && $resultado['ok']) {
    $_SESSION['envios'][] = $ahora;
    echo json_encode([
        'ok' => true,
        'mensaje' => '¡Gracias! Tu solicitud llegó a informes@asesorestesisperu.com. Te responderemos en menos de 2 horas.',
    ], JSON_UNESCAPED_UNICODE);
} else {
    $detalle = is_array($resultado) && isset($resultado['log'])
        ? (is_array($resultado['log']) ? implode(' | ', $resultado['log']) : $resultado['log'])
        : 'Error interno';
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'No pudimos enviar tu mensaje por correo. Prueba por WhatsApp +51 927 580 985.',
        'debug' => $detalle, // quitar en producción si no quieres exponer logs
    ], JSON_UNESCAPED_UNICODE);
}
