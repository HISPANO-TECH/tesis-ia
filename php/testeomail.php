<?php
/**
 * ============================================================
 *  testeomail.php - Prueba de envío de correo (cPanel)
 * ============================================================
 *  SUBE este archivo a la raíz de tu hosting (public_html) junto
 *  con config.php y la carpeta lib/. Luego visita:
 *
 *      https://tesis-ia.com/testeomail.php
 *
 *  Enviará un correo de prueba a EMAIL_PRUEBA (config.php),
 *  que por defecto es tu Gmail marxchip99@gmail.com.
 *
 *  Si usas SMTP con Gmail recuerda que SMTP_PASS debe ser una
 *  "Contraseña de aplicación" (App Password), NO tu contraseña
 *  normal de Gmail.
 *
 *  Modo de uso:
 *      testeomail.php            -> ejecuta y muestra resultado
 *      testeomail.php?envio=mail -> fuerza método mail()
 *      testeomail.php?envio=smtp -> fuerza método SMTP Gmail
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/mailer.php';

if (isset($_GET['envio'])) {
    define('METODO_FORZADO', $_GET['envio']);
}

function metodoActivo() {
    if (defined('METODO_FORZADO') && in_array(METODO_FORZADO, ['mail', 'smtp'], true)) {
        return METODO_FORZADO;
    }
    return defined('METODO_ENVIO') ? METODO_ENVIO : 'smtp';
}

$resultado = null;
$metodo    = metodoActivo();

if ($_SERVER['REQUEST_METHOD'] === 'POST' || isset($_GET['enviar'])) {
    $asunto = '✅ Prueba de correo desde tesis-ia.com (cPanel)';
    $html   = '<h2 style="color:#1e3a8a">¡Correo enviado correctamente!</h2>'
            . '<p>Este mensaje confirma que el envío desde tu hosting funciona usando <b>' . strtoupper($metodo) . '</b>.</p>'
            . '<p><b>Origen:</b> ' . htmlspecialchars(EMAIL_FROM) . '<br>'
            . '<b>Destino:</b> ' . htmlspecialchars(EMAIL_PRUEBA) . '<br>'
            . '<b>Fecha:</b> ' . date('Y-m-d H:i:s') . '</p>';
    $texto  = "Prueba de correo desde tesis-ia.com.\nMétodo: {$metodo}\nFecha: " . date('Y-m-d H:i:s');

    // Modo smtp -> el remitente visible debe ser SMTP_USER (Gmail lo fuerza)
    $from     = ($metodo === 'smtp' && defined('SMTP_USER')) ? SMTP_USER : EMAIL_FROM;
    $resultado = enviarCorreo(EMAIL_PRUEBA, $asunto, $html, $texto, $from, EMAIL_FROM_NAME);
}
?>
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Testeomail - tesis-ia.com</title>
    <style>
        body{font-family:'Segoe UI',Arial,sans-serif;background:#0B1D3A;color:#e2e8f0;margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:20px}
        .card{background:#fff;color:#0f172a;border-radius:18px;max-width:640px;width:100%;padding:30px;box-shadow:0 20px 60px rgba(0,0,0,.4)}
        h1{font-size:24px;color:#0B1D3A;margin:0 0 6px}
        .badge{display:inline-block;background:#f59e0b;color:#0B1D3A;font-weight:700;border-radius:999px;padding:3px 12px;font-size:12px}
        p{line-height:1.6}
        code{background:#f1f5f9;padding:2px 6px;border-radius:5px;font-size:13px}
        .ok{background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;padding:14px;border-radius:10px;margin-top:14px}
        .err{background:#fef2f2;border:1px solid #fecaca;color:#991b1b;padding:14px;border-radius:10px;margin-top:14px}
        pre{background:#0f172a;color:#cbd5e1;padding:14px;border-radius:10px;overflow:auto;font-size:12px;line-height:1.5}
        button,a.btn{display:inline-block;background:#f59e0b;color:#0B1D3A;border:0;font-weight:700;border-radius:999px;padding:12px 22px;text-decoration:none;cursor:pointer;margin:4px 4px 0 0;font-size:14px}
        a.btn.ghost{background:#e2e8f0;color:#334155}
        .meta{margin-top:18px;font-size:12px;color:#64748b}
    </style>
</head>
<body>
    <div class="card">
        <h1>Testeomail <span class="badge">tesis-ia.com</span></h1>
        <p>Envía un correo de prueba a <code><?php echo htmlspecialchars(EMAIL_PRUEBA); ?></code>.</p>
        <p>Método configurado: <code><?php echo htmlspecialchars($metodo); ?></code></p>

        <a class="btn" href="?enviar=1&envio=<?php echo $metodo === 'smtp' ? 'smtp' : 'mail'; ?>">Enviar prueba</a>
        <a class="btn ghost" href="?enviar=1&envio=mail">Probar mail()</a>
        <a class="btn ghost" href="?enviar=1&envio=smtp">Probar SMTP Gmail</a>

        <?php if ($resultado !== null): ?>
            <?php if ($resultado['ok']): ?>
                <div class="ok">
                    <strong>✅ Correo enviado con éxito (método: <?php echo $metodo; ?>)</strong><br>
                    Revisa la bandeja de <code><?php echo htmlspecialchars(EMAIL_PRUEBA); ?></code> (y carpeta spam).
                </div>
            <?php else: ?>
                <div class="err">
                    <strong>❌ No se pudo enviar con método <?php echo $metodo; ?>.</strong><br>
                    Detalle/log del servidor SMTP:
                </div>
                <pre><?php echo htmlspecialchars(is_array($resultado['log']) ? implode("\n", $resultado['log']) : $resultado['log']); ?></pre>
                <div class="meta">
                    ¿SMTP Gmail falla? Verifica que <code>SMTP_PASS</code> en <code>config.php</code> sea una
                    <b>App Password</b> (no tu contraseña de Gmail) y que tengas la verificación en 2 pasos activada.
                    Prueba también el botón "Probar mail()".
                </div>
            <?php endif; ?>
        <?php endif; ?>

        <div class="meta">
            Archivos requeridos en el hosting:<br>
            <code>config.php</code> · <code>lib/mailer.php</code> · <code>testeomail.php</code>
        </div>
    </div>
</body>
</html>
