// Post-build: compresión gzip y caché para Apache (cPanel), carpeta por carpeta.
// No se crea un .htaccess en la raíz: el de public_html suele tener la configuración de PHP de cPanel
// y reemplazarlo podría dejar sin funcionar los formularios. Ver docs/cpanel/rendimiento.md.
import { existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const GZIP = `<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/plain text/xml application/xml application/javascript text/javascript application/json image/svg+xml
</IfModule>`;
const cache = (seg, extra = "") => `<IfModule mod_headers.c>
  <FilesMatch "\\.(webp|png|jpe?g|svg|ico|mp4|webm|woff2?)$">
    Header set Cache-Control "public, max-age=${seg}"
  </FilesMatch>${extra}
  <FilesMatch "\\.html$">
    Header set Cache-Control "public, max-age=0, must-revalidate"
  </FilesMatch>
</IfModule>`;
// Archivos de _astro llevan huella en el nombre: se pueden guardar un año sin riesgo.
const INMUTABLE = `<IfModule mod_headers.c>
  Header set Cache-Control "public, max-age=31536000, immutable"
</IfModule>`;

let n = 0;
const escribir = (dir, contenido) => {
  writeFileSync(join(dir, ".htaccess"), `# Generado por scripts/htaccess.mjs: compresión y caché\n${contenido}\n`);
  n++;
};
for (const entrada of readdirSync(DIST)) {
  const dir = join(DIST, entrada);
  if (!statSync(dir).isDirectory() || entrada === "api") continue; // api/ y api/data/ tienen sus propias reglas
  if (entrada === "_astro") escribir(dir, `${GZIP}\n${INMUTABLE}`);
  else if (!existsSync(join(dir, ".htaccess"))) escribir(dir, `${GZIP}\n${cache(604800)}`); // imágenes: 7 días
}
console.log(`[htaccess] ${n} carpeta(s) con gzip y caché`);
