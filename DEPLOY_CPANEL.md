# Despliegue a cPanel — tesis-ia.com

> Mismo método que `academic-navigator-astro`: los PHP viven en `public/api/`
> y Astro los copia solos a `dist/api/` en cada build. Solo subes `dist/*`.

## 1. Qué se hizo

**Backend PHP en `public/api/` (se copia automáticamente a `dist/api/` al build):**
- `config.php` — destinatarios (MAIL_TO_REAL, MAIL_TO_TEST), MAIL_FROM, helpers.
- `contact.php` — recibe el formulario de la landing (nombre, whatsapp, email,
  universidad, carrera, nivel, avance, plan, mensaje). Honeypot + rate-limit 30s/IP.
- `testmail.php` — prueba de envío (GET) a `marxchip99@gmail.com`.

Usa `mail()` **nativo de cPanel** (sin App Password): el correo sale desde
`MAIL_FROM` que debe ser una cuenta de correo del dominio creada en cPanel.

**Frontend:** `src/components/sections/FormSection.astro` hace
`fetch POST /api/contact.php` con FormData. Si el PHP no responde, cae a WhatsApp.

## 2. Build

```bash
pnpm install
pnpm run build
```

Verifica que existan: `dist/api/config.php`, `dist/api/contact.php`, `dist/api/testmail.php`.

## 3. Subir a cPanel

1. cPanel > File Manager > `public_html` (la raíz donde vaya tesis-ia.com).
2. Borra contenido viejo (backup previo).
3. Sube **el contenido** de `dist/` (index.html, `_astro/`, `api/`, `blog/`, etc.)
   — NO la carpeta `dist` completa. Usa Compress de `dist/*` → Upload → Extract.
4. Estructura final:
   ```
   public_html/
     index.html
     _astro/
     api/
       config.php
       contact.php
       testmail.php
     blog/
     ...
   ```

## 4. Correos en cPanel (clave para que no caiga en SPAM)

1. **Email Accounts** → asegura que exista `informes@asesorestesisperu.com`
   (destino real de los leads). Ajusta `MAIL_FROM` en `public/api/config.php` si
   quieres otro remitente (debe ser una cuenta existente del dominio).
2. **Email Deliverability** → Manage → Repair/Generate SPF + DKIM (verde).
3. **Email Routing** → Local Mail Exchanger si gestionas correo ahí.

## 5. Probar

- `https://tesis-ia.com/api/testmail.php` → JSON `{"ok":true,...}` y correo a tu Gmail.
  - `?to=informes@asesorestesisperu.com` para probar ese destino.
- En la landing, sección Contacto → rellena → submit → lead llega a informes@.
- Debug: F12 > Network > `contact.php`; cPanel > Track Delivery; `/tmp/mail_errors.log`.

## 6. Producción

- Borra/protege `api/testmail.php` tras la prueba.
- Si `mail()` está bloqueado en el hosting, pasamos a PHPMailer con SMTP
  `mail.tudominio.com:465` SSL usando la contraseña de la cuenta de correo.

## Checklist
- [ ] `pnpm run build` genera `dist/api/*.php`
- [ ] Subido contenido de `dist/` a `public_html/`
- [ ] Email account de dominio creada + Email Deliverability verde
- [ ] `/api/testmail.php` → OK, correo recibido
- [ ] Formulario de contacto probado → llega a informes@asesorestesisperu.com
