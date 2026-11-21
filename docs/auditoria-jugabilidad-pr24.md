# Auditoría de jugabilidad — PR #24

Revisión estática del código real de `Casa`, `Objeto`, `colocar`, `jugabilidad`, `convivencia`, `VidaDeCasa` y estilos de interacciones. Objetivo: que pasar unos minutos con los cinco vecinos sea jugar, no leer.

## Problemas observados y correcciones

| Caso | Antes | Cambio |
|---|---|---|
| Caricias en móvil | No había captura de puntero; salir del personaje durante una pulsación podía dejar activo el temporizador o perder la suelta | Captura del puntero, identificación del dedo activo y cierre seguro del gesto |
| Doble acción tras caricia | Un clic sintético podía convertirse en diálogo al acabar la caricia; un gesto cancelado podía consumir un clic de teclado posterior | Se omite solo el clic sintético del gesto; el clic de teclado sigue accesible |
| Muebles en uso | `alEncuentro` salía antes de ejecutar `onJugar`, bloqueando el comportamiento del juguete | El vecino puede responder **y** el juguete seguir reaccionando |
| Arrastres interrumpidos | `pointercancel` aplicaba la última colocación aunque el gesto no terminara correctamente | Cancelación limpia y restauración de la posición previa |
| Saludos frente a acciones | Una bienvenida diferida podía aparecer después de que el jugador comenzase a jugar o mirase una novedad | Si ya ha interactuado o hay una nota, el saludo no interrumpe; la visita sigue contando para amistad |
| Teléfono y bocadillos | En una misma pulsación podían coincidir un globo de objeto y una línea del personaje | Solo se muestra uno; mensajes menos frecuentes |
| Juguetes superficiales | Los cinco tenían principalmente una animación breve por toque | Comba con tres saltos a ritmo y cuatro acciones de pulsación larga |

## Mecánicas nuevas, intencionadamente pequeñas

- **Hoguera:** mantener pulsado para avivar las llamas.
- **Maceta:** mantener pulsado para regar.
- **Gramófono:** mantener pulsado para darle cuerda.
- **Teléfono:** mantener pulsado para llamar, sin obligar a escuchar una historia larga.
- **Comba:** encadenar tres toques rítmicos para provocar un salto especial.

Todas las acciones se expresan con código/CSS y sonidos ya disponibles, sin contratar arte nuevo ni crear misiones, rachas, penalizaciones o materiales. Cada tipo de juego ofrece una sola frase especial por visita; repetirlo sigue siendo posible de forma visual. Se conserva el sistema previo de caricias, amistad, clima, regalos y descubrimientos.

## Pruebas de regresión

- Comba: ritmo correcto, ritmos lentos, doble toque involuntario y posibilidad de repetir.
- Cuatro objetos con pulsación larga y ninguna en objetos decorativos.
- Al construir y mover objetos, las cinco vecindades tienen una combinación alcanzable dentro de las superficies reales.
- `npm test`, `npm run build` mediante CI de GitHub.

## Prueba manual antes de fusionar

1. En teléfono móvil, acariciar y sacar el dedo fuera del vecino antes de soltar; no debe quedar bloqueado ni aparecer un segundo mensaje.
2. Mantener pulsado cuatro juguetes diferentes; probar después un toque corto y un clic de teclado. Cada acción debe registrarse una sola vez.
3. Encadenar tres toques con la comba. Repetir con intervalos lentos; no debe aparecer un marcador de fallo.
4. Mover muebles, cancelar un arrastre desde el sistema y verificar que no se ha cambiado la decoración.
5. Entrar en una casa y tocar inmediatamente un objeto o abrir un mensaje: el saludo no debe taparlo.
6. Probar zoom 360/375/390px, modo noche y movimiento reducido; observar colisiones entre efectos y menús.

**Límite del alcance:** las pruebas automatizadas cubren la lógica y la compilación, no sustituyen una prueba táctil real. Este PR se deja en borrador para esa comprobación.

**Decisión permanente:** las sugerencias automáticas voluntarias para incrementar objetivos **se conservan y no se modifican** (`src/logica/subir.ts` / `PropuestaMeta`).

## Siguiente criterio creativo

No añadir nuevos edificios ni conversaciones hasta comprobar que estas acciones dan al jugador motivos para jugar sin registrar hábitos. El siguiente arte debería ser para posturas y reacciones que hagan físicamente distintos a los cinco vecinos, no más decoración pasiva.
