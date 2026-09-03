<?php
/**
 * ============================================================
 *  mailer.php - Envío de correo sin dependencias (cPanel)
 * ============================================================
 *  Soporta dos métodos:
 *    - 'mail': función mail() nativa de PHP (recomendada en cPanel).
 *    - 'smtp': cliente SMTP mínimo con STARTTLS (funciona con Gmail),
 *              sin necesidad de PHPMailer ni Composer.
 *
 *  Uso:
 *    require_once __DIR__ . '/../config.php';
 *    require_once __DIR__ . '/mailer.php';
 *    $ok = enviarCorreo($destino, $asunto, $mensajeHtml, $mensajeTexto);
 */

if (!function_exists('enviarCorreo')) {

    function enviarCorreo($to, $subject, $html, $text = '', $from = null, $fromName = null) {
        $metodo = defined('METODO_ENVIO') ? METODO_ENVIO : 'smtp';

        if ($metodo === 'mail') {
            return enviarConMail($to, $subject, $html, $text, $from, $fromName);
        }
        return enviarConSmtp($to, $subject, $html, $text, $from, $fromName);
    }

    /* ---------- Método 1: mail() nativo ---------- */
    function enviarConMail($to, $subject, $html, $text, $from = null, $fromName = null) {
        $from      = $from      ?: (defined('EMAIL_FROM') ? EMAIL_FROM : 'no-reply@tesis-ia.com');
        $fromName  = $fromName  ?: (defined('EMAIL_FROM_NAME') ? EMAIL_FROM_NAME : 'Tesis IA');

        $boundary  = 'b_' . md5(uniqid(mt_rand(), true));
        $headers   = [];
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-Type: multipart/alternative; boundary="' . $boundary . '"';
        $headers[] = 'From: ' . mb_encode_mimeheader($fromName) . ' <' . $from . '>';
        $headers[] = 'Reply-To: ' . $from;
        if (defined('EMAIL_BCC') && EMAIL_BCC) {
            $headers[] = 'Bcc: ' . EMAIL_BCC;
        }

        $body  = '--' . $boundary . "\r\n";
        $body .= 'Content-Type: text/plain; charset=UTF-8' . "\r\n\r\n";
        $body .= ($text !== '' ? $text : strip_tags($html)) . "\r\n";
        $body .= '--' . $boundary . "\r\n";
        $body .= 'Content-Type: text/html; charset=UTF-8' . "\r\n\r\n";
        $body .= $html . "\r\n";
        $body .= '--' . $boundary . '--';

        return @mail($to, mb_encode_mimeheader($subject), $body, implode("\r\n", $headers), '-f ' . $from);
    }

    /* ---------- Método 2: SMTP mínimo con STARTTLS ---------- */
    function enviarConSmtp($to, $subject, $html, $text, $from = null, $fromName = null) {
        $host = defined('SMTP_HOST') ? SMTP_HOST : 'smtp.gmail.com';
        $port = defined('SMTP_PORT') ? SMTP_PORT : 587;
        $user = defined('SMTP_USER') ? SMTP_USER : '';
        $pass = defined('SMTP_PASS') ? SMTP_PASS : '';
        $from = $from ?: (defined('EMAIL_FROM') ? EMAIL_FROM : $user);

        $log = [];
        $err = null;

        $socket = @stream_socket_client("tcp://{$host}:{$port}", $erno, $erstr, 15);
        if (!$socket) {
            return ['ok' => false, 'log' => "No se pudo conectar a {$host}:{$port} ({$erstr})"];
        }
        stream_set_timeout($socket, 20);

        $resp = smtpRead($socket, $log);
        if (!smtpOk($resp)) { fclose($socket); return ['ok' => false, 'log' => $log]; }

        smtpCmd($socket, "EHLO tesis-ia.com", $resp, $log);

        if (defined('SMTP_SECURE') && SMTP_SECURE === 'tls') {
            smtpCmd($socket, 'STARTTLS', $resp, $log);
            if (!smtpOk($resp)) { fclose($socket); return ['ok' => false, 'log' => 'STARTTLS rechazado: ' . $resp]; }
            $crypto = stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            if (!$crypto) { fclose($socket); return ['ok' => false, 'log' => 'Fallo al activar TLS']; }
            smtpCmd($socket, "EHLO tesis-ia.com", $resp, $log);
        }

        smtpCmd($socket, 'AUTH LOGIN', $resp, $log);
        smtpCmd($socket, base64_encode($user), $resp, $log);
        smtpCmd($socket, base64_encode($pass), $resp, $log);
        if (!smtpOk($resp)) {
            fclose($socket);
            return ['ok' => false, 'log' => 'Autenticación SMTP fallida. Revisa SMTP_USER / SMTP_PASS (App Password). Detalle: ' . $resp];
        }

        smtpCmd($socket, "MAIL FROM:<{$from}>", $resp, $log);
        smtpCmd($socket, "RCPT TO:<{$to}>", $resp, $log);
        if (defined('EMAIL_BCC') && EMAIL_BCC) {
            smtpCmd($socket, "RCPT TO:<" . EMAIL_BCC . ">", $resp, $log);
        }

        smtpCmd($socket, 'DATA', $resp, $log);

        $textBody = ($text !== '' ? $text : strip_tags($html));
        $headers  = "From: " . ($fromName ?: 'Tesis IA') . " <{$from}>\r\n";
        $headers .= "To: <{$to}>\r\n";
        $headers .= "Subject: {$subject}\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        $headers .= "Content-Transfer-Encoding: 8bit\r\n\r\n";

        smtpCmd($socket, $headers . $textBody . "\r\n.", $resp, $log);
        if (!smtpOk($resp)) { fclose($socket); return ['ok' => false, 'log' => 'El servidor rechazó el mensaje: ' . $resp]; }

        smtpCmd($socket, 'QUIT', $resp, $log);
        fclose($socket);

        return ['ok' => true, 'log' => $log];
    }

    function smtpCmd($socket, $cmd, &$resp, &$log) {
        fwrite($socket, $cmd . "\r\n");
        $log[] = '>>> ' . $cmd;
        $resp = smtpRead($socket, $log);
        return smtpOk($resp);
    }

    function smtpRead($socket, &$log) {
        $data = '';
        while ($line = fgets($socket, 512)) {
            $data .= $line;
            $log[] = '<<< ' . trim($line);
            if (isset($line[3]) && $line[3] === ' ') break; // respuesta final multilinea
        }
        return $data;
    }

    function smtpOk($resp) {
        return preg_match('/^2\d\d/', trim($resp)) === 1 || preg_match('/^3\d\d/', trim($resp)) === 1;
    }
}
