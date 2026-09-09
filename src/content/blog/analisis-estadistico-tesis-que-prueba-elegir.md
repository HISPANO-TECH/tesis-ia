---
title: "Análisis estadístico en tesis: qué prueba elegir y cómo defenderla ante el jurado"
description: "Guía para elegir la prueba estadística correcta en tu tesis con SPSS o R en Perú: normalidad, diseño, variables y cómo sustentar cada decisión ante el jurado."
date: 2026-01-15
category: "Estadística"
updated: 2026-09-08
tags: ["spss", "estadística", "tesis", "jurado", "analisis estadistico"]
keywords:
  - "que prueba estadistica usar en mi tesis"
  - "prueba de normalidad shapiro wilk spss"
  - "rho de spearman o pearson"
  - "analisis estadistico tesis spss"
  - "como interpretar el p valor en una tesis"
related: ["tesis-en-un-mes-mito-realidad", "prompts-tesis-que-si-funcionan"]
faq:
  - q: "¿Cómo sé qué prueba estadística usar en mi tesis?"
    a: "Con cuatro datos: el tipo de tus variables (cualitativas o cuantitativas), si los datos siguen distribución normal, el diseño de tu investigación (correlacional, comparativo, experimental) y cuántos grupos o mediciones comparas. Con esas respuestas la prueba queda determinada; sin ellas, cualquier elección es una apuesta."
  - q: "¿Cuándo se usa Pearson y cuándo Spearman?"
    a: "Pearson se usa para relacionar dos variables cuantitativas cuyos datos son aproximadamente normales. Spearman es su equivalente no paramétrico: se usa cuando no se cumple la normalidad o cuando al menos una variable es ordinal, como ocurre con la mayoría de escalas de Likert."
  - q: "¿Qué significa que el p-valor sea menor a 0.05?"
    a: "Significa que un resultado como el observado sería poco probable si la hipótesis nula fuera cierta, por lo que se rechaza esa hipótesis. No indica que el efecto sea grande ni importante: para eso se reporta el tamaño del efecto junto al p-valor."
  - q: "¿La IA puede hacer el análisis estadístico de mi tesis?"
    a: "Puede explicarte qué prueba corresponde a tu diseño, ayudarte a interpretar las tablas de SPSS y redactar los resultados en APA 7. Lo que no puede hacer es decidir por ti: el jurado te va a preguntar por qué elegiste esa prueba y esa respuesta tienes que sostenerla con tus variables y tus supuestos."
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

## Cómo reportar tus resultados en APA 7

Elegir bien la prueba no basta: el jurado también revisa cómo la reportas. Formatos correctos según la prueba:

- **Correlación de Pearson:** r(98) = .42, p < .001
- **Rho de Spearman:** rs(98) = .38, p = .002
- **t de Student:** t(96) = 2.41, p = .018, d = 0.49
- **ANOVA de un factor:** F(2, 95) = 5.12, p = .008, η² = .10
- **Chi-cuadrado:** χ²(3, N = 120) = 9.84, p = .020

Tres reglas que evitan observaciones: los estadísticos van en cursiva, el p-valor se reporta con tres decimales (o como p < .001 cuando es muy pequeño), y **siempre acompaña el p-valor con el tamaño del efecto**, porque significación no es lo mismo que magnitud.

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

Elegir bien la prueba estadística es una decisión metodológica que te corresponde. Domina normalidad, diseño y tipo de variable, y la sustentación será un trámite.

Para interpretar tus tablas sin inventar conclusiones, apóyate en el [prompt de interpretación estadística](/blog/prompts-tesis-que-si-funcionan) y ubica esta etapa en tu [cronograma de trabajo](/blog/tesis-en-un-mes-mito-realidad). Si quieres resolver tus dudas de SPSS en sesiones 1:1 y que revisemos tu capítulo de resultados, mira los planes [Avance y Graduación](/#planes) del [Pack IAs Investigador Pro](/#pack).
