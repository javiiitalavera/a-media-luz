// Modo de prueba: al «volver a hoy», todo lo apuntado con el reloj adelantado se mueve los mismos días
// hacia atrás, para que la partida siga igual (vecinos nacidos, historias, fotos…) en la fecha real.
import type { Partida } from './partida'
import { sumarDias } from './fechas'

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/
const DIA = /^\d{4}-\d{2}-\d{2}$/

function mover(v: unknown, dias: number): unknown {
  if (typeof v === 'string') {
    if (ISO.test(v)) return new Date(Date.parse(v) + dias * 86_400_000).toISOString()
    if (DIA.test(v)) return sumarDias(v, dias)
    return v
  }
  if (Array.isArray(v)) return v.map((x) => mover(x, dias))
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, mover(x, dias)]))
  return v
}

/** Mueve todas las fechas de la partida `dias` días (negativo: hacia atrás). */
export const desplazarPartida = (p: Partida, dias: number): Partida => (dias ? (mover(p, dias) as Partida) : p)
