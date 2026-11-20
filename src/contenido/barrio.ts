import type { CompaneroId, Momento } from './tipos'

// El mapa del barrio (public/arte/barrio/mapa.webp, 1024 × 1536). Posiciones en % del mapa, localizadas
// automáticamente en el dibujo.

export const PROPORCION_BARRIO = 1024 / 1536

/** Punto donde acaba la entrada y ancho del dibujo, en porcentajes del mapa. */
export const PARCELAS = [
  { x: 31.0, y: 70.4, ancho: 26.6 }, // abajo a la izquierda
  { x: 65.8, y: 71.0, ancho: 26.4 }, // abajo a la derecha
  { x: 17.2, y: 42.7, ancho: 22.8 }, // centro a la izquierda
  { x: 34.1, y: 22.4, ancho: 22.2 }, // claro superior izquierdo
  { x: 74.4, y: 29.9, ancho: 22.7 }, // claro superior derecho
]

/** Puntos dentro del dibujo y proporción del WebP de cada casita. */
export const CASITAS: Record<CompaneroId, {
  apoyo: { x: number; y: number }
  ventana: { x: number; y: number }
  proporcion: number
}> = {
  nox: { apoyo: { x: 69, y: 91 }, ventana: { x: 56, y: 57 }, proporcion: 785 / 789 },
  tuerca: { apoyo: { x: 27, y: 91 }, ventana: { x: 73, y: 63 }, proporcion: 801 / 831 },
  tofu: { apoyo: { x: 34, y: 91 }, ventana: { x: 40, y: 53 }, proporcion: 739 / 800 },
  bruma: { apoyo: { x: 40, y: 66 }, ventana: { x: 76, y: 45 }, proporcion: 1019 / 986 },
  madeja: { apoyo: { x: 50, y: 90 }, ventana: { x: 50, y: 55 }, proporcion: 1 },
}

/** El paso de piedras del arroyo, donde va el puente. */
export const PASO_ARROYO = { x: 49.3, y: 56.6, ancho: 12.8, giro: 7 }

/** El mobiliario queda junto al borde, con el centro libre para los vecinos. */
export const PLAZA = {
  banco: { x: 59, y: 38.4, ancho: 8.5 },
  farol: { x: 63.4, y: 39.1, ancho: 3.8 },
  encuentro: { x: 54.8, y: 44.0, ancho: 9.2 },
}

/** Luces ya dibujadas en el mapa (farolillos, ventanas, setas), para que brillen de noche. */
export const LUCES_BARRIO = [
  { x: 33, y: 83.6 }, { x: 58.6, y: 83.6 }, { x: 21, y: 11 }, { x: 13, y: 23.5 }, { x: 77.3, y: 41.4 }, { x: 81, y: 76 },
]

/** Quién pasa por la plaza según el momento del día (si ya vive en el barrio) y lo que dice al tocarlo. */
export const VISITA_PLAZA: Partial<Record<Momento, CompaneroId>> = { amanecer: 'bruma', mediodia: 'tofu', atardecer: 'nox' }
export const FRASES_PLAZA: Partial<Record<CompaneroId, string>> = {
  nox: 'Estoy vigilando el puente. El banco es por motivos de seguridad.',
  tofu: 'He venido a leer. El brote ha venido a mirar.',
  bruma: 'He dejado un poco de niebla en el agua. Se seca sola.',
}
