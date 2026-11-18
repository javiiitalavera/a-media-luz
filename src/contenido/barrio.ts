// El mapa del barrio (public/arte/barrio/mapa.webp, 1024 × 1536). Posiciones en % del mapa, localizadas
// automáticamente en el dibujo.

export const PROPORCION_BARRIO = 1024 / 1536

/** Las 5 parcelas, en orden de llegada de los vecinos: centro y ancho. */
export const PARCELAS: { x: number; y: number; ancho: number }[] = [
  { x: 25.9, y: 67.7, ancho: 32.4 }, // abajo a la izquierda (el primero: Nox)
  { x: 71.9, y: 68.1, ancho: 32.2 }, // abajo a la derecha (el segundo: Tuerca)
  { x: 20.6, y: 38.0, ancho: 27.8 }, // centro a la izquierda
  { x: 36.3, y: 23.4, ancho: 27.1 }, // arriba a la izquierda
  { x: 74.4, y: 27.2, ancho: 27.7 }, // arriba a la derecha
]

/** El paso de piedras del arroyo, donde va el puente. */
export const PASO_ARROYO = { x: 50, y: 58.5, ancho: 16 }

/** La plaza del centro (para proyectos del barrio futuros). */
export const PLAZA = { x: 52.7, y: 40.4 }
