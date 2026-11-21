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

## Bloque P3 + P6 (PR posterior al #26, 21/11/2026)

- **P3 ampliado:** catorce objetos-juguete disponibles entre las cinco casas. Cuatro objetos antiguos conservan su pulsación larga; se añaden seis nuevas pulsaciones largas (máquina, balanza, telescopio, loto, cesto y buzón), dos deslizamientos (globo y cometa) y un segundo objeto con ritmo de tres toques (bicicleta). La comba sigue intacta. Una frase especial por objeto y visita, con efectos generados por CSS; no hay material, puntuación ni checklist.
- **P6 ampliado:** quince parejas de muebles en total, tres por casa. Cada pareja tiene su propia microescena ambiental perceptible sobre ambos objetos, que revive al tocarlos, sin quedarse solo en un mensaje. Las reglas siguen requiriendo que las dos piezas estén construidas, visibles y próximas. Los descubrimientos persisten y el baúl/ordenar los desactivan visualmente.
- **Alcance expresamente excluido:** P9, las demás propuestas descartadas y el arte nuevo. P9 es el siguiente bloque independiente; el arte y las posturas siguen aplazados en la issue #25.
- **QA:** pruebas de catorce gestos sin duplicados, quince combinaciones alcanzables en superficies reales, restricción de construcciones y guardado, regresión de piezas previas y compilación. Queda comprobación táctil y visual con un móvil real antes de fusionar.

## Bloque P9 (21/11/2026): clima con consecuencias visibles

- **Acontecimientos ambientales especiales:** siete variantes de pequeñas sorpresas estacionales en función del tiempo y la estación (pétalos primaverales, motitas de verano, hojas de otoño, escarcha invernal, gotas de lluvia, brillos de niebla y remolinos). No aparecen todos los días; la elección es determinista por fecha y permanece igual en el mapa y en las cinco casas.
- **Jugar sin registrar:** en esos días hay una pequeña partícula ambiental tocable, también accesible por teclado. Un toque provoca un efecto breve en el propio paisaje. Se puede repetir sin límite, sin material, puntos, historia, notificaciones, cuenta atrás ni premio por entrar ese día.
- **Construcciones que responden al tiempo:** lluvia en la hoguera, maceta o loto; viento en cometa, guirnaldas o cajas; niebla sobre telescopio, lámpara u otros objetos existentes. El efecto acompaña al mueble si se recoloca y desaparece si se guarda. Varias escenas de fondo de los cinco vecinos cambian de intensidad con el clima.
- **Rendimiento y ergonomía:** todo se dibuja con CSS y componentes ya presentes, sin nuevos sprites; los efectos son `pointer-events: none` salvo el detalle interactivo, con mínimo de 44px; se respeta `prefers-reduced-motion` y se reducen partículas en interiores.
- **Cobertura:** pruebas de los siete fenómenos en cuatro años, correspondencia estación/clima, consistencia mañana/noche, reacciones en las cinco casas e inmutabilidad de partida.
- **Filosofía:** no se consulta el clima real ni se exige una visita diaria. Nada altera las propuestas voluntarias de aumento de metas, las ofrendas, materiales, retos o amistad.

**Los únicos tres apartados de jugabilidad autorizados (P3/P6/P9) ya tienen implementación propuesta.** Quedan revisión visual/táctil y posibles correcciones de calidad, no ampliar P1/P2/P4/P5/P7/P8/P10. El nuevo arte para animaciones y posturas individuales permanece aplazado en la issue #25.
