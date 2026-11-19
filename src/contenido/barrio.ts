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
export const PASO_ARROYO = { x: 49.3, y: 56.6, ancho: 12.8, giro: 7 }

/** El mobiliario queda junto al borde, con el centro libre para los vecinos. */
export const PLAZA = {
  banco: { x: 59, y: 38.4, ancho: 8.5 },
  farol: { x: 63.4, y: 39.1, ancho: 3.8 },
  encuentro: { x: 55.5, y: 42.8, ancho: 8 },
}

/** Luces ya dibujadas en el mapa (farolillos, ventanas, setas), para que brillen de noche. */
export const LUCES_BARRIO = [
  { x: 33, y: 83.6 }, { x: 58.6, y: 83.6 }, { x: 21, y: 11 }, { x: 13, y: 23.5 }, { x: 77.3, y: 41.4 }, { x: 81, y: 76 },
]
