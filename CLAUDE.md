# A media luz

Juego móvil acogedor para adultos: pequeños compañeros (Nox, Tofu, Bruma, Madeja y Tuerca) que crecen y se alegran con las cosas buenas que el jugador hace en su vida real.

## Estado
- **Proyecto empezado de cero** (noviembre de 2026). No hay código. Lo anterior se borró a propósito; no intentes recuperarlo ni reconstruirlo.
- **Siguiente paso:** cerrar con Javi el diseño en `docs/diseno-juego.md` (borrador 1 escrito) **antes de programar nada**.

## Lo único que se conserva (decidido por Javi)
1. **La dirección artística** → `docs/direccion-artistica.md` y la lámina `docs/arte/lamina-personajes.webp` (referencia vinculante).
2. **Los personajes:** aspecto, nombre, área y personalidad → `docs/personajes.md`. Sus frases, historias y encargos se escriben de nuevo para el juego nuevo.
3. **El principio de juego:** la gamificación tiene que ser **divertida** y estar **basada en acciones positivas** (se registra lo que haces, nunca lo que no haces).

## Tono y consecuencias (decidido por Javi)
- **Humor negro, nada ñoño.** Los compañeros pinchan, ironizan y se vengan a su manera. No escribas textos empalagosos ni excesivamente positivos.
- **No hacer cosas tiene consecuencias temporales, nivel 2:** el bosque se afea, se pausa lo bueno, los compañeros se enfurruñan y pueden llegar visitantes que se llevan objetos. **Todo se recupera** con pocas acciones; nada se pierde para siempre.
- **Consecuencias sí, culpa no:** nada de «me has decepcionado», rachas que castigan ni avisos lacrimógenos. Volver tiene que sentar bien.

Todo lo demás (reglas, mecánicas, pantallas) está por decidir. No des por hecho nada del juego anterior.

## Sobre quien dirige el proyecto
- Javi es médico, **no programador**. Diseña el juego y lo construye con ayuda de IA.
- Háblale en **español informal y directo**. Explica las decisiones técnicas en lenguaje llano y en pocas líneas.
- No hagas preguntas innecesarias: si algo tiene una opción razonable por defecto, tómala y dilo. Pregunta lo que cambia el diseño del juego.
- Prefiere el trabajo **de una vez y completo**, y comprobado antes de darlo por listo.

## Reparto de trabajo (decidido por Javi)
- **ChatGPT:** dirección artística, personajes, recursos gráficos, animaciones e integración visual.
- **Claude:** diseño de mecánicas, lógica del juego y funcionalidades.
- **Los dos:** respetar el trabajo del otro, no editar a la vez el mismo archivo y comprobar los cambios antes de publicarlos.
- **No dibujes ni rediseñes personajes ni escenarios por tu cuenta** (ni «aproximaciones» en SVG): el arte lo produce ChatGPT siguiendo la lámina.

## Reglas de trabajo
- Interfaz y código en español.
- Móvil primero (390 px, y que funcione a 375 y 360), objetivos táctiles de 44 px como mínimo, textos legibles.
- Ningún texto dentro de las imágenes: todo el texto de la app sale del contenido del juego.
- Cada decisión de diseño se apunta en los documentos de `docs/`.
- Cuando haya código: la lógica del juego en funciones con tests, y antes de publicar, compilar, pasar los tests y probarlo en un móvil simulado.
