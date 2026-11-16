# Un compañero al mes (diseño aprobado por Javi, 16/11/2026)

Idea de Javi (16/11/2026). Mantiene materiales y construir como núcleo (decidido por Javi). Las reglas de base de `docs/diseno-juego.md` (ofrendas, tope de 3 al día por área, día malo, consecuencias con humor y sin culpa) siguen valiendo.

## En una frase
Cada mes llega un **huevo**. Lo que haces en tu vida real lo abre, hace crecer al compañero que lleva dentro y te da materiales para construirle su casa. Al acabar el mes se queda en tu **bosque** con lo que haya conseguido y llega otro huevo. En un año tienes un vecindario de 12 compañeros criados por ti.

## El mes
- **Dura 4 semanas (28 días)** desde que llega el huevo, no el mes del calendario. Así se puede empezar cualquier día y las semanas encajan con las metas semanales.
- **El huevo:** nadie sabe quién va dentro. Cada huevo tiene su aspecto, que da una pista. Con las **3 primeras ofrendas** (normalmente el primer o segundo día) tiembla, se agrieta y **eclosiona**.
- **Presentación:** al salir, el compañero se presenta con una tarjeta de **historia** (quién es, de dónde viene, con su humor) y **qué necesita** este mes.

## Dentro del mes: materiales y construir (lo de ahora, decidido por Javi)
- Todo lo que haces da su material: **ascuas** (Cuerpo), **semillas** (Mente), **rocío** (Calma), **hilo** (Vínculos) y **tornillos** (Orden), como ahora.
- Cada compañero tiene **su catálogo** de cosas para construir en su casa. Lo de cada uno pide sobre todo el material de **su área principal**, más algo de otras. Así cada mes priorizas un área sin dejar las demás: a Nox le hacen falta sobre todo ascuas; a Tofu, semillas…
- **Crece con su área:** las ofrendas de su área principal lo hacen pasar de cachorro a joven y a adulto, como Nox ahora. Los números se ajustan para que con una o dos cosas al día llegue a adulto en el mes.
- **Si lo descuidas:** se enfurruña, hace trastadas y suelta frases con mala leche. Se le pasa con un poco de atención. Nunca enferma ni se pierde nada.
- **Los materiales son de cada casa** (decidido por Javi): lo que ganas durante el mes de un compañero solo sirve para construir en **su** casa. Lo que sobra se queda allí, para cuando lo visites. Cada mes nuevo empieza con 0: no se puede llegar a un compañero nuevo y construirlo todo de golpe.

## El cierre del mes
- **Sin ceremonias.** El día 28 el compañero te da su **informe del mes**, escrito con su humor: días en que hiciste algo, ofrendas por área, lo que construiste, en qué etapa acaba y una última frase. Por ejemplo, Nox: «Un mes. Has andado más que el año pasado entero, lo cual dice poco del año pasado».
- Se queda a vivir en su casa del bosque **en la etapa a la que haya llegado**, con lo construido. Un mes flojo deja un vecino cachorro para siempre, que lo lleva con dignidad y te lo recuerda de vez en cuando.
- Al día siguiente aparece el **huevo siguiente** en la puerta.

## El bosque (vecindario)
- **Un mapa** con la casa de cada compañero que has criado, en el orden en que llegaron. Es tu año a la vista.
- **Visitar:** tocas una casa y entras en su escenario, con él dentro, lo construido y sus frases.
- **Seguir construyendo:** el catálogo de cada vecino sigue abierto para gastar lo que le sobró de su mes (y lo que dejen los hallazgos).
- **Hallazgos de vez en cuando:** los vecinos encuentran cosas al azar (objetos raros para su casa, piezas de colección) y te las guardan; siempre apetece pasarse. Nada caduca ni se pierde por no visitar.

## Los compañeros
- **Los 5 de la lámina primero:** Nox, Tofu, Bruma, Madeja y Tuerca. Salen del huevo en orden al azar, sin repetir.
- **Después, 7 nuevos** que diseñan Javi y ChatGPT siguiendo el estilo de la lámina. Las áreas se repiten con otro enfoque.
- **Siempre monos** en todas sus etapas (decidido por Javi).

## Arte por compañero (un paquete al mes, a ritmo del juego)
1. Su **huevo** (cerrado y agrietado).
2. **Tres etapas × 4 expresiones** (base, contento, enfurruñado, dormido), en láminas 2 × 2.
3. Su **escenario** vertical.
4. **6 a 9 objetos** para su casa, en una lámina.
5. Su **casita** para el mapa del bosque.

Ya hay: Nox (3 etapas, escenario y 6 objetos), y los escenarios de Bruma (estanque) y Madeja (madriguera de lana). Falta el **mapa del bosque**.

## Por partes
1. **El mes de Nox completo:** huevo, eclosión, historia, su catálogo con costes de su área, crecer e informe del mes.
2. **El bosque:** mapa, casas y visitas.
3. **Hallazgos al azar y los siguientes compañeros.**

## Hecho (rama `dev/huevo`)
- Inicio: llega el primer huevo (siempre Nox, de momento) y se marcan las acciones habituales.
- En casa, el huevo se mece en el sitio del compañero; al tocarlo tiembla y dice cuánto le falta; con 2 de 3 se ve agrietado.
- Con la tercera ofrenda, al volver a casa: el huevo tiembla fuerte y se rompe, sale el compañero con luz y chispas («¡Ha salido Nox!») y se presenta con su ficha (historia y lo que necesita). Se ve una sola vez.
- Las partidas de antes de los meses siguen igual (su compañero ya vivía en casa).
- Pendiente: informe y cambio de mes (cuando haya arte del segundo compañero), bosque y hallazgos.
