# Capas de arte que la app sabe montar

**Lo escribe Claude** (especificación técnica de integración). ChatGPT lo lee para preparar las entregas; el inventario y la aprobación siguen en `docs/entregas-arte.md`, que solo edita ChatGPT.

La app ya está preparada para estas capas: en cuanto una figure como **APROBADO** en `entregas-arte.md` y esté en `public/arte/`, Claude añade su ruta a `src/arte/manifiesto.ts` y aparece sola. Mientras tanto se ve un hueco neutro (nunca un dibujo provisional).

## El Bosque es un sendero vertical continuo
La pantalla principal se desplaza hacia abajo y tiene que leerse como **un solo mundo que se recorre**, no como cinco tarjetas. Las escenas van **pegadas, a todo el ancho y sin esquinas ni separación** entre ellas, en este orden: Claro del fuego (Nox) → Huerto de musgo (Tofu) → Estanque de niebla (Bruma) → Porche de las visitas (Madeja) → Taller (Tuerca). Entre cada dos escenas se monta una **pieza de transición** que pisa el borde de ambas. Cada escena se muestra también sola, más grande y con esquinas redondeadas, en la pantalla de Rincón.

**Formato de cada escena:** **4:3 horizontal**, a todo el ancho del móvil (unos 360-430 px en pantalla). Entregar a **1440 × 1080 px**. WebP.

**Continuidad (para que encajen):**
- El **sendero entra por el borde superior y sale por el inferior, centrado** (entre el 40 % y el 60 % del ancho), en todas las escenas. Así el camino de una sigue en la siguiente.
- La franja de arriba y la de abajo de cada fondo (unos 160 px de los 1080) quedarán **tapadas en parte por las transiciones**: no poner ahí nada importante.
- En la **esquina inferior izquierda** de cada escena la app pone un cartelito del rincón (una línea, unos 44 px de alto y hasta 2/3 del ancho). Evitar ahí elementos clave.
- Al tocar al compañero sale un **bocadillo encima de su cabeza** que ocupa el 78 % del ancho en la franja media-alta de la escena. Es pasajero, pero conviene que el cielo y las copas de esa zona no sean lo más importante.

## Capas de cada rincón (de abajo arriba)
Todas las capas de un mismo rincón tienen **el mismo tamaño (1440 × 1080) y el mismo encuadre**, para apilarlas sin mover nada. Todas menos el fondo, con transparencia.

| Clave en la app | Cuándo se ve | Contenido |
|---|---|---|
| `rincon/<area>/fondo` | Siempre | El rincón vacío: sin compañero, sin texto, sin interfaz. Deja libre la zona central inferior (allí va el compañero) |
| `rincon/<area>/crecimiento-1` · `-2` · `-3` | Según el grado de crecimiento (5, 15 y 35 ofrendas) | Lo que ha florecido. **Se muestra solo la del grado actual**, así que cada una incluye todo lo de las anteriores |
| `rincon/<area>/maleza` | Desde que el rincón se asilvestra (fase 1) hasta que se arregla | Maleza, hongos, niebla o farolillo apagado, a juego con el rincón |
| `rincon/<area>/visitante` | Cuando hay visitante (fase 3) | El visitante indeseable (cuervo, polilla, caracol…) dentro de la escena |

`<area>` es: `cuerpo`, `mente`, `calma`, `vinculos` u `orden`.

## Transiciones del sendero
| Clave | Dónde va |
|---|---|
| `sendero/cuerpo-mente` | Entre el Claro del fuego y el Huerto de musgo |
| `sendero/mente-calma` | Entre el Huerto de musgo y el Estanque de niebla |
| `sendero/calma-vinculos` | Entre el Estanque de niebla y el Porche de las visitas |
| `sendero/vinculos-orden` | Entre el Porche de las visitas y el Taller |
| `sendero/final` | Cierre bajo el Taller (el bosque se pierde hacia abajo) |

Formato: **1440 × 360 px (4:1), con transparencia**. La app la centra sobre la costura: la mitad superior pisa los últimos 180 px de la escena de arriba y la inferior, los primeros 180 px de la de abajo (`sendero/final` se apoya entera sobre el final del Taller). Contenido: el tramo de sendero que une las dos, vegetación que cruza de un lado a otro y el **cambio de ambiente** (luz, color, niebla) de un rincón al siguiente. Se dibuja por encima de las escenas pero **por debajo de los compañeros y del cartel**. Si falta una transición, las escenas simplemente quedan pegadas.

## Compañeros
| Clave | Cuándo |
|---|---|
| `companero/<id>/base` | Reposo. También se usa si falta otra expresión |
| `companero/<id>/contento` | Hoy ha habido alguna ofrenda en su área |
| `companero/<id>/enfurrunado` | Su rincón está enfurruñado o con visitante (fase 2 o 3) |
| `companero/<id>/dormido` | Todavía no ha llegado al bosque |

`<id>` es: `nox`, `tofu`, `bruma`, `madeja` o `tuerca`. Formato: **cuadrado, 600 × 600 px, fondo transparente**, el personaje centrado y con los pies tocando el borde inferior (todos con la misma escala que en la lámina). La app lo coloca en el centro de la escena, con los pies al 80 % de la altura (por encima de la franja de transición), ocupando un 34 % del ancho, y también suelto en Inicio, Semana y Ofrendas.

## Objetos de colección
`objeto/<id>` con el `id` de `src/contenido/coleccion.ts`. Cuadrado, 300 × 300 px, transparente, sin texto.

## Iconos de la app (PWA)
Para instalarla en el móvil hacen falta, en `public/arte/iconos/`: `icono-192.png` (192 × 192), `icono-512.png` (512 × 512) e `icono-maskable-512.png` (512 × 512 con el motivo dentro del 80 % central, para que el móvil pueda recortarlo en círculo). Sin texto. Cuando estén aprobados, Claude los enlaza en `vite.config.ts`.

## Animación
La programa Claude (balanceo, parpadeo, aparición de capas), siempre respetando «reducir movimiento». Si en el futuro se quiere animar partes sueltas (ojos, cola, llama), se pedirán como capas aparte en este mismo documento.
