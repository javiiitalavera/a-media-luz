# Jugabilidad: menos leer, más provocar cosas

Decisión de dirección creativa, 21/11/2026. Sobre la auditoría Z.ai (20/11).

## Regla irrenunciable

El juego sigue basado en registrar acciones positivas reales. Los hábitos dan materiales para construir; construir abre nuevas formas de jugar. Las interacciones lúdicas NO dan materiales, no son tareas, no tienen rachas ni alertas.

**Se conservan las propuestas automáticas voluntarias de aumentar objetivos** (`src/logica/subir.ts`, `PropuestaMeta`). Ayudan a que un reto que ya se hace muy fácil siga motivando. No se eliminan ni se cambian en este plan.

## Orden acordado por impacto jugable

1. **Caricias** (P2): contacto continuo, respuesta física y zonas incómodas diferentes.
2. **Objetos-juguete** (P3): primero hoguera, comba, maceta, gramófono y teléfono; ampliar después.
3. **Vecindades de objetos** (P6): experimentar moviendo muebles descubre escenas; sin checklist ni puntos.
4. **Saludos al llegar** (P1): breves, espontáneos y saltables.
5. **Amistad sin barras** (P5): se expresa con confianza y respuestas distintas, no con cifras.
6. **Clima y estaciones** (P9): multiplicador de animaciones y variaciones.
7. **Encargos espontáneos** (P4) y **ronda del barrio** (P7): probar solo si no se convierten en obligaciones.
8. **Barquitos y teléfono** (P8) y **cuaderno de patrones** (P10): capa ambiental, siempre subordinada al juego físico.

## Este PR: primera iteración verificable

- Caricia con pulsación sostenida o deslizamiento sobre cada vecino; tocar brevemente sigue hablando.
- Cinco juguetes que reaccionan físicamente; no generan materiales y no fuerzan bocadillos en cada pulsación.
- Cinco combinaciones de muebles, una por casa, calculadas sobre las posiciones guardadas; descubrimiento persistente, efectos de ambientación mientras están juntas.
- Se mantiene la ordenación/baúl y se respeta el modo de movimiento reducido.
- No se cambia la lógica de las metas, el registro de hábitos ni las consecuencias por descuido.

## Criterio de evaluación

En una sesión **sin hábitos que registrar**, ¿apetece acariciar, tocar los juguetes y experimentar colocando muebles? Si la respuesta es no, no añadir más lecturas ni sistemas de misiones: mejorar la respuesta táctil y la sorpresa primero.

## Bloque 2 (21/11/2026): llegada, amistad y clima

- **Saludo de llegada (P1):** una línea como máximo al entrar en una casa ya habitada; no interfiere con la eclosión, las decisiones ni la celebración de niveles. Reutiliza `FRASES.saludo`, y cambia a veces por la confianza y el tiempo.
- **Amistad (P5):** registramos silenciosamente `visita`, `caricia`, `merienda` y `juguete`. Solo cuentan hasta tres tipos distintos por semana, una vez por tipo; no hay barra, tareas, rachas ni caída de puntos. Dos hitos por vecino con nuevas frases y pequeños cambios de trato. Tofu permite tocarle el brote en el segundo hito.
- **Clima (P9 inicial):** cada día del calendario del juego produce tiempo ficticio estable (despejado, lluvia, niebla o viento), y las estaciones cambian la paleta. Se ve en el mapa y matiza las casas; una parte de los saludos y las expresiones reacciona. No se consulta el clima real del usuario ni se obliga a visitar el barrio.
- **Siguientes:** ampliar objetos-juguete y vecindades si la experiencia táctil convence; después evaluar encargos y ronda sin listas, dejando mensajes/barquitos y cuaderno como ambientación secundaria.
- **Se mantienen sin cambios las propuestas automáticas de subir objetivos.**

Validación: abrir una casa y ser recibido sin más paneles; jugar y dar de merendar durante tres semanas ficticias; comprobar que repetir cuarenta caricias no adelanta hitos y que la lluvia cambia el barrio sin hacer más difícil jugar.
