<?php
// public/api/contact.php — Recibe el formulario de contacto de tesis-ia.com
// y envia el lead a MAIL_TO_REAL (informes@asesorestesisperu.com) usando mail().
// Copiado automaticamente a dist/api/contact.php en cada build.

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    exit;
}

// ---- Leer entrada (JSON o form-urlencoded) ----
$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!is_array($input)) {
    $input = $_POST;
}

// ---- Solo POST ----
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(405, ['ok' => false, 'error' => 'Método no permitido.']);
}

// ---- Honeypot anti-spam ----
$hp = HONEYPOT_FIELD;
if (!empty($input[$hp])) {
    json_response(200, ['ok' => true, 'message' => 'Solicitud registrada.']); // finge exito
}

// ---- Rate limit simple por IP (30s) ----
if (ENABLE_RATE_LIMIT) {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $lock = sys_get_temp_dir() . '/ti_' . md5($ip) . '.lock';
    if (is_file($lock) && (time() - (int)filemtime($lock)) < 30) {
        json_response(429, ['ok' => false, 'error' => 'Espera unos segundos antes de enviar otro mensaje.']);
    }
    @file_put_contents($lock, (string)time());
}

// ---- Campos del formulario tesis-ia.com ----
$f = function ($k, $max = 300) use ($input) {
    return sanitize($input[$k] ?? '', $max);
};
$nombre      = $f('nombre');
$whatsapp    = preg_replace('/\D/', '', (string)($input['whatsapp'] ?? ''));
$email       = $f('email', 160);
$universidad = $f('universidad');
$carrera     = $f('carrera');
$nivel       = $f('nivel', 60);
$avance      = $f('avance', 80);
$plan        = $f('plan', 60);
$mensaje     = $f('mensaje', 3000);
$source      = $f('source', 60) ?: 'formulario-contacto';

// ---- Validacion ----
$errores = [];
if (mb_strlen($nombre) < 2)                       $errores['nombre'] = 'Ingresa tu nombre.';
if (!preg_match('/^\d{9}$/', $whatsapp))          $errores['whatsapp'] = 'WhatsApp inválido (9 dígitos).';
if ($email !== '' && !is_valid_email($email))     $errores['email'] = 'Email inválido.';
if (mb_strlen($universidad) < 2)                  $errores['universidad'] = 'Indica tu universidad.';
if (mb_strlen($carrera) < 2)                      $errores['carrera'] = 'Indica tu carrera.';
if (mb_strlen($mensaje) < 10)                     $errores['mensaje'] = 'Cuéntanos tu tema (mín. 10 caracteres).';

if (!empty($errores)) {
    json_response(422, ['ok' => false, 'error' => 'Campos inválidos.', 'fields' => $errores]);
}

// ---- Asunto y cuerpo ----
$subject = "[Web] Nuevo lead — {$source} — {$nombre} ({$carrera}) — " . date('d/m/Y H:i');

$row = fn(string $k, string $v): string =>
    ($v !== '' ? "<tr><td style='padding:7px 12px;color:#64748b;font-size:13px'>{$k}</td><td style='padding:7px 12px;color:#0f172a;font-weight:600'>{$v}</td></tr>" : '');

$html =
'<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden">
  <div style="background:#0B1D3A;padding:18px 24px">
    <span style="font-size:20px;font-weight:700;color:#fff">Tesis<span style="color:#f59e0b">IA</span>.com</span>
    <span style="float:right;font-size:12px;color:#f59e0b;text-transform:uppercase">Nuevo contacto</span>
  </div>
  <div style="padding:6px 24px">
    <table style="width:100%;border-collapse:collapse">
      ' . $row('Nombre', $nombre) . '
      ' . $row('WhatsApp', '+51 ' . $whatsapp) . '
      ' . $row('Email', $email) . '
      ' . $row('Universidad', $universidad) . '
      ' . $row('Carrera', $carrera) . '
      ' . $row('Nivel', $nivel) . '
      ' . $row('Avance', $avance) . '
      ' . $row('Plan de interés', $plan) . '
    </table>
    <div style="border-top:1px solid #e2e8f0;padding:14px 0 8px">
      <div style="font-size:12px;color:#64748b;text-transform:uppercase;font-weight:700">Tema / duda</div>
      <p style="margin:8px 0 0;color:#0f172a;font-size:15px;line-height:1.6">' . nl2br(htmlspecialchars($mensaje)) . '</p>
    </div>
  </div>
  <div style="background:#fffbeb;padding:10px 24px;font-size:12px;color:#92400e">
    Enviado desde el formulario de ' . SITE_NAME . ' (' . SITE_URL . ') · Origen: ' . htmlspecialchars($source) . '
  </div>
</div>';

$text =
"Nuevo lead — " . SITE_NAME . "\n\n" .
"Nombre: {$nombre}\nWhatsApp: +51 {$whatsapp}\nEmail: {$email}\n" .
"Universidad: {$universidad}\nCarrera: {$carrera}\nNivel: {$nivel}\nAvance: {$avance}\n" .
"Plan interés: {$plan}\n\nTema/duda:\n{$mensaje}\n\nOrigen: {$source}\n" . SITE_URL . "\n";

// ---- Envio con mail() nativo de cPanel ----
$boundary = md5(uniqid((string)time(), true));
$headers  = "From: " . MAIL_FROM_NAME . " <" . MAIL_FROM . ">\r\n";
$headers .= "Reply-To: " . MAIL_FROM . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/alternative; boundary=\"$boundary\"\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

$body  = "--$boundary\r\n";
$body .= "Content-Type: text/plain; charset=UTF-8\r\n";
$body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$body .= $text . "\r\n\r\n";
$body .= "--$boundary\r\n";
$body .= "Content-Type: text/html; charset=UTF-8\r\n";
$body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$body .= $html . "\r\n\r\n";
$body .= "--$boundary--";

$sent = @mail(MAIL_TO_REAL, $subject, $body, $headers, "-f " . MAIL_FROM);

if ($sent) {
    json_response(200, [
        'ok' => true,
        'message' => "¡Gracias, {$nombre}! Tu solicitud llegó a " . MAIL_TO_REAL . ". Te responderemos en menos de 2 horas.",
    ]);
} else {
    @file_put_contents(sys_get_temp_dir() . '/mail_errors.log',
        "[" . date('c') . "] FAIL contact.php to " . MAIL_TO_REAL . " | " . ($_SERVER['REMOTE_ADDR'] ?? '-') . "\n", FILE_APPEND);
    json_response(500, [
        'ok' => false,
        'error' => 'No pudimos enviar tu mensaje por correo. Intenta por WhatsApp +51 927 580 985.',
        'hints' => [
            'Verifica SPF/DKIM en cPanel > Email Deliverability',
            'MAIL_FROM debe existir como cuenta en cPanel > Email Accounts',
            'Revisa cPanel > Track Delivery o /tmp/mail_errors.log',
        ],
    ]);
}
