<?php
// public/api/config.php — Configuracion central para envio de correos en cPanel
// Copiado automaticamente a dist/api/config.php en cada build (carpeta public/)
// Mismo patron que academic-navigator-astro: usa mail() nativo del hosting.
// NO requiere App Password de Gmail: el correo sale desde una cuenta del dominio.

// ====== DESTINATARIOS ======
define('MAIL_TO_REAL', 'informes@tesis-ia.com'); // correo real de produccion
define('MAIL_TO_TEST', 'marxchip99@gmail.com');           // para testmail.php (te llega a tu Gmail)
// MAIL_FROM debe ser una cuenta del mismo dominio del hosting (tesis-ia.com) y existir en
// cPanel > Email Accounts, para que el SPF autorice el envío.
define('MAIL_FROM', 'informes@tesis-ia.com');
define('MAIL_FROM_NAME', 'Tesis IA Web');
define('MAIL_REPLY_TO', MAIL_TO_REAL);
define('SITE_URL', 'https://tesis-ia.com');
define('SITE_NAME', 'Tesis IA');

// ====== SEGURIDAD ======
define('HONEYPOT_FIELD', 'website'); // campo trampa anti-spam (no debe rellenarse)
define('ENABLE_RATE_LIMIT', true);

// Helper: sanitizar string
function sanitize(string $v, int $max = 500): string {
    $v = trim(strip_tags($v));
    $v = htmlspecialchars($v, ENT_QUOTES, 'UTF-8');
    if (mb_strlen($v) > $max) $v = mb_substr($v, 0, $max);
    return $v;
}
function json_response(int $code, array $payload): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    // CORS por si pruebas en local
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function is_valid_email(string $email): bool {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Correo HTML en UTF-8. Devuelve true si el servidor aceptó el envío; si falla lo registra.
function enviar_correo(string $para, string $asunto, string $html, string $replyTo, string $deNombre = MAIL_FROM_NAME): bool {
    $headers = 'From: ' . $deNombre . ' <' . MAIL_FROM . ">\r\nReply-To: " . $replyTo
        . "\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n";
    $ok = @mail($para, '=?UTF-8?B?' . base64_encode($asunto) . '?=', chunk_split(base64_encode($html)), $headers, '-f ' . MAIL_FROM);
    if (!$ok) @file_put_contents(sys_get_temp_dir() . '/mail_errors.log', '[' . date('c') . "] FAIL {$asunto}" . PHP_EOL, FILE_APPEND);
    return $ok;
}
