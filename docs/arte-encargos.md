# Cómo se hace el arte (decidido por Javi, 15/11/2026)

**ChatGPT es una herramienta de dibujo, no un compañero de proyecto.** No escribe en el repositorio, no hace documentos ni opina sobre pantallas.

1. **Claude** escribe el encargo, listo para copiar y pegar.
2. **Javi** se lo pega a ChatGPT con la lámina (`docs/arte/lamina-personajes.webp`) adjunta como referencia de estilo, elige la versión que le gusta y se la sube a Claude en el chat.
3. **Claude** recorta, limpia, monta, anima y enseña la pantalla funcionando (capturas y vídeo) en una rama aparte. Solo se fusiona en `main` cuando Javi dice «fusiona».

## Reglas para los encargos
- **Piezas sueltas, nunca pantallas.** Nada de botones, texto ni interfaz dentro de los dibujos.
- **Fondos:** verticales (1080 × 1920 o proporción parecida), sin personajes, con el centro del suelo libre (ahí va el compañero) y el tercio de abajo sencillo (ahí va la interfaz).
- **Objetos:** en láminas de cuadrícula (por ejemplo 3 × 2), cada uno centrado y separado en su casilla, con fondo transparente (o liso magenta #FF00FF). Mismo contorno marrón oscuro que la lámina y escala parecida entre ellos.
- **Compañeros:** fondo transparente, cuerpo entero, pies abajo. Las 4 expresiones de una etapa, en una sola lámina de 2 × 2 (así salen coherentes entre sí) que se recorta con la herramienta.
- **Que sigan siendo monos al crecer** (decidido por Javi): cabeza muy grande, ojos grandes y redondos, hocico corto, cuerpo redondito; crecen en esplendor, no en edad.
- **Si ChatGPT dibuja el cuadriculado de transparencia** en vez de dejar el fondo transparente, no pasa nada: la herramienta lo quita (y el borde blanco de pegatina).
- **No se piden capas que encajen al píxel.** Lo que se mueve (respirar, saltar, chispas, luces, luciérnagas, día y noche, objetos que aparecen) lo hace el código.

## Herramienta de recorte
`python3 herramientas/recortar_lamina.py LAMINA.png COLUMNAS FILAS CARPETA nombre1 nombre2 …` corta una lámina de objetos en archivos sueltos con fondo transparente (quita también el velo casi invisible que dejan los generadores). Con `--personaje` delante, recorta las expresiones de un personaje con el mismo encuadre (600 × 600, pies abajo) para que no se mueva al cambiar de cara.

## Arte en uso
| Archivo | Qué es |
|---|---|
| `public/arte/casa/nox/fondo.webp` | Casa de Nox: claro con madriguera y farol (941 × 1672) |
| `public/arte/casa/nox/objetos/*.webp` | Hoguera, farolillo, banco, cojín, estantería, seta |
| `public/arte/personajes/nox/*.webp` | Nox cachorro (el de la lámina): base, contento, enfurruñado, dormido (600 × 600) |
| `public/arte/huevos/nox/cerrado.webp`, `agrietado.webp` | Huevo de Nox (600 × 600, mismo encuadre) |
| `public/arte/casa/bruma/fondo.webp`, `public/arte/casa/madeja/fondo.webp` | Escenarios de Bruma (estanque) y Madeja (madriguera de lana), aún sin usar |
| `public/arte/personajes/nox/joven/*.webp` | Nox joven, mismas 4 expresiones |
| `public/arte/personajes/nox/adulto/*.webp` | Nox adulto, mismas 4 expresiones |
