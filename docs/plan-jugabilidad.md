# Hoja de ruta de jugabilidad — A media luz

**Decisión vigente: 21/11/2026.** Sustituye la lista de expansión de la auditoría Z.ai y las recomendaciones anteriores de P4 + P7. La dirección creativa queda acotada a **P3, P6 y P9**. No crear nuevas líneas de juego a partir de los demás apartados sin una nueva decisión expresa.

## Filosofía que se conserva

Registrar hábitos reales permite construir; construir ofrece más posibilidades de jugar con el barrio y sus cinco vecinos. El juego táctil no debe generar materiales, puntuaciones, rachas ni tareas nuevas. Se busca provocar acciones y reacciones, no producir más conversaciones.

**Se mantienen intactas las propuestas automáticas y voluntarias de aumentar objetivos cuando un reto se vuelve demasiado fácil** (`src/logica/subir.ts` y `PropuestaMeta`). No confundirlas con misiones de videojuego.

## Próximos bloques aprobados — solo estos tres

### P3 · Completar objetos-juguete

**Situación:** cinco juguetes con acciones táctiles: hoguera, comba, maceta, gramófono y teléfono (PR #22 y #24).

**Siguiente iteración:** ampliar la variedad de juguetes interactivos usando, cuando sea posible, construcciones y arte ya existentes. Priorizar acciones que se distingan por lo que hace el jugador y por la reacción del bicho: ritmos, mantener pulsado, arrastrar/colocar, pequeñas transformaciones y usos encadenados. Un objeto no queda «completado» solo porque muestre una frase distinta o sacuda una imagen.

**Criterio:** en cada casa deben existir motivos físicos para tocar y experimentar incluso después de registrar las hazañas. Evitar textos recurrentes y controles que parezcan minijuegos obligatorios.

### P6 · Completar vecindades de objetos

**Situación:** cinco parejas de objetos combinables, una por vecino. Las pruebas verifican que son alcanzables dentro de sus superficies de colocación.

**Siguiente iteración:** ampliar progresivamente hacia **10–15 combinaciones en total**, de preferencia con consecuencias visuales o comportamientos específicos, no solo globos explicativos. Si una combinación requiere piezas que no existen o no se pueden colocar juntas, no incorporarla. Mantener el descubrimiento espontáneo; no añadir lista de recetas, marcadores ni premios por completar.

**Criterio:** que cambiar la decoración pueda transformar de manera perceptible lo que sucede en la casa.

### P9 · Completar clima y estaciones

**Situación:** clima ficticio y estable por día (despejado, lluvia, niebla, viento), paletas estacionales y algunas reacciones de personajes (PR #23).

**Siguiente iteración:** añadir **acontecimientos ambientales especiales** puntuales que cambien lo que se ve o puede tocarse: reacción específica de un objeto a la lluvia, detalles de viento o niebla, pequeñas escenas estacionales. Deben ser livianos, coherentes entre barrio y casas y sin exigir entrar en una fecha concreta.

**Criterio:** que el barrio tenga días reconociblemente diferentes sin meter más avisos, lecturas, obligaciones ni dependencia del clima real.

## Descartado como desarrollo futuro

**No ampliar P1 (saludos), P2 (caricias), P4 (encargos espontáneos), P5 (amistad), P7 (rondas del barrio), P8 (barquitos/mensajes) ni P10 (cuaderno de patrones).** Esto no implica borrar la funcionalidad ya implementada; solo se descartan las propuestas de expansión. En particular, no crear el PR de encargos + ronda que se había recomendado anteriormente.

Tampoco iniciar las simplificaciones E2–E5 de la auditoría (informe dominical, cuestionario inicial, gestión de retos y visitantes) como parte de esta hoja de ruta. E1, que planteaba retirar las propuestas de subir metas, **está expresamente rechazado**.

## Más adelante, como proyecto artístico separado

**Mejorar las animaciones y posturas propias de Nox, Tofu, Bruma, Madeja y Tuerca mediante arte nuevo.** Pensar en posturas y expresiones específicas mientras juegan, manipulan objetos, reaccionan al clima o interactúan con su casa. No solicitar más muebles decorativos o ilustraciones genéricas por ahora. Preparar primero la lista de poses que realmente necesita el juego y conservar coherencia de silueta, escala y etapa de cada personaje.

**Este trabajo queda aplazado**, no forma parte de la próxima implementación P3/P6/P9 salvo que se autorice expresamente.

## Validación antes de fusionar futuros PR

Pruebas automáticas de las reglas y de la accesibilidad de las combinaciones; compilación; verificación visual/táctil en móviles pequeños; control de solapamientos y mensajes; respeto a movimiento reducido y a partidas existentes. Cada nueva interacción debe sobrevivir a la prueba: «abro el juego sin hábitos pendientes y quiero seguir jugando».

## Historial ya fusionado

- **PR #22:** caricias, cinco juguetes y cinco vecindades iniciales.
- **PR #23:** saludos, amistad invisible, clima y estaciones iniciales.
- **PR #24:** correcciones táctiles y acciones de juguetes (comba rítmica y cuatro pulsaciones largas).

Las mecánicas de estos PR permanecen operativas. Esta hoja de ruta decide **qué se amplía**, no las elimina.
