// Tema original de A media luz. MIDI: 60 es do central, cada pareja es [pulso, nota].
import type { Momento } from '../contenido'

type Tema = readonly (readonly (readonly [pulso: number, midi: number])[])[]
type Timbre = 'piano' | 'cuerda' | 'flauta'

export interface Estilo {
  bpm: number
  pulsos: 3 | 4
  tema: Tema
  acordes: readonly (readonly [bajo: number, ...voces: number[]])[]
  voz: Timbre
  acompanamiento: 'arpegio' | 'pulso' | 'espaciado'
  brillo: number
  volumen: number
}

const DO = [48, 55, 59, 64] as const
const LAm = [45, 55, 60, 64] as const
const FA = [41, 53, 57, 60, 64] as const
const MIm = [40, 52, 55, 59, 62] as const
const REm = [38, 53, 57, 60, 64] as const
const SOL = [43, 53, 57, 59, 62] as const
const MI = [40, 52, 56, 59, 62] as const
const SOLsus = [43, 53, 55, 60, 62] as const

// Presentación, respuesta, puente y vuelta. Las pausas forman parte de la frase.
const MANANA: Tema = [
  [[0, 64], [0.75, 67], [1.5, 69], [2.5, 72]], [[0.5, 71], [1.5, 67], [2.5, 64]],
  [[0, 65], [1, 69], [2, 67]], [[0, 62], [1.5, 64]],
  [[0, 67], [0.75, 69], [1.5, 72], [2.5, 76]], [[0, 74], [1, 72], [2, 69]],
  [[0.5, 67], [1.5, 65], [2.5, 64]], [[0, 62], [2, 67]],
  [[0, 81], [1.5, 79]], [[0, 76], [1, 74], [2.5, 72]],
  [[0, 77], [1, 76], [2, 74]], [[0, 71]],
  [[0, 64], [0.75, 67], [1.5, 69], [2.5, 72]], [[0.5, 71], [1.5, 67]],
  [[0, 65], [1, 62], [2.5, 64]], [[0, 60]],
]

const PLAZA: Tema = [
  [[0.5, 64], [1.25, 67], [2, 69], [3, 72]], [[0.25, 71], [1.5, 67], [2.25, 64], [3.5, 67]],
  [[0, 65], [1, 69], [1.75, 72], [3, 74]], [[0, 71], [2, 67], [3.5, 62]],
  [[0.5, 64], [1.25, 67], [2, 69], [3, 76]], [[0, 74], [1, 72], [2, 69], [3.5, 72]],
  [[0, 67], [0.75, 65], [1.5, 64], [3, 62]], [[0, 71], [2, 67]],
  [[0, 69], [1.5, 76], [2.5, 79], [3.25, 81]], [[0.5, 79], [1.5, 77], [2.25, 76]],
  [[0, 74], [1, 77], [2, 81], [3, 79]], [[0.5, 74], [2, 71]],
  [[0.5, 64], [1.25, 67], [2, 69], [3, 72]], [[0.25, 71], [1.5, 67], [2.25, 64]],
  [[0, 65], [1, 64], [2, 62], [3.25, 67]], [[0, 60], [2.5, 67]],
]

const TARDE: Tema = [
  [[0, 69], [1.5, 72], [3, 74]], [[0, 76], [2.5, 71]], [[0.5, 69], [2, 65]], [[1, 62]],
  [[0, 67], [1.5, 69], [3, 72]], [[0, 71], [2, 67]], [[1, 65], [2.5, 62]], [[0, 64]],
  [[0.5, 76], [2.5, 79]], [[0, 77], [2, 72]], [[0, 74], [2.5, 71]], [[1, 68]],
  [[0, 69], [1.5, 72], [3, 74]], [[0, 76], [2, 71]], [[0.5, 69], [2, 65]], [[0, 64], [2, 60]],
]

const NOCHE: Tema = [
  [[0.5, 64], [2, 69]], [[0, 72], [1.75, 69]], [[1, 67]], [],
  [[0.5, 64], [2, 69]], [[0, 76], [2.25, 72]], [[0, 71], [2, 67]], [[0.75, 64]],
  [[0, 65], [2, 69]], [[0.5, 72], [2.5, 74]], [[0, 71]], [[1, 68]],
  [[0.5, 64], [2, 69]], [[0, 72], [1.75, 69]], [[0.5, 67], [2, 64]], [[0.5, 60]],
]

export const ESTILOS: Record<Momento | 'apagada', Estilo> = {
  amanecer: { bpm: 75, pulsos: 3, tema: MANANA,
    acordes: [DO, MIm, FA, SOL, DO, LAm, REm, SOL, LAm, DO, REm, SOL, DO, MIm, SOLsus, DO],
    voz: 'flauta', acompanamiento: 'arpegio', brillo: 2400, volumen: .89 },
  mediodia: { bpm: 94, pulsos: 4, tema: PLAZA,
    acordes: [DO, MIm, FA, SOL, DO, LAm, REm, SOL, LAm, FA, REm, SOL, DO, MIm, SOLsus, DO],
    voz: 'cuerda', acompanamiento: 'pulso', brillo: 3000, volumen: 1 },
  atardecer: { bpm: 72, pulsos: 4, tema: TARDE,
    acordes: [FA, MIm, REm, SOL, DO, MIm, REm, DO, LAm, FA, SOL, MI, FA, MIm, REm, DO],
    voz: 'piano', acompanamiento: 'arpegio', brillo: 1710, volumen: .92 },
  noche: { bpm: 64, pulsos: 3, tema: NOCHE,
    acordes: [LAm, FA, DO, MIm, LAm, FA, SOL, DO, REm, FA, SOL, MI, LAm, FA, SOLsus, DO],
    voz: 'piano', acompanamiento: 'espaciado', brillo: 1120, volumen: .75 },
  apagada: { bpm: 55, pulsos: 4, tema: [[[1, 64]], [], [[2, 60]], []],
    acordes: [LAm, FA, DO, MIm], voz: 'piano', acompanamiento: 'espaciado', brillo: 780, volumen: .48 },
}

export function compas(estilo: Estilo, indice: number) {
  const [bajo, ...acorde] = estilo.acordes[indice % estilo.acordes.length]
  return { bajo, acorde, melodia: estilo.tema[indice % estilo.tema.length] }
}

export const frecuencia = (midi: number) => 440 * 2 ** ((midi - 69) / 12)
export const segundosPorPulso = (estilo: Estilo) => 60 / estilo.bpm
