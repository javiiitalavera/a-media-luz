# Capas de arte que la app sabe montar

**Lo escribe Claude** (especificación técnica de integración). ChatGPT lo lee para preparar las entregas; el inventario y la aprobación siguen en `docs/entregas-arte.md`, que solo edita ChatGPT.

La app ya está preparada para estas capas: en cuanto una figure como **APROBADO** en `entregas-arte.md` y esté en `public/arte/`, Claude añade su ruta a `src/arte/manifiesto.ts` y aparece sola. Mientras tanto se ve un hueco neutro (nunca un dibujo provisional).

## El Bosque es un sendero vertical
La pantalla principal se desplaza hacia abajo: **una escena por rincón**, en este orden: Claro del fuego (Nox) → Huerto de musgo (Tofu) → Estanque de niebla (Bruma) → Porche de las visitas (Madeja) → Taller (Tuerca). Cada escena se muestra también, más grande, en la pantalla de Rincón.

**Formato de cada escena:** **4:3 horizontal**, se pinta a todo el ancho del móvil (unos 360 px de ancho en pantalla). Entregar a **1440 × 1080 px** (sirve para pantallas de densidad ×3 con margen). WebP.

## Capas de cada rincón (de abajo arriba)
Todas las capas de un mismo rincón tienen **el mismo tamaño (1440 × 1080) y el mismo encuadre**, para apilarlas sin mover nada. Todas menos el fondo, con transparencia.

| Clave en la app | Cuándo se ve | Contenido |
|---|---|---|
| `rincon/<area>/fondo` | Siempre | El rincón vacío: sin compañero, sin texto, sin interfaz. Deja libre la zona central inferior (allí va el compañero) |
| `rincon/<area>/crecimiento-1` · `-2` · `-3` | Según el grado de crecimiento (5, 15 y 35 ofrendas) | Lo que ha florecido. **Se muestra solo la del grado actual**, así que cada una incluye todo lo de las anteriores |
| `rincon/<area>/maleza` | Desde que el rincón se asilvestra (fase 1) hasta que se arregla | Maleza, hongos, niebla o farolillo apagado, a juego con el rincón |
| `rincon/<area>/visitante` | Cuando hay visitante (fase 3) | El visitante indeseable (cuervo, polilla, caracol…) dentro de la escena |

`<area>` es: `cuerpo`, `mente`, `calma`, `vinculos` u `orden`.

## Compañeros
| Clave | Cuándo |
|---|---|
| `companero/<id>/base` | Reposo. También se usa si falta otra expresión |
| `companero/<id>/contento` | Hoy ha habido alguna ofrenda en su área |
| `companero/<id>/enfurrunado` | Su rincón está enfurruñado o con visitante (fase 2 o 3) |
| `companero/<id>/dormido` | Todavía no ha llegado al bosque |

`<id>` es: `nox`, `tofu`, `bruma`, `madeja` o `tuerca`. Formato: **cuadrado, 600 × 600 px, fondo transparente**, el personaje centrado y con los pies tocando el borde inferior (todos con la misma escala que en la lámina). La app lo coloca abajo en el centro de la escena ocupando un 34 % del ancho, y también suelto en Inicio, Semana y Ofrendas.

## Objetos de colección
`objeto/<id>` con el `id` de `src/contenido/coleccion.ts`. Cuadrado, 300 × 300 px, transparente, sin texto.

## Iconos de la app (PWA)
Para instalarla en el móvil hacen falta, en `public/arte/iconos/`: `icono-192.png` (192 × 192), `icono-512.png` (512 × 512) e `icono-maskable-512.png` (512 × 512 con el motivo dentro del 80 % central, para que el móvil pueda recortarlo en círculo). Sin texto. Cuando estén aprobados, Claude los enlaza en `vite.config.ts`.

## Animación
La programa Claude (balanceo, parpadeo, aparición de capas), siempre respetando «reducir movimiento». Si en el futuro se quiere animar partes sueltas (ojos, cola, llama), se pedirán como capas aparte en este mismo documento.
