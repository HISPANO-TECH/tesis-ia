// Post-build: calcula los hashes SHA-256 de todos los scripts inline del sitio
// (el de tema anti-parpadeo y los bloques JSON-LD) y los inyecta en la CSP de
// dist/_headers, reemplazando el marcador __INLINE_SCRIPT_HASHES__.
//
// Sin esto, la CSP de producción bloquea cualquier script inline y funciones
// como el carrusel del hero o el modo oscuro dejan de funcionar solo en Netlify
// (en `astro dev` no se aplican las cabeceras de public/_headers).
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const MARCADOR = "__INLINE_SCRIPT_HASHES__";

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return htmlFiles(full);
    return full.endsWith(".html") ? [full] : [];
  });
}

const hashes = new Set();
for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, "utf8");
  // Solo scripts inline: los que tienen src los cubre 'self'
  for (const [, attrs, code] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\ssrc\s*=/.test(attrs) || !code.trim()) continue;
    hashes.add(`'sha256-${createHash("sha256").update(code, "utf8").digest("base64")}'`);
  }
}

const headersPath = join(DIST, "_headers");
const headers = readFileSync(headersPath, "utf8");
if (!headers.includes(MARCADOR)) {
  console.warn(`[csp] ${MARCADOR} no está en public/_headers; CSP sin cambios.`);
  process.exit(0);
}

writeFileSync(headersPath, headers.replace(MARCADOR, [...hashes].join(" ")), "utf8");
console.log(`[csp] ${hashes.size} hash(es) de scripts inline añadidos a dist/_headers`);
