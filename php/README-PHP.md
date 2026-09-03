# Envío de correo desde cPanel — tesis-ia.com

Flujo: el formulario web hace `fetch` a `enviar-contacto.php`, que envía el correo a
`informes@asesorestesisperu.com`. Este archivo PHP se ejecuta en tu **cPanel**
(donde corre PHP), NO en Netlify (estático).

## Archivos (subir todos a `public_html` / carpeta del dominio)

```
public_html/
├── config.php           # credenciales y destinatarios (editar allí)
├── enviar-contacto.php  # API del formulario
├── testeomail.php       # probador (primero este)
└── lib/
    └── mailer.php       # motor de envío (mail() o SMTP Gmail)
```

> Puedes usar el Administrador de archivos de cPanel o `File Manager`.
> Los `.php` deben quedar FUERA de la app estática (no van en `dist/`).

## Orden para probar

### 1) Configura `config.php`
Abre `config.php` en cPanel (Editor de archivos) y deja tu App Password:

- `METODO_ENVIO`: empieza con `'smtp'` (tu Gmail).
- `SMTP_USER`: `marxchip99@gmail.com`
- `SMTP_PASS`: pega tu **App Password** de Gmail
  (cuenta Google → Seguridad → Verificación en 2 pasos → *Contraseñas de aplicaciones*).
  La contraseña normal de Gmail **no** sirve para SMTP.

### 2) Prueba con `testeomail.php`
Visita: `https://tesis-ia.com/testeomail.php`

- Botón **Probar SMTP Gmail** → debe salir ✅ y llegar a `marxchip99@gmail.com`.
- Si falla, revisa el log mostrado y que `SMTP_PASS` sea App Password.
- Botón **Probar mail()** → usa el correo del dominio (si creaste la cuenta
  `informes@asesorestesisperu.com` en *Email Accounts* de cPanel). Es el método
  más estable y sin contraseñas.

### 3) Activa el formulario
Cuando `testeomail.php` funcione, el formulario de la web ya apunta a
`/enviar-contacto.php` (mismo dominio). Envía una prueba desde la sección Contacto
y revisa la bandeja de `informes@asesorestesisperu.com`.

> Si la web sigue publicada en Netlify y el PHP vive en otro hosting/dominio,
> ajusta la URL del endpoint en `src/components/sections/FormSection.astro`
> (constante `API_URL`) al dominio con PHP (ej. `https://tu-cpanel-domain/api/...`).

## Config del formulario (Astro)

`src/components/sections/FormSection.astro`:
- `API_URL = "/enviar-contacto.php"` → ruta relativa (misma web).
- Si el fetch falla (web en Netlify sin PHP), el formulario **cae a WhatsApp** como
  respaldo automático, para no perder ningún lead.
- El envío es `POST` con `FormData` → compatible con `enviar-contacto.php`.

## Seguridad
- `config.php` está en `.gitignore` del repo (no se sube la contraseña a GitHub).
- En cPanel editas `config.php` directo y guardas ahí la App Password real.
- Rate-limit: máx. 5 envíos/minuto por sesión en `enviar-contacto.php`.
