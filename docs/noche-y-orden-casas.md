# Noche y orden de las casas (21/11/2026)

## Iluminación de noche
- La cola de Nox permanece dibujada en su sprite habitual, pero la zona de la llama se oscurece como ascuas. No se genera halo ni chispas sobre ella.
- Se apagan la hoguera, el horno y la parrilla de Nox, y el flexo y la lámpara de trabajo de Tuerca: ni halo ni brillo de objeto. Se mantiene el tintado nocturno de la escena.
- Conservan iluminación los farolillos decorativos, la seta luminosa, el tarro de luciérnagas y el loto de Bruma, además de las luces de fondo y luciérnagas del ambiente. La luz del cuerpo de Tuerca sigue encendida.
- Los estados apagados se resuelven mediante filtros de presentación, sin necesitar archivos de arte nuevos. Una futura versión con brasas dibujadas y bombillas apagadas podría mejorar la fidelidad visual.

## Mover y guardar objetos
- El loto puede moverse dentro del agua del estanque y guardarse en el baúl.
- Los objetos de pared (tablón, reloj, corcho, medalla de Tuerca y bufanda de Nox) se pueden recolocar en superficies verticales y guardar.
- En modo Ordenar, los objetos desplazables se dibujan delante de las mascotas; desde el baúl se pueden seleccionar para traerlos delante o guardar directamente, incluso si estaban tapados.
- **Gregorio/aspiradora** es el único elemento del catálogo intencionadamente fijo: es un personaje autónomo que aparece en distintas casas, no decoración de sitio fijo.
- Las zonas de colocación continúan respetando la lógica física: suelo, pared, mesa, agua o elementos colgados. No se permite poner una lámpara dentro del estanque ni un reloj flotando en medio de la habitación.

## Eclosión y cambios de aspecto
- El exterior del nido y el fondo interior de la casa se superponen durante unos 950 ms. El mapa se desvanece mientras se descubre la casa, cuando el huevo termina de romperse y aparece el nuevo vecino.
- El fondo interior se precarga mientras aún está el huevo para evitar imágenes en blanco en conexiones lentas.
- La secuencia del huevo, el sonido de eclosión y la ficha de presentación conservan sus tiempos y acciones. Tras guardar la presentación no vuelve a reproducirse el fundido.
- Al subir de nivel se suaviza el cambio de sprite con una entrada breve (520 ms), sin repetir el estallido grande del nacimiento.
- Con «Reducir movimiento» se muestran las imágenes definitivas sin animación; no se añaden pantallas de espera ni recursos artísticos.
- Transiciones existentes comprobadas en código: barrio ↔ casas (View Transitions con fallback), objetos recién construidos y tintes de amanecer/atardecer/noche. No se duplican.

## Niebla durante la eclosión (PR #21)
- Desde que el huevo termina de romperse entra una **cortina de tres volutas**. No es un diálogo ni un minijuego.
- La niebla cubre el paisaje durante 400 ms **antes** de sustituir el fondo exterior por el interior. Queda opaca mientras transcurre el fundido existente (950 ms), y después se disipa durante unos 500 ms.
- El personaje sale al comenzar la revelación; la ficha aparece solo cuando las volutas se han retirado.
- Solo se activa en una eclosión aún no presentada, nunca al visitar posteriormente una casa.
- Se implementa con CSS y elementos decorativos, sin archivos nuevos de arte ni bloquear pulsaciones; se desactiva si el sistema pide movimiento reducido.

## Avisos que dejan de insistir (PR #21)
- **Álbum / Momentos y Curiosidades:** entrar en cada sección marca como vistos todos sus elementos mostrados; no es necesario abrir cada foto u objeto. Otra novedad posterior sí volverá a señalarse.
- **Casas:** entrar en una casa o abrir su catálogo de construcción marca como consultados los proyectos que ya se podían construir. El martillo y el «!» en el barrio dejan de insistir aunque el jugador decida ahorrar materiales.
- **Proyectos nuevos:** se registra el identificador de cada proyecto ya consultado, no una instantánea del saldo. Si otro proyecto se desbloquea, ese nuevo sí podrá avisar; el anterior no reaparece por gastar o recuperar materiales.
- **Martillo de la plaza:** abrir proyectos del barrio quita su contador hasta que se desbloquea otra obra distinta.
- **Excepciones intencionales:** una decisión de historia sin responder conserva su aviso (requiere elegir algo); las crónicas se siguen marcando individualmente al desplegarlas, porque su contenido no se muestra en la lista.
- La información sigue en el catálogo y se puede construir en cualquier momento; los cambios solo afectan a puntos y contadores, nunca a materiales, costes o progresión.
