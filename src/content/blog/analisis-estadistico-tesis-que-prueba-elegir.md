---
title: "Análisis estadístico en tesis: qué prueba elegir y cómo defenderla ante el jurado"
description: "Guía para elegir la prueba estadística correcta en tu tesis con SPSS o R en Perú: normalidad, diseño, variables y cómo sustentar cada decisión ante el jurado."
date: 2026-01-15
category: "Estadística"
tags: ["spss", "estadística", "tesis", "jurado", "analisis estadistico"]
image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80&auto=format&fit=crop"
---

El error más grave que cometen los tesistas no es equivocarse en un cálculo, sino **elegir la prueba equivocada** y no poder justificarla. La inteligencia artificial puede ayudarte a interpretar resultados, pero si no entiendes los fundamentos, corres el riesgo de presentar un análisis inválido ante el jurado. Esta guía te ordena el proceso para tesis cuantitativas en Perú.

## Los 4 datos que definen tu prueba estadística

Antes de abrir SPSS, R o pedirle algo a la IA, responde:

1. **Naturaleza de tus variables** — ¿son cualitativas (nominal u ordinal) o cuantitativas (intervalo/razón)?
2. **Distribución de los datos** — ¿siguen una distribución normal? (se evalúa con Shapiro-Wilk o Kolmogorov-Smirnov)
3. **Tipo de diseño** — ¿descriptivo, correlacional, comparativo, experimental, cuasiexperimental?
4. **Número de grupos o mediciones** — ¿2 grupos, 3 o más, mediciones repetidas?

Con esas cuatro respuestas puedes elegir la prueba. La IA te la puede sugerir, pero el jurado te preguntará "¿por qué esa prueba y no otra?" y ahí debes responder tú.

## Tabla rápida de decisión

| Situación | Prueba paramétrica | Prueba no paramétrica |
| --- | --- | --- |
| Relacionar 2 variables cuantitativas | Pearson | Spearman |
| Comparar 2 grupos independientes | t de Student | U de Mann-Whitney |
| Comparar 2 mediciones del mismo grupo | t pareada | Wilcoxon |
| Comparar 3+ grupos independientes | ANOVA | Kruskal-Wallis |
| Relación entre variables categóricas | Chi-cuadrado | — |

## Primer paso siempre: normalidad

Para casi cualquier prueba paramétrica necesitas que tus datos cuantitativos sean aproximadamente normales. En SPSS:

- **Analizar → Estadísticos descriptivos → Explorar → Gráficos → Gráficos con pruebas de normalidad.**
- Revisa **Shapiro-Wilk** si n < 50, o **Kolmogorov-Smirnov** si n ≥ 50.
- Si el p-valor es mayor a 0.05, los datos son normales → puedes usar pruebas paramétricas.
- Si es menor, usa su equivalente no paramétrico o transforma la variable.

Este es el punto donde más fallan las tesis: aplicar Pearson sin verificar normalidad, o ANOVA con datos que no la cumplen.

## Diseños más comunes en tesis peruanas

### Correlacional
Estudia la relación entre dos o más variables sin manipularlas. Ejemplo típico: "clima laboral y desempeño en una empresa de Lima". Se analiza con **Pearson o Spearman** según normalidad, y se reporta con el coeficiente r y su significancia.

### Comparativo (transversal)
Compara dos o más grupos en una medición. Ejemplo: "nivel de estrés en estudiantes presenciales vs. virtuales". Usa **t de Student** (2 grupos) o **ANOVA** (3 o más) con sus alternativas no paramétricas.

### Correlacional-causal o explicativo
Combina correlación con modelos: regresión lineal simple o múltiple. Aquí también se evalúan supuestos (normalidad de residuos, homocedasticidad, multicolinealidad).

## Cómo sustentar la estadística ante el jurado

Cuando te pregunten por el análisis, responde con este esquema:

1. **"Mi variable X es [tipo], y la variable Y es [tipo]."**
2. **"Verifiqué la normalidad con Shapiro-Wilk, obteniendo p = [valor]."**
3. **"Por eso utilicé [prueba], que corresponde a mi diseño [correlacional/comparativo]."**
4. **"El resultado fue r = [valor], p = [valor], por lo que [hay/no hay] relación significativa."**

Hablar con esta estructura muestra que dominas el método, aunque la IA te haya ayudado a correr el procedimiento.

## Errores frecuentes que debes evitar

- Elegir la prueba por "lo que usó mi compañero" sin revisar tus variables.
- Reportar solo el p-valor sin el tamaño del efecto ni los supuestos.
- Omitir el análisis de normalidad.
- Confundir correlación con causalidad en la discusión.
- Interpretar "significativo" como "grande": p < 0.05 solo indica que el hallazgo es poco probable por azar.

## ¿IA para estadística? Sí, con fundamento

La IA es excelente para:

- Explicarte qué prueba corresponde a tu diseño.
- Ayudarte a redactar la interpretación de tablas de SPSS o R.
- Sugerirte cómo reportar en APA 7 los resultados (r, p, g de Hedges, etc.).

Pero es un error delegarle la elección de la prueba. El jurado evalúa que **entiendas los fundamentos**. En el plan Graduación de tesis-ia.com resolvemos tus dudas de estadística en sesiones 1:1 con asesor asignado y revisamos tu capítulo de resultados.

## Conclusión

Elegir bien la prueba estadística es una decisión metodológica que te corresponde. Domina normalidad, diseño y tipo de variable, y la sustentación será un trámite. Si quieres acompañamiento con tu capítulo IV, revisa los planes Avance y Graduación.
