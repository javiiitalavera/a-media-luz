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
`python3 herramientas/recortar_lamina.py LAMINA.png COLUMNAS FILAS CARPETA nombre1 nombre2 …` corta una lámina de objetos en archivos sueltos con fondo transparente (quita también el velo casi invisible que dejan los generadores). Con `--sin-halo` quita además el resplandor crema que a veces rodea los objetos. Con `--personaje` delante, recorta las expresiones de un personaje con el mismo encuadre (600 × 600, pies abajo) para que no se mueva al cambiar de cara.

## Arte en uso
| Archivo | Qué es |
|---|---|
| `public/arte/casa/nox/fondo.webp` | Casa de Nox: claro con madriguera y farol (941 × 1672) |
| `public/arte/casa/nox/objetos/*.webp` | Hoguera, farolillo, banco, cojín, estantería, seta |
| `public/arte/personajes/nox/*.webp` | Nox cachorro (el de la lámina): base, contento, enfurruñado, dormido (600 × 600) |
| `public/arte/personajes/tuerca/**` | Tuerca: cachorro, joven y adulto, 4 expresiones cada uno |
| `public/arte/casa/tuerca/fondo.webp`, `…/objetos/*.webp` | Taller de Tuerca, sus 6 objetos y sus 3 premios de retos |
| `public/arte/casa/nox/objetos/zapatillas`, `bufanda`, `farol-luna` | Premios de los antiguos retos de Nox (sin uso de momento) |
| `public/arte/barrio/mapa.webp` | Mapa del barrio: 5 parcelas, plaza y arroyo |
| `public/arte/huellas/*.webp` | Huellas de las situaciones: cartel en blanco, cartel chamuscado, extintor, expediente, puente, libro chamuscado, archivador y lupa (el texto de los carteles lo pone la app) |
| `public/arte/personajes/tofu/**`, `huevos/tofu/*`, `casitas/tofu.webp`, `casa/tofu/*` | Tofu: 3 etapas × 4 caras, huevo, casita, invernadero-biblioteca (941 × 1672) y sus 3 proyectos (pila de libros, pizarra, maceta) |
| `public/arte/huevos/tuerca/*.webp` | Huevo de Tuerca |
| `public/arte/casitas/nox.webp`, `tuerca.webp` | Casitas para el bosque |
| `public/iconos/*.png` | Icono de la app (iPhone 180, Android 192/512, favicon 64). Esquinas rellenadas prolongando el fondo |
| `public/arte/bosque/mapa.webp` | Mapa del bosque con 12 claros (1024 × 1536) |

Un compañero puede tener su mes cuando tiene **huevo, escenario, casita y sus caras** (`tieneMes` en `src/arte/manifiesto.ts`).
| `public/arte/huevos/nox/cerrado.webp`, `agrietado.webp` | Huevo de Nox (600 × 600, mismo encuadre) |
| `public/arte/casa/bruma/fondo.webp`, `public/arte/casa/madeja/fondo.webp` | Escenarios de Bruma (estanque) y Madeja (madriguera de lana), aún sin usar |
| `public/arte/personajes/nox/joven/*.webp` | Nox joven, mismas 4 expresiones |
| `public/arte/personajes/nox/adulto/*.webp` | Nox adulto, mismas 4 expresiones |
