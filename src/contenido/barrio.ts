import type { CompaneroId } from './tipos'

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
  madeja: { apoyo: { x: 38, y: 93 }, ventana: { x: 70.5, y: 61 }, proporcion: 1220 / 1239 },
}

/** El paso de piedras del arroyo, donde va el puente. */
export const PASO_ARROYO = { x: 49.3, y: 56.6, ancho: 12.8, giro: 7 }

/** El mobiliario queda junto al borde, con el centro libre para los vecinos. */
export const PLAZA = {
  banco: { x: 59, y: 38.4, ancho: 8.5 },
  farol: { x: 63.4, y: 39.1, ancho: 3.8 },
}

/** Luces ya dibujadas en el mapa (farolillos, ventanas, setas), para que brillen de noche. */
export const LUCES_BARRIO = [
  { x: 33, y: 83.6 }, { x: 58.6, y: 83.6 }, { x: 21, y: 11 }, { x: 13, y: 23.5 }, { x: 77.3, y: 41.4 }, { x: 81, y: 76 },
]

export type PuntoMapa = { x: number; y: number }
const punto = (x: number, y: number): PuntoMapa => ({ x, y })

/** Recorridos sobre los senderos pintados, desde el punto de apoyo de los pies. */
export const PASEOS_BARRIO: Partial<Record<CompaneroId, {
  puntos: PuntoMapa[]
  sinPuente?: PuntoMapa[]
  descanso: PuntoMapa
  segundos: number
  desfase: number
  frase: string
}>> = {
  nox: {
    puntos: [punto(50, 72), punto(53, 67), punto(51, 62), punto(49.3, 57), punto(50.5, 53), punto(54, 48), punto(54.8, 44)],
    sinPuente: [punto(49, 74), punto(53, 68), punto(51.5, 63), punto(50.5, 60)],
    descanso: punto(52, 63),
    segundos: 42, desfase: 5,
    frase: 'Estoy haciendo la ronda. Si ves una salchicha, avísame.',
  },
  tuerca: {
    puntos: [punto(49, 75.8), punto(46, 79), punto(45.5, 83), punto(47.4, 87)],
    descanso: punto(46, 82),
    segundos: 51, desfase: 32,
    frase: 'El camino tiene cuatro curvas. He contado cinco por si acaso.',
  },
  tofu: {
    puntos: [punto(32, 31.7), punto(40, 33.2), punto(46, 34.5), punto(50, 33.4), punto(52.7, 37.4), punto(59.7, 42)],
    descanso: punto(56, 41),
    segundos: 48, desfase: 12,
    frase: 'He salido a leer. El brote ha salido a mirar.',
  },
  bruma: {
    puntos: [punto(62, 17.7), punto(55, 18.3), punto(50, 20.6), punto(52, 24), punto(55, 26.5), punto(53, 29.5)],
    descanso: punto(54, 22),
    segundos: 54, desfase: 21,
    frase: 'He dejado un poco de niebla en el agua. Se seca sola.',
  },
}
