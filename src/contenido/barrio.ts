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
  frases: [string, ...string[]]
}>> = {
  nox: {
    puntos: [punto(50, 72), punto(53, 67), punto(51, 62), punto(49.3, 57), punto(50.5, 53), punto(54, 48), punto(54.8, 44)],
    sinPuente: [punto(49, 74), punto(53, 68), punto(51.5, 63), punto(50.5, 60)],
    descanso: punto(52, 63),
    segundos: 42, desfase: 5,
    frases: [
      'Estoy haciendo la ronda. Si ves una salchicha, avísame.',
      'He salido para despejarme. Ahora mismo estoy pensando en dos cenas.',
      'Esa piedra me ha mirado raro. He dado un rodeo por educación.',
      '¿Hueles a humo? Es mi manera de decir que voy llegando.',
      'Doy otra vuelta y me voy. Eso dije hace tres vueltas.',
    ],
  },
  tuerca: {
    puntos: [punto(49, 75.8), punto(46, 79), punto(45.5, 83), punto(47.4, 87)],
    descanso: punto(46, 82),
    segundos: 51, desfase: 32,
    frases: [
      'El camino tiene cuatro curvas. He contado cinco por si acaso.',
      'Estoy inspeccionando el camino. El polvo se niega a colaborar.',
      'He numerado las piedras. Alguien ha movido la siete. Se abrirá expediente.',
      'Se admiten atajos. Hay que solicitarlos con dos días de antelación.',
      'He salido a no hacer nada. Llevo apuntados los minutos.',
    ],
  },
  tofu: {
    puntos: [punto(32, 31.7), punto(40, 33.2), punto(46, 34.5), punto(50, 33.4), punto(52.7, 37.4), punto(59.7, 42)],
    descanso: punto(56, 41),
    segundos: 48, desfase: 12,
    frases: [
      'He salido a leer. El brote ha salido a mirar.',
      'Me he traído un libro corto. Llevo dos vueltas por la misma frase.',
      'El musgo del camino va mejor que el mío. Fingiré que no lo he visto.',
      'Me gusta pasar por aquí. Puedo saludar sin dejar de andar.',
      'No busco inspiración. Si aparece, que haga poco ruido.',
    ],
  },
  bruma: {
    puntos: [punto(62, 17.7), punto(55, 18.3), punto(50, 20.6), punto(52, 24), punto(55, 26.5), punto(53, 29.5)],
    descanso: punto(54, 22),
    segundos: 54, desfase: 21,
    frases: [
      'He dejado un poco de niebla en el agua. Se seca sola.',
      'Aquí el agua suena distinta. O yo escucho más despacio.',
      'He venido a sentarme. Lo de andar ha sido un trámite.',
      'Vi una nube con mi forma. La dejé seguir.',
      'Si vas deprisa no se nota, pero el sendero da tiempo a pensar.',
    ],
  },
  madeja: {
    puntos: [punto(69, 32.5), punto(65.5, 33.5), punto(62.5, 36), punto(61, 40), punto(64, 44.5)],
    descanso: punto(63, 36),
    segundos: 46, desfase: 26,
    frases: [
      'Voy a la plaza a enterarme de algo. Si no hay nada, me lo invento.',
      'Me he cruzado con Tofu en mi cabeza. Me ha contado poquísimo, como siempre.',
      'Tengo un recado para cada casa. A mitad de camino ya no sé cuál era para mí.',
      'El barrio parece tranquilo. Eso también es sospechoso.',
      'Si te veo dos veces en la misma vuelta, te cuento lo que iba a callarme.',
    ],
  },
}
