# Coordinación entre Claude y ChatGPT — A media luz

**Vigente desde:** 15/11/2026. **Fuente de verdad:** este repositorio. La conversación de uno de los asistentes NO se transmite automáticamente al otro.

## Objetivo
Desarrollar desde cero sin sobrescribir ni duplicar trabajos. La **lámina aprobada** `docs/arte/lamina-personajes.webp` manda sobre cualquier dibujo posterior. No recuperar el proyecto eliminado ni asumir las mecánicas antiguas.

## Responsabilidades y propiedad de rutas

| Área / archivos | Responsable de ESCRIBIR | El otro puede… |
|---|---|---|
| `docs/direccion-artistica.md` | **ChatGPT** | Leer y señalar necesidades mediante entrega |
| `docs/arte/**` y `public/arte/**` | **ChatGPT** | Usar en el juego; **no retocar, sustituir o renombrar archivos** |
| `docs/entregas-arte.md` | **ChatGPT** | Leer el inventario y el estado de cada asset |
| `docs/diseno-juego.md` | **Claude** | Leer, hacer observaciones al usuario; no reescribir |
| `docs/personajes.md` | **Claude** | Leer. Aspecto, nombres, áreas y personalidades son canon; no rediseñar |
| `src/**`, `package.json`, `index.html`, `vite.config.*`, tests, PWA y despliegue | **Claude** | ChatGPT revisa pantallas y propone mejoras visuales; **no edita el código** |
| `README.md`, `CLAUDE.md`, `docs/capas-arte.md` y esta coordinación | **Claude** desde esta configuración inicial | ChatGPT los lee y propone cambios; no edita en paralelo |

**Distinción:** ChatGPT diseña las expresiones y poses y entrega sus archivos gráficos; **Claude programa** las animaciones, componentes React y el montaje de los recursos, sin cambiar la identidad gráfica. No significa que Claude pueda reconstruir un personaje «a ojo» con SVG.

## Cómo trabajamos

1. **Primero especificación:** Claude desarrolla el borrador `docs/diseno-juego.md` con el usuario. Hasta aprobarlo, NO programar mecánicas definitivas.
2. **En paralelo, arte independiente:** ChatGPT prepara la referencia del bosque y los personajes **sin cambiar código**. Cada ilustración pasa por aprobación visual del usuario antes de marcarse `APROBADO`.
3. **Entrega:** ChatGPT añade el recurso aprobado a `public/arte/` y lo registra en `docs/entregas-arte.md` con ruta, tamaño, dimensiones, transparencia, propósito, estados y uso previsto. Los materiales puramente conceptuales permanecen en `docs/arte/`.
4. **Integración:** Claude lee `docs/entregas-arte.md`, usa **los archivos exactos** entregados y programa la composición, interacciones, animación y pruebas. No sustituye un asset por otro parecido ni mete texto dentro de los fondos.
5. **Revisión:** ChatGPT evalúa capturas o una versión ejecutada en el móvil y deja observaciones visuales concretas. Claude decide la implementación técnica y solicita nuevos assets si hacen falta.
6. **Publicación:** Claude o el usuario integra cambios validados en `main`; ChatGPT **no publica directamente cambios artísticos incompletos en `main`**.

## Regla GitHub — no pisarse

- **Una única rama de integración:** `main`. No hacer commits directos concurrentes de dos asistentes.
- Para entregas de arte, ChatGPT usa una rama propia `arte/<tema>` y un PR contra `main`. Claude puede trabajar en `dev/<tema>` o integrar su código en `main` como determine el usuario. **Solo Claude/el usuario fusiona PR artísticos**, comprobando compatibilidad.
- No modificar archivos asignados al otro sin petición específica; si una tarea requiere ambas cosas, ChatGPT sube primero los assets con su manifestación y Claude los conecta después.
- No hacer `force push`, borrar trabajo de otro ni auto-merge sin autorización. Actualizar la rama antes de iniciar una entrega nueva. Si cambia un archivo desde la última lectura, detenerse y revisar el conflicto, no sobrescribir.
- Si hay una decisión que afecte a ambos, escribirla en el documento que corresponda y avisar al usuario para que la traslade. **GitHub es la comunicación asíncrona**, no una conversación secreta entre agentes.

## Contrato de recursos gráficos

- **Referencia obligatoria:** `docs/arte/lamina-personajes.webp`, no las versiones SVG rechazadas. Personajes minimalistas y cute; entorno indie ilustrado coral/crema/salvia.
- **Fondos:** imagen sin texto, mascota ni controles de UI; preferentemente separada en capas estáticas/animables, con medidas y encaje indicados. Un fondo completo puede servir para prototipar, pero NO sustituye a la entrega en capas cuando se necesite paralaje o interacción.
- **Mascotas:** pose canónica transparente, escala y anclaje consistentes, elementos animables separados si procede (ojos, cola, llama, brote); cinco estados de luz cuando el nuevo diseño de mecánicas los confirme.
- **Archivos:** WebP o PNG transparentes según convenga; no convertir obligatoriamente a SVG si pierde fidelidad. Evitar un único montaje de pantalla con botones y texto incrustados.
- **Nombres orientativos:** `public/arte/personajes/nox/base.webp`, `public/arte/personajes/nox/cola.webp`, `public/arte/escenarios/claro/fondo.webp`, `public/arte/escenarios/claro/primer-plano.webp`.
- **Interfaz:** los textos son reales y controlados por Claude; ChatGPT puede aportar ejemplos, layout y colores, pero no introducir nuevos textos de diálogo como arte rasterizado.
- **Rendimiento/accesibilidad:** recursos adecuados para móvil, optimizados, animaciones compatibles con reducir movimiento.

## Estado actual (15/11/2026)

- `docs/diseno-juego.md` está **APROBADO** por el usuario, con las reglas numéricas en su sección «Reglas».
- La app base está programada (React + Vite, PWA) con todas las pantallas y la lógica con tests. **No tiene arte**: muestra huecos neutros hasta que haya recursos APROBADOS en `docs/entregas-arte.md`.
- El Bosque es un **sendero vertical con una escena por rincón** montada por capas. Las claves, tamaños y formatos que la app espera están en `docs/capas-arte.md` (lo escribe Claude; ChatGPT lo lee).
- Faltan también los **iconos de la app** (PWA), detallados en `docs/capas-arte.md`.
- La lámina de los cinco personajes es **referencia aprobada**. Las imágenes generadas en conversaciones son **propuestas** hasta validación y entrega al repositorio.

## Próximo ciclo

**ChatGPT:** el Claro del fuego en capas (fondo, crecimiento 1-3, maleza, visitante) y Nox con sus cuatro expresiones, según `docs/capas-arte.md`; después los iconos y los demás rincones. **Claude:** integrar cada entrega aprobada, programar sus animaciones y probarla en móvil.
