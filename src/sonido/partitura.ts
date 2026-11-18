// Música generativa: qué suena en cada momento del día. Lógica pura (sin audio), con tests.
// Notas en MIDI (60 = do central). Cada compás tiene 4 pulsos y un acorde.
import type { Azar } from '../logica/azar'
import type { Momento } from '../contenido'

export interface Estilo {
  bpm: number
  /** Acordes (notas MIDI) que se repiten en bucle, uno por compás. */
  progresion: number[][]
  /** Notas posibles para la melodía de caja de música. */
  escala: number[]
  /** Probabilidad de que suene una nota de melodía en cada corchea (0–1). */
  densidad: number
  /** Frecuencia de corte del filtro del colchón: más alta = más brillante. */
  brillo: number
  /** Volumen relativo (1 = normal). */
  volumen: number
}

const PENTA_DO = [72, 74, 76, 79, 81, 84, 86, 88]
const PENTA_RE = [74, 76, 78, 81, 83, 86, 88]
const PENTA_LA_MENOR = [69, 72, 74, 76, 79, 81, 84]

export const ESTILOS: Record<Momento | 'apagada', Estilo> = {
  // Amanecer: luminoso y tranquilo. Cmaj7 – Am7 – Fmaj7 – G6
  amanecer: {
    bpm: 66,
    progresion: [[48, 55, 59, 64], [45, 55, 60, 64], [41, 57, 60, 64], [43, 55, 59, 64]],
    escala: PENTA_DO,
    densidad: 0.32,
    brillo: 1800,
    volumen: 0.9,
  },
  // Mediodía: un poco más vivo. Dmaj7 – Bm7 – Gmaj7 – A6
  mediodia: {
    bpm: 72,
    progresion: [[50, 57, 61, 66], [47, 57, 62, 66], [43, 59, 62, 66], [45, 57, 61, 66]],
    escala: PENTA_RE,
    densidad: 0.38,
    brillo: 2200,
    volumen: 1,
  },
  // Atardecer: cálido, bajando. Fmaj7 – Em7 – Dm7 – Cmaj7
  atardecer: {
    bpm: 62,
    progresion: [[41, 57, 60, 64], [40, 55, 59, 62], [38, 57, 60, 65], [36, 55, 59, 64]],
    escala: PENTA_DO,
    densidad: 0.28,
    brillo: 1400,
    volumen: 0.9,
  },
  // Noche: lento y oscuro, como una nana. Am7 – Fmaj7 – Cmaj7 – Em7
  noche: {
    bpm: 54,
    progresion: [[45, 55, 60, 64], [41, 57, 60, 64], [36, 55, 59, 64], [40, 55, 59, 62]],
    escala: PENTA_LA_MENOR,
    densidad: 0.18,
    brillo: 900,
    volumen: 0.72,
  },
  // Casa apagada: casi nada, solo el colchón y alguna nota suelta.
  apagada: {
    bpm: 50,
    progresion: [[45, 52, 57, 60], [41, 48, 57, 60]],
    escala: [69, 72, 76],
    densidad: 0.06,
    brillo: 600,
    volumen: 0.45,
  },
}

export interface NotaMelodia {
  /** Pulso dentro del compás (0, 0.5, 1 … 3.5). */
  pulso: number
  midi: number
}

export interface Compas {
  acorde: number[]
  bajo: number
  melodia: NotaMelodia[]
}

/** Genera el compás número `indice` de un estilo. Nunca repite la misma nota seguida y deja respirar. */
export function generarCompas(estilo: Estilo, indice: number, azar: Azar, ultimaNota?: number): Compas {
  const acorde = estilo.progresion[indice % estilo.progresion.length]
  const melodia: NotaMelodia[] = []
  let previa = ultimaNota
  for (let corchea = 0; corchea < 8; corchea++) {
    // Más probable en pulsos fuertes; nunca dos corcheas seguidas.
    const fuerte = corchea % 2 === 0 ? 1.4 : 0.6
    if (melodia.length && melodia[melodia.length - 1].pulso === (corchea - 1) / 2) continue
    if (azar() >= estilo.densidad * fuerte) continue
    // Prefiere notas cercanas a la anterior (melodía suave).
    const opciones = estilo.escala.filter((n) => n !== previa && (previa === undefined || Math.abs(n - previa) <= 7))
    const lista = opciones.length ? opciones : estilo.escala.filter((n) => n !== previa)
    const midi = lista[Math.floor(azar() * lista.length)]
    melodia.push({ pulso: corchea / 2, midi })
    previa = midi
  }
  return { acorde, bajo: acorde[0] - 12, melodia }
}

export const frecuencia = (midi: number) => 440 * 2 ** ((midi - 69) / 12)
export const segundosPorPulso = (estilo: Estilo) => 60 / estilo.bpm
