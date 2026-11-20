// Llegada y eclosión de los vecinos. Se conserva «meses» en las partidas guardadas.
import type { CompaneroId } from '../contenido'
import type { Partida } from './partida'

export const OFRENDAS_ECLOSION = 3

export interface Mes {
  companero: CompaneroId
  /** Fecha ISO en que llegó el huevo. */
  inicio: string
  /** El huevo de la puerta ya está listo cuando lo recoges. */
  listo?: boolean
  /** Fecha ISO en que se vio su eclosión y su presentación (para enseñarlas una sola vez). */
  presentado?: string
  /** Fecha ISO en que se vio el informe final (y se cerró el mes). */
  cerrado?: string
  /** Los 3 retos del mes, elegidos al nacer el compañero (fijos, salvo un comodín). */
  retos?: Reto[]
  /** Si ya se usó el comodín para cambiar un reto. */
  comodinUsado?: boolean
}

export interface Reto {
  accionId: string
  /** Veces que hay que hacerla a lo largo del mes. */
  veces: number
}

/** Los meses jugados (las partidas antiguas tienen uno implícito: su compañero principal desde el inicio). */
export const mesesDe = (p: Partida): Mes[] => p.meses ?? [{ companero: p.principal, inicio: p.inicio, presentado: p.inicio }]

/**
 * Ventana de tiempo de un mes: desde que llega el huevo hasta que se cierra (al ver el informe y
 * llegar el huevo siguiente). Mientras no se cierre, sigue abierto: nada de lo que hagas se pierde.
 */
const ventana = (m: Mes) => ({ desde: new Date(m.inicio), hasta: m.cerrado ? new Date(m.cerrado) : new Date(8.64e15) })

export const mesActual = (p: Partida): Mes => mesesDe(p).at(-1)!

/** Ofrendas hechas durante un mes, en orden, hasta `ahora`. */
function ofrendasDelMes(p: Partida, m: Mes, ahora: Date) {
  const { desde, hasta } = ventana(m)
  return p.ofrendas
    .filter((o) => { const f = new Date(o.fecha); return f >= desde && f < hasta && f <= ahora })
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
}

/** Fecha en que el huevo estuvo listo para abrirse, o null si aún no. */
export function eclosion(p: Partida, m: Mes, ahora: Date): string | null {
  if (m.listo && new Date(m.inicio) <= ahora) return m.inicio
  return ofrendasDelMes(p, m, ahora)[OFRENDAS_ECLOSION - 1]?.fecha ?? null
}

/** Estado del compañero del mes: aún en el huevo, recién nacido (falta enseñar su eclosión) o ya en casa. */
export function estadoDelMes(p: Partida, ahora: Date): 'huevo' | 'naciendo' | 'vivo' {
  const m = mesActual(p)
  if (m.presentado) return 'vivo'
  return eclosion(p, m, ahora) ? 'naciendo' : 'huevo'
}

/** Marca como vista la eclosión y presentación del compañero del mes. */
export function marcarPresentado(p: Partida, ahora: Date): Partida {
  const meses = mesesDe(p)
  return { ...p, meses: meses.map((m, i) => (i === meses.length - 1 ? { ...m, presentado: ahora.toISOString() } : m)) }
}

/** Ofrendas que le faltan al huevo para abrirse. */
export function faltanParaEclosion(p: Partida, ahora: Date): number {
  const m = mesActual(p)
  return m.listo ? 0 : Math.max(0, OFRENDAS_ECLOSION - ofrendasDelMes(p, m, ahora).length)
}
