<?php
// public/api/testmail.php — Prueba de envío (mismo patrón que academic-navigator)
// Uso: https://tesis-ia.com/api/testmail.php  → envía a MAIL_TO_TEST (tu Gmail)
//      ?to=informes@asesorestesisperu.com     → prueba otro destino
// Después de la prueba, borra o protege este archivo en producción.

require_once __DIR__ . '/config.php';

$to = MAIL_TO_TEST;
if (!empty($_GET['to']) && is_valid_email($_GET['to'])) {
    $to = sanitize($_GET['to'], 120);
}

$subject = "[TEST] TesisIA — Prueba de correo cPanel — " . date('d/m/Y H:i:s');
$date = date('d/m/Y H:i:s');
$ip = $_SERVER['REMOTE_ADDR'] ?? '-';
$server = $_SERVER['SERVER_NAME'] ?? '-';

$text = "Prueba de envio desde $server\nFecha: $date\nIP: $ip\n\nSi recibes este mensaje, mail() funciona en cPanel.\n\nConfig:\n- From: " . MAIL_FROM . " (" . MAIL_FROM_NAME . ")\n- To test: " . MAIL_TO_TEST . "\n- To real: " . MAIL_TO_REAL . "\n";

$html =
'<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;border:1px solid #ddd;padding:20px;border-radius:8px">
  <h2 style="color:#0B1D3A">Tesis<span style="color:#f59e0b">IA</span> — Test de correo cPanel OK</h2>
  <p>Fecha: <strong>' . $date . '</strong></p>
  <p>Servidor: <strong>' . htmlspecialchars($server) . '</strong> — IP: ' . htmlspecialchars($ip) . '</p>
  <p>Si ves este correo en <strong>' . htmlspecialchars($to) . '</strong>, la función <code>mail()</code> está operativa.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:16px 0">
  <ul style="font-size:13px;color:#555">
    <li>From: ' . htmlspecialchars(MAIL_FROM) . ' (' . htmlspecialchars(MAIL_FROM_NAME) . ')</li>
    <li>To test: ' . htmlspecialchars(MAIL_TO_TEST) . '</li>
    <li>To real: ' . htmlspecialchars(MAIL_TO_REAL) . '</li>
    <li>PHP: ' . phpversion() . '</li>
  </ul>
  <p style="font-size:12px;color:#999">Archivo: /api/testmail.php — Elimina tras la prueba.</p>
</div>';

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

$sent = @mail($to, $subject, $body, $headers, "-f " . MAIL_FROM);

if ($sent) {
    json_response(200, [
        'ok' => true,
        'message' => "Correo de prueba enviado a $to. Revisa tu bandeja (y SPAM).",
        'to' => $to,
        'from' => MAIL_FROM,
        'date' => $date,
        'server' => $server,
    ]);
} else {
    @file_put_contents(sys_get_temp_dir() . '/mail_errors.log', "[$date] FAIL testmail.php to $to | IP $ip\n", FILE_APPEND);
    json_response(500, [
        'ok' => false,
        'error' => 'mail() devolvió false.',
        'hints' => [
            'Verifica SPF/DKIM en cPanel > Email Deliverability',
            'MAIL_FROM debe ser una cuenta existente del dominio (cPanel > Email Accounts)',
            'Algunos hostings bloquean mail(): alternativa PHPMailer con SMTP ssl://mail.tudominio.com:465',
            'Revisa cPanel > Track Delivery y /tmp/mail_errors.log',
        ],
    ]);
}
