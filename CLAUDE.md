# A media luz

Juego móvil acogedor para adultos: pequeños compañeros (Nox, Tofu, Bruma, Madeja y Tuerca) que crecen y se alegran con las cosas buenas que el jugador hace en su vida real.

## Estado
- **Rumbo (16/11/2026, en `main`): un compañero al mes** (`docs/diseno-meses.md`). Cada mes llega un huevo; lo que haces lo abre, da materiales para construir en la casa de ese compañero y lo hace crecer (cachorro → joven → adulto). Hecho: huevo, eclosión y ficha, casas de Nox y Tuerca, materiales por casa, crecer, informe y cambio de mes, bosque con mapa dibujado y visitas. Pendiente: hallazgos.
- **Pestañas:** Casa · Hazañas · Semana · Álbum · Ajustes. Al bosque se va desde casa (botón arriba). El día del ciclo («Día 5 de 28») se ve en casa y en Hazañas. Las frases del compañero solo salen en casa.
- **Método:** una pantalla terminada y bonita antes de pasar a la siguiente; nunca pantallas con huecos grises esperando arte.
- **Reglas base aprobadas** en `docs/diseno-juego.md` (ofrendas, tope, día malo, consecuencias, metas). Lo nuevo de la casa está en su sección «Casa».
- **Frases y catálogo de colección:** propuestas de Claude en `src/contenido/`, pendientes de revisión de Javi.

## Lo único que se conserva (decidido por Javi)
1. **La dirección artística** → `docs/direccion-artistica.md` y la lámina `docs/arte/lamina-personajes.webp` (referencia vinculante).
2. **Los personajes:** aspecto, nombre, área y personalidad → `docs/personajes.md`. Sus frases, historias y encargos se escriben de nuevo para el juego nuevo.
3. **El principio de juego:** la gamificación tiene que ser **divertida** y estar **basada en acciones positivas** (se registra lo que haces, nunca lo que no haces).

## Tono y consecuencias (decidido por Javi)
- **Humor negro, nada ñoño.** Los compañeros pinchan, ironizan y se vengan a su manera. No escribas textos empalagosos ni excesivamente positivos.
- **No hacer cosas tiene consecuencias temporales, nivel 2:** el bosque se afea, se pausa lo bueno, los compañeros se enfurruñan y pueden llegar visitantes que se llevan objetos. **Todo se recupera** con pocas acciones; nada se pierde para siempre.
- **Consecuencias sí, culpa no:** nada de «me has decepcionado», rachas que castigan ni avisos lacrimógenos. Volver tiene que sentar bien.


## Sobre quien dirige el proyecto
- Javi es médico, **no programador**. Diseña el juego y lo construye con ayuda de IA.
- Háblale en **español informal y directo**. Explica las decisiones técnicas en lenguaje llano y en pocas líneas.
- No hagas preguntas innecesarias: si algo tiene una opción razonable por defecto, tómala y dilo. Pregunta lo que cambia el diseño del juego.
- Prefiere el trabajo **de una vez y completo**, y comprobado antes de darlo por listo.

## Reparto de trabajo (decidido por Javi, sustituye al anterior)
- **Javi** decide todo lo que se ve y hace de director de arte.
- **ChatGPT es solo una herramienta de dibujo** que usa Javi con los encargos que escribe Claude. No toca el repositorio. Cómo se piden y se integran las imágenes: `docs/arte-encargos.md`.
- **Claude** hace todo lo demás: diseño del juego, código, recorte y montaje del arte, animaciones por código, pruebas y documentación. Usa el arte tal como llega (puede recortarlo, encuadrarlo o teñirlo), pero **no dibuja personajes ni escenarios**.
- Los cambios se enseñan funcionando (capturas y vídeo) en una rama `dev/<tema>`; se fusionan en `main` solo cuando Javi dice «fusiona».

## Reglas de trabajo
- Interfaz y código en español.
- Móvil primero (390 px, y que funcione a 375 y 360), objetivos táctiles de 44 px como mínimo, textos legibles.
- Ningún texto dentro de las imágenes: todo el texto de la app sale del contenido del juego.
- Cada decisión de diseño se apunta en los documentos de `docs/`.
- Cuando haya código: la lógica del juego en funciones con tests, y antes de publicar, compilar, pasar los tests y probarlo en un móvil simulado.

## Código (cuando trabajes en él)
- `src/contenido/` — **todo el texto** del juego: áreas, compañeros, acciones de ejemplo, colección, frases e interfaz (`ui.ts`).
- `src/logica/` — reglas como **funciones puras con tests** (`npm test`). `reglas.ts` calcula todo a partir del historial de ofrendas (crecimiento, fases, arreglo, visitante y robo, llegada, metas); `ofrendas.ts` hace y deshace ofrendas.
- `src/estado/juego.ts` — partida guardada en el móvil (Zustand + localStorage).
- `src/arte/manifiesto.ts` — rutas del arte en uso. `src/pantallas/Casa.tsx` monta la casa de cualquier compañero (fondo, objetos, compañero, huevo, luces, animaciones, informe); `src/contenido/casa.ts` tiene materiales, escenas y objetos (coste, sitio); `src/logica/casa.ts`, materiales y construir; `src/logica/meses.ts`, el mes (huevo, eclosión, informe, cambio); `src/pantallas/Bosque.tsx`, las casitas.
- `src/pantallas/` y `src/componentes/` — interfaz. Colores de interfaz en `src/estilos/index.css` (de día crema, de noche ciruela), con contraste ≥ 4,5.
- **Antes de publicar:** `npm run build`, `npm test` y prueba en iPhone simulado (Playwright) a 390, 375 y 360 px, de día y de noche.
