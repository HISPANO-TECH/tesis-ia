# Conectar el formulario del sorteo con la hoja de Google

Cada inscripción se guarda en `api/data/sorteo-participantes.csv` del hosting y, una vez hecha esta configuración, también se agrega como fila en la hoja de Google de participantes. Si la hoja falla, la inscripción no se pierde: queda en el CSV y el error se anota en `sheets_errors.log`, en la carpeta temporal del servidor.

## 1. Crear la aplicación en la hoja

1. Abre la hoja de participantes y entra a **Extensiones → Apps Script**.
2. Borra el contenido de `Código.gs` y pega el código del final.
3. Cambia `CLAVE` por una palabra larga y secreta, por ejemplo `HT-sorteo-7Kq2...`.
4. Guarda el proyecto.
5. Ve a **Implementar → Nueva implementación** y elige el tipo **Aplicación web**:
   - **Ejecutar como:** Yo.
   - **Quién tiene acceso:** Cualquier usuario.
6. Pulsa **Implementar**, autoriza los permisos y copia la **URL de la aplicación web**. Termina en `/exec`.

## 2. Ponerla en el hosting

En cPanel, edita `public_html/api/navidad.php`:

```php
const NAV_SHEETS_URL = 'https://script.google.com/macros/s/…/exec';
const NAV_SHEETS_CLAVE = 'la misma clave del paso 1';
```

## 3. Probar

Inscríbete con datos de prueba en `/navidad/`. Debe aparecer una fila nueva en la pestaña **Participantes**. Después borra esa fila y la del CSV.

## Código de Apps Script

```javascript
const CLAVE = 'CAMBIA-ESTA-CLAVE';
const HOJA = 'Participantes';
const COLUMNAS = ['Código', 'Fecha', 'Nombre', 'DNI', 'Correo', 'Celular', 'Distrito', 'Condición académica',
  'Declara requisitos', 'Versión de bases', 'Acepta promociones', 'Especialidad', 'Situación de la tesis'];

function doPost(e) {
  const datos = JSON.parse(e.postData.contents);
  if (datos.clave !== CLAVE) return respuesta({ ok: false });
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = libro.getSheetByName(HOJA) || libro.insertSheet(HOJA);
  if (hoja.getLastRow() === 0) hoja.appendRow(COLUMNAS);
  hoja.appendRow(datos.fila.map(String));
  return respuesta({ ok: true });
}

function respuesta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
```

Las columnas DNI y Celular se guardan como texto para conservar los ceros iniciales.
