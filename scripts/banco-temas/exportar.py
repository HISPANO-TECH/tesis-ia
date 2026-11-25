"""Exporta del Excel las cifras y una MUESTRA (3 temas por carrera y una ficha) para la landing.
El banco completo no se publica. Uso, desde tesis-ia/:
  python scripts/banco-temas/exportar.py ../banco-temas-tesis-2027-2030.xlsx
"""
import collections
import json
import sys

import openpyxl

ICONOS = ["briefcase-business", "calculator", "megaphone", "hard-hat", "factory", "monitor", "leaf", "brain",
          "stethoscope", "heart-pulse", "scale", "book-open", "radio"]
wb = openpyxl.load_workbook(sys.argv[1], data_only=True)
carreras, impacto, acceso = [], collections.Counter(), collections.Counter()
total = completos = 0
ficha = None
for n, fila in enumerate(wb["Índice"].iter_rows(min_row=2, values_only=True)):
    if not fila[0]:
        continue
    ws = wb[fila[1]]
    col = [c.value for c in ws[1]]
    filas = [dict(zip(col, r)) for r in ws.iter_rows(min_row=2, values_only=True) if r[2]]
    completa = lambda f: all(f[c] for c in ("Acceso", "Variables", "Objetivo general", "Objetivos específicos", "Metodología", "Datos", "Procesamiento"))
    muestra, usadas = [], set()
    for imp in ("Perú", "Latam", "Global"):
        op = [f for f in filas if f["Impacto"] == imp and completa(f) and f["Categoría"] not in usadas]
        f = min(op, key=lambda x: ({"bajo": 0, "medio": 1, "alto": 2}[x["Acceso"]], len(x["Título"])))
        usadas.add(f["Categoría"])
        muestra.append({"titulo": f["Título"], "categoria": f["Categoría"], "impacto": imp, "acceso": f["Acceso"]})
    if ficha is None:
        ficha = {k: filas[0][k] for k in ("Categoría", "Título", "Impacto", "Acceso", "Variables", "Enfoque metodológico", "Objetivo general",
                                        "Objetivos específicos", "Metodología", "Datos", "Procesamiento")} | {"Carrera": fila[0]}
    nombre = fila[0].split(" (")[0] if "Sistemas" in fila[0] else fila[0]
    carreras.append({"nombre": nombre, "icono": ICONOS[n], "temas": len(filas), "muestra": muestra,
                     "categorias": list(dict.fromkeys(f["Categoría"] for f in filas))})
    for f in filas:
        impacto[f["Impacto"]] += 1
        acceso[f["Acceso"] or "sin clasificar"] += 1
        completos += completa(f)
    total += len(filas)
out = {"total": total, "categorias": sum(len(c["categorias"]) for c in carreras), "completos": completos,
       "impacto": impacto, "acceso": acceso, "ficha": ficha, "carreras": carreras}
json.dump(out, open("src/data/banco-temas.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print({k: v for k, v in out.items() if k not in ("ficha", "carreras")}, len(carreras))
