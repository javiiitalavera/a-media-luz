# Animaciones propias de los cinco vecinos — encargo de arte futuro

Estado: **preparación solamente**. No generar, integrar ni desplegar imágenes con este PR. El encargo queda ligado a la [issue #25](https://github.com/javiiitalavera/a-media-luz/issues/25). Las únicas ampliaciones de jugabilidad aprobadas eran P3, P6 y P9; su desarrollo ya está fusionado. El arte se plantea para que esas interacciones existentes sean más físicas y reconocibles, **sin inventar nuevas misiones**.

## Principio de producción

Primero validar un piloto con **una única acción por personaje, dos poses nuevas por acción** (inicio y reacción), combinadas en código con la pose base ya dibujada. Son **diez nuevos dibujos** para una etapa elegida, no un proyecto inmediato de cincuenta o cien sprites. Si el piloto funciona, adaptar las poses a otras etapas manteniendo los accesorios y el mismo cuerpo bebé de cada etapa. No modificar la escala del personaje durante el gesto ni fabricar fondos o muebles dentro de la pose.

## Cinco acciones con prioridad real

| Vecino | Objeto ya existente | Qué debe verse en sus dos poses |
|---|---|---|
| **Nox** | `bici` / `comba` | (1) cuerpo inclinado, patitas preparadas; (2) pequeño salto dinámico, con gesto satisfecho y cola de fuego siguiendo el movimiento |
| **Tuerca** | `maquina` | (1) patitas apoyadas como si fuera a teclear; (2) gesto de triunfo burocrático, brazos levantados y ojos encendidos; conservar exactamente el tamaño de la pantalla/cabeza |
| **Tofu** | `telescopio` | (1) inclinado con curiosidad hacia el visor, brote estirado; (2) pequeña sorpresa contenida, sin cambiar la forma de la cabeza ni quitar la mirada tranquila |
| **Bruma** | `cometa` / viento de P9 | (1) cuerpo de nube inclinado por una ráfaga, extremos siguiendo el aire; (2) nube dando un suave giro, conservando el mismo volumen de bebé |
| **Madeja** | `cesto` | (1) patitas de hilo tirando de una hebra; (2) enredada de forma cómica en el propio hilo, sin cambiar la escala del ovillo ni los accesorios de etapa |

Una vez integradas y comprobadas estas cinco acciones, evaluar si una **segunda reacción por criatura** añade algo distinto. No hacer quince láminas de caras que solo se diferencien por el color de la sonrisa.

## Requisitos visuales fijados por el arte actual

- Basarse en las láminas de personajes ya aprobadas, especialmente `docs/arte/lamina-personajes.webp`, y **en el dibujo exacto de la etapa que se adapte**.
- Conservación estricta de tamaño de cabeza y ojos, silueta redonda, patitas cortas, colores y contorno marrón oscuro. Evolucionar significa sumar detalles, no convertirse en adulto anatómico.
- **Piezas sueltas**, cuerpo completo, pies anclados abajo, fondo transparente, sin escenas, flechas, letras, iconos ni objetos duplicados. El mueble real sigue siendo un elemento independiente y se mueve con el juego.
- Mismo lienzo y encuadre de **600 × 600 px** por sprite; la lámina puede ser una cuadrícula **2 × 2** con dos poses, una versión neutra de referencia y una variante de gesto si resulta útil.
- **No añadir imagen a `src/arte/manifiesto.ts` hasta recibir, recortar y validar los archivos**. La falta de una pose debe usar la imagen base existente, nunca mostrar una casilla vacía.
- El recorte de expresiones existente usa `herramientas/recortar_lamina.py` con `--personaje`. Reutilizar el flujo de `docs/arte-encargos.md` y comprobar que no queden halos o cuadros de transparencia falsos.

## Pilotaje antes de generar el resto

1. Seleccionar **una** de las cinco acciones y la etapa donde más se vea en el juego.
2. Generar solamente su primera lámina, revisar consistencia con la base, recortar y comprobarla junto al objeto en pantalla móvil.
3. Animar con transiciones y transformaciones de código, no con seis fondos casi idénticos. Respetar `prefers-reduced-motion` dejando una pose estática coherente.
4. Revisar si la interacción se siente mejor que la actual en una sesión de 3–5 minutos, sin necesidad de leer diálogos.
5. Extender a los otros cuatro únicamente si el piloto tiene valor. Después estudiar adaptación por etapa.

**No crear material artístico masivo sin esa validación.** Este documento es un briefing para cuando se decida retomar el arte, no autorización para generarlo ahora.
