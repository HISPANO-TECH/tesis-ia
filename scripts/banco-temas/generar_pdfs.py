"""Genera un PDF por carrera con los temas reales del Excel, el logo de Hispano Tech y el WhatsApp del chatbot.
Los PDF quedan en public/api/data/banco-temas/ (carpeta bloqueada a la web); solo los entrega api/banco-temas.php
después de que la persona completa el formulario. Uso, desde tesis-ia/:
  python scripts/banco-temas/generar_pdfs.py ../banco-temas-tesis-2027-2030.xlsx
Requiere: openpyxl y playwright (python -m playwright install chromium).
"""
import base64
import re
import html
import sys
from pathlib import Path

import openpyxl
from playwright.sync_api import sync_playwright

# POR CONFIRMAR: número del chatbot de Hispano Tech (hoy, el WhatsApp de atención del sitio)
CHATBOT = {"texto": "+51 992 005 096", "link": "https://wa.me/51992005096"}
SLUGS = ["administracion", "contabilidad", "marketing-negocios-internacionales", "ingenieria-civil", "ingenieria-industrial",
         "ingenieria-sistemas", "ingenieria-ambiental", "psicologia", "medicina-humana", "enfermeria", "derecho", "educacion",
         "ciencias-comunicacion"]
ACCESO = {"bajo": "Fácil", "medio": "Medio", "alto": "Difícil"}
# Columnas que van al estudiante. Fuente, Base de demanda, Revisión y Comentario son internas y no se incluyen.
CAMPOS = ["Objetivo general", "Objetivos específicos", "Variables", "Enfoque metodológico", "Metodología", "Datos", "Procesamiento"]

raiz = Path(__file__).resolve().parents[2]
salida = raiz / "public/api/data/banco-temas"
salida.mkdir(parents=True, exist_ok=True)
logo = "data:image/png;base64," + base64.b64encode((raiz / "public/logo-hispano-tech.png").read_bytes()).decode()
e = lambda v: html.escape(str(v or "").strip())
lista = lambda v: [x.strip() for x in str(v or "").split(";") if x.strip()]

CSS = """
@page { size: A4; margin: 16mm 15mm 18mm; }
* { box-sizing: border-box; }
body { margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 9.6pt; line-height: 1.45; color: #1e293b; }
.portada { height: 263mm; display: flex; flex-direction: column; justify-content: center; text-align: center; page-break-after: always; }
.portada img { width: 62mm; margin: 0 auto 10mm; }
.portada h1 { font-size: 26pt; line-height: 1.15; margin: 0; color: #0B1D3A; }
.portada .carrera { font-size: 19pt; color: #b45309; margin: 4mm 0 10mm; font-weight: bold; }
.portada p { font-size: 11pt; max-width: 135mm; margin: 0 auto 3mm; color: #475569; }
.caja { border: 0.4mm solid #f59e0b; background: #fffbeb; border-radius: 3mm; padding: 4mm 6mm; margin: 6mm auto 0; max-width: 140mm; text-align: left; }
.caja b { color: #0B1D3A; }
a { color: #1d4ed8; }
h2 { font-size: 14pt; color: #0B1D3A; border-bottom: 0.6mm solid #f59e0b; padding-bottom: 1.5mm; margin: 0 0 4mm; page-break-after: avoid; }
.cat { margin-top: 7mm; }
.cat h2 { page-break-after: avoid; }
ol.indice { columns: 2; column-gap: 10mm; padding-left: 5mm; font-size: 10.5pt; }
.tema { border: 0.3mm solid #cbd5e1; border-radius: 2.5mm; padding: 3.5mm 4.5mm; margin-bottom: 4mm; page-break-inside: avoid; }
.tema h3 { font-size: 11pt; line-height: 1.3; margin: 0 0 2mm; color: #0B1D3A; }
.etq { font-size: 8.4pt; color: #475569; margin-bottom: 2mm; }
.etq span { display: inline-block; background: #f1f5f9; border-radius: 1.5mm; padding: 0.4mm 2mm; margin-right: 1.5mm; }
dl { margin: 0; }
dt { font-weight: bold; color: #0B1D3A; margin-top: 1.6mm; }
dd { margin: 0; }
dd ul { margin: 0.5mm 0 0; padding-left: 4.5mm; }
"""


ALIAS = {"objetivo general": "Objetivo general", "específicos": "Objetivos específicos", "metodología": "Metodología",
         "datos": "Datos", "procesamiento": "Procesamiento"}


def separar(f):
    """70 temas de Ingeniería Civil traen varios campos pegados en 'Objetivo general':
    '**Objetivo general:** … **Específicos:** (1) … (2) … **Metodología:** … **Datos:** … **Procesamiento:** …'."""
    v = str(f.get("Objetivo general") or "")
    if "**" not in v:
        return f
    f = dict(f)
    trozos = re.split(r"\*\*([^*:]+):\*\*", v)
    f["Objetivo general"] = trozos[0].strip() or None
    for nombre, texto in zip(trozos[1::2], trozos[2::2]):
        campo = ALIAS.get(nombre.strip().lower())
        texto = texto.strip()
        if campo == "Objetivos específicos":
            texto = "; ".join(x.strip(" .;") for x in re.split(r"\(\d+\)", texto) if x.strip(" .;"))
        if campo and not f.get(campo):
            f[campo] = texto
    return f


def tema(n, f):
    f = separar(f)
    partes = [f'<div class="tema"><h3>{n}. {e(f["Título"])}</h3><div class="etq"><span>Alcance: {e(f["Impacto"])}</span>']
    if f.get("Acceso"):
        partes.append(f'<span>Acceso a los datos: {ACCESO.get(f["Acceso"], e(f["Acceso"]))}</span>')
    partes.append("</div><dl>")
    for c in CAMPOS:
        v = f.get(c)
        if not v:
            continue
        if c in ("Variables", "Objetivos específicos") and len(lista(v)) > 1:
            cuerpo = "<ul>" + "".join(f"<li>{e(x)}</li>" for x in lista(v)) + "</ul>"
        else:
            cuerpo = e(v)
        partes.append(f"<dt>{c}</dt><dd>{cuerpo}</dd>")
    return "".join(partes) + "</dl></div>"


def documento(carrera, filas):
    cats = list(dict.fromkeys(f["Categoría"] for f in filas))
    wa = f'<a href="{CHATBOT["link"]}">{CHATBOT["texto"]}</a>'
    h = [f'<html lang="es"><head><meta charset="utf-8"><style>{CSS}</style></head><body>',
         f'<section class="portada"><img src="{logo}" alt="Hispano Tech"><h1>Banco de temas de tesis 2027-2030</h1>',
         f'<div class="carrera">{e(carrera)}</div>',
         f'<p>{len(filas)} ideas de tesis en {len(cats)} categorías, con objetivos, variables, metodología y fuentes de datos.</p>',
         '<div class="caja"><b>Úsalo con criterio.</b> Son ideas de partida, no temas aprobados. Antes de elegir una, revisa que no se haya investigado ya, '
         'confirma que puedes conseguir los datos y valida tu elección con tu asesor. La autoría de tu tesis es tuya.</div>',
         f'<div class="caja"><b>¿Necesitas ayuda para elegir o desarrollar tu tema?</b><br>Escríbenos por WhatsApp: {wa}</div></section>',
         '<section><h2>Categorías</h2><ol class="indice">' + "".join(f"<li>{e(c)}</li>" for c in cats) + "</ol></section>"]
    n = 0
    for c in cats:
        h.append(f'<section class="cat"><h2>{e(c)}</h2>')
        for f in (x for x in filas if x["Categoría"] == c):
            n += 1
            h.append(tema(n, f))
        h.append("</section>")
    return "".join(h) + "</body></html>"


wb = openpyxl.load_workbook(sys.argv[1], data_only=True)
pie = ('<div style="width:100%;font-size:7.5pt;color:#64748b;padding:0 15mm;display:flex;justify-content:space-between;font-family:Arial">'
       '<span>Banco de temas de tesis 2027-2030 · Hispano Tech · tesis-ia.com</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>')
with sync_playwright() as p:
    nav = p.chromium.launch()
    pag = nav.new_page()
    for n, fila in enumerate(r for r in wb["Índice"].iter_rows(min_row=2, values_only=True) if r[0]):
        ws = wb[fila[1]]
        col = [c.value for c in ws[1]]
        filas = [dict(zip(col, r)) for r in ws.iter_rows(min_row=2, values_only=True) if r[2]]
        carrera = fila[0].split(" (")[0] if "Sistemas" in fila[0] else fila[0]
        pag.set_content(documento(carrera, filas), wait_until="load")
        destino = salida / f"{SLUGS[n]}.pdf"
        pag.pdf(path=str(destino), format="A4", print_background=True, display_header_footer=True,
                header_template="<span></span>", footer_template=pie, margin={"top": "16mm", "bottom": "18mm", "left": "15mm", "right": "15mm"})
        print(f"{destino.name}: {len(filas)} temas, {destino.stat().st_size // 1024} KB")
    nav.close()
