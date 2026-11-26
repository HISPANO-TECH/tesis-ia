# Compresión gzip y caché en cPanel

Al hacer `pnpm run build`, `scripts/htaccess.mjs` crea un `.htaccess` dentro de cada carpeta del sitio (`_astro/`, `navidad/`, `banco/`, `banco-temas-tesis/`, etc.). Esos archivos:

- comprimen con gzip el HTML, CSS, JavaScript, JSON y SVG;
- guardan en caché un año los archivos de `_astro/`, porque su nombre cambia en cada build;
- guardan en caché 7 días las imágenes y los videos;
- piden revisar siempre el HTML, para que los cambios se vean al subir un ZIP nuevo.

No se crea un `.htaccess` en la raíz porque el de `public_html` suele tener la versión de PHP que configura cPanel. Si quieres que la portada (`index.html` de la raíz) también se comprima, abre `public_html/.htaccess` en el File Manager y **agrega al final**, sin borrar nada:

```apache
# Compresión gzip (tesis-ia)
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/plain text/xml application/xml application/javascript text/javascript application/json image/svg+xml
</IfModule>
```

## Comprobar que funciona

En el navegador: F12 → Red → recarga la página → elige el documento o un archivo `.css` o `.js`. En los encabezados de respuesta debe aparecer `Content-Encoding: gzip`.
