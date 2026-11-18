# Cómo hacer commit y push al repo de Tesis IA

Este proyecto (`tesis-ia`) **no tiene un `.git` propio**: vive dentro del monorepo
`Trabajo-BeSocial-HispanoTesis` en la carpeta `tesis-ia`.

Para publicarlo en su propio repositorio usamos **`git subtree`**, que sube solo esta carpeta
(y la deja en la raíz del repo destino).

| Remoto    | URL                                                             | Qué contiene         |
| --------- | --------------------------------------------------------------- | -------------------- |
| `origin`  | https://github.com/MarxAlonso/Trabajo-BeSocial-HispanoTesis.git | El monorepo completo |
| `tesisia` | https://github.com/HISPANO-TECH/tesis-ia.git                    | Solo `tesis-ia`      |

> Todos los comandos se ejecutan desde la **raíz del monorepo**
> (`Trabajo-BeSocial-HispanoTesis`), no desde esta carpeta.

> ⚠️ **No uses `git push tesisia main`.** Eso sube el monorepo entero (BeSocial, Excelsius,
> Mate Fácil…) al repo de Tesis IA. Usa siempre `git push-tesisia` (ver abajo).

---

## Flujo normal (cada vez que haya cambios)

### 1. Hacer commit en el monorepo

```bash
git add tesis-ia
git commit -m "feat(tesis-ia): descripción del cambio"
```

Agrega solo los archivos de esta carpeta si tienes otros cambios pendientes que no quieres incluir.

### 2. (Opcional) Subir el monorepo a `origin`

```bash
git push origin <tu-rama>
```

### 3. Subir la carpeta al repo de Tesis IA

```bash
git push-tesisia
```

Es un alias de:

```bash
git subtree push --prefix=tesis-ia tesisia main
```

Listo: los commits que tocaron esta carpeta llegan a `main` de `HISPANO-TECH/tesis-ia`.

---

## Notas importantes

- **Solo se sube lo que está commiteado.** Los cambios sin commit no viajan.
- **No hagas commits directos en GitHub** (ni en otro clon) del repo `tesis-ia`.
  Si el remoto tiene commits que no salen del monorepo, el `subtree push` será rechazado.
  Si alguien lo hizo, primero tráelos:

  ```bash
  git subtree pull --prefix=tesis-ia tesisia main
  ```

- `subtree push` recorre todo el historial, así que puede tardar unos segundos; es normal.
- `node_modules`, `.astro`, `dist`, etc. no se suben porque están en `.gitignore`.

## Si clonas el monorepo en otra PC

El remoto y el alias son configuración local; no viajan con el clon. Hay que agregarlos una vez:

```bash
git remote add tesisia https://github.com/HISPANO-TECH/tesis-ia.git
git config alias.push-tesisia "subtree push --prefix=tesis-ia tesisia main"
git remote -v   # verificar
```

## Resumen rápido

```bash
# desde la raíz del monorepo
git add tesis-ia
git commit -m "mensaje"
git push-tesisia
```
