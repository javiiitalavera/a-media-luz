# Dirección artística

Aprobada por Javi el 15 de noviembre de 2026. Redactada con ChatGPT, que lleva el arte del proyecto.

**Referencia vinculante:** la lámina conjunta de los cinco personajes, `docs/arte/lamina-personajes.webp`, y su ambiente de bosque ilustrado.

## El mundo
Un **jardín o bosque ilustrado, cálido y onírico**, en ilustración 2D de estilo indie:
- capas de vegetación, colinas suaves y árboles de copa coral;
- un refugio acogedor, farolillos, luciérnagas, flores pequeñas y profundidad atmosférica.

Los entornos son ricos y evocadores. Los personajes son **más sencillos** que los entornos.

## Paleta
Suave, cromática, de bosque fantástico.

| Uso | Color de partida |
|---|---|
| Árboles y flora rosada | `#E58B91` |
| Luz de amanecer y coral | `#F4B2A1` |
| Crema cálida | `#F9EBDD` |
| Colinas y hojas salvia | `#A1AF8D` |
| Verde grisáceo, profundidad | `#667C70` |
| Contornos y sombra ciruela | `#563B50` |
| Luz cálida (cola de Nox, faroles) | ámbar `#FFC145` |

**Legibilidad:**
- La paleta suave es para el arte. Los textos y botones de la interfaz tienen que leerse bien siempre (contraste WCAG ≥ 4,5).
- Si el mundo cambia con la hora del día, de noche no se convierte en un fondo negro sin más: conserva coral, salvia y ciruela con luces cálidas puntuales.

## Los personajes
- *Cute*, minimalistas, formas redondeadas, **contornos limpios oscuros** de grosor casi constante y **caras muy simples** (ojos ovalados pequeños).
- Nada de pelaje con textura, ojos realistas, volumen 3D ni anatomía de animal real.
- **Fidelidad:** el dibujo de cada personaje es **exacto o casi exacto al de la lámina**: misma silueta, proporciones, orientación y expresión. No se «mejora» ni se reinterpreta.
- Las expresiones de la lámina (contento, sorprendido, dormido…) son el punto de partida. Tienen que ser coherentes entre sí.

## Producción de recursos
1. Se parte de la **ilustración aprobada** de cada personaje y se guarda como referencia maestra.
2. Cada personaje se entrega **aislado, con fondo transparente** y en su pose canónica, y se valida su fidelidad **antes** de animarlo.
3. Los escenarios se entregan **sin personajes ni texto**, por capas: fondo lejano, plano medio, primer plano y elementos animables (vegetación, faroles, partículas).
4. **Formato:** PNG o WebP con transparencia, para conservar el acabado ilustrado. SVG solo si reproduce fielmente el original. Las partes que se animan (cola y llama, ojos y párpados…) van en capas separadas.
5. **Animaciones:** contenidas y baratas (flotar, respirar, parpadear, balancearse, luces). Deben pararse con «reducir movimiento».
6. **Peso:** optimizado para móvil.
7. **Prohibido:** dibujar o «aproximar» los personajes a mano en código. Un intento anterior fue rechazado precisamente por no parecerse a la lámina.

## Claves de estilo (de la lámina)
- Simple y expresivo.
- Cálido y onírico.
- Por capas, fácil de animar.
- Coherente y reconocible: cada silueta se distingue sola.
