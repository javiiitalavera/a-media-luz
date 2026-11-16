// Un compañero al mes (docs/diseno-meses.md). Cada mes dura 28 días desde que llega el huevo; el huevo
// eclosiona con las primeras ofrendas; lo ganado ese mes es de la casa de ese compañero.
import { AREAS, ORDEN_COMPANEROS, type AreaId, type CompaneroId } from '../contenido'
import type { Partida } from './partida'
import { TOPE_DIARIO } from './reglas'
import { dia, sumarDias } from './fechas'
import { elegir, type Azar } from './azar'

export const DIAS_MES = 28
export const OFRENDAS_ECLOSION = 3

export interface Mes {
  companero: CompaneroId
  /** Fecha ISO en que llegó el huevo. */
  inicio: string
  /** Fecha ISO en que se vio su eclosión y su presentación (para enseñarlas una sola vez). */
  presentado?: string
  /** Fecha ISO en que se vio el informe final (y se cerró el mes). */
  cerrado?: string
}

/** Los meses jugados (las partidas antiguas tienen uno implícito: su compañero principal desde el inicio). */
export const mesesDe = (p: Partida): Mes[] => p.meses ?? [{ companero: p.principal, inicio: p.inicio }]

/** Medianoche (local) del día en que acaba el mes: el día 29 contando el de llegada como día 1. */
export function finDe(m: Mes): Date {
  const [y, mo, d] = sumarDias(dia(m.inicio), DIAS_MES).split('-').map(Number)
  return new Date(y, mo - 1, d)
}

/**
 * Ventana de tiempo de un mes: desde que llega el huevo hasta que se cierra (al ver el informe y
 * llegar el huevo siguiente). Mientras no se cierre, sigue abierto: nada de lo que hagas se pierde.
 */
export const ventana = (m: Mes) => ({ desde: new Date(m.inicio), hasta: m.cerrado ? new Date(m.cerrado) : new Date(8.64e15) })

export const mesActual = (p: Partida): Mes => mesesDe(p).at(-1)!

/** Día del mes (1–28) y si ya ha terminado (falta ver el informe). */
export function diaDelMes(m: Mes, ahora: Date) {
  const n = Math.floor((ahora.getTime() - new Date(dia(m.inicio) + 'T00:00:00').getTime()) / 86_400_000) + 1
  return { dia: Math.min(Math.max(n, 1), DIAS_MES), terminado: ahora >= finDe(m) }
}

/** Ofrendas hechas durante un mes, en orden, hasta `ahora`. */
export function ofrendasDelMes(p: Partida, m: Mes, ahora: Date) {
  const { desde, hasta } = ventana(m)
  return p.ofrendas
    .filter((o) => { const f = new Date(o.fecha); return f >= desde && f < hasta && f <= ahora })
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
}

/** Fecha en que eclosionó el huevo (la ofrenda número 3 del mes), o null si aún no. */
export function eclosion(p: Partida, m: Mes, ahora: Date): string | null {
  return ofrendasDelMes(p, m, ahora)[OFRENDAS_ECLOSION - 1]?.fecha ?? null
}

/** Ofrendas que cuentan (como mucho 3 al día por área). */
export function queCuentan<T extends { area: AreaId; fecha: string }>(lista: T[]): T[] {
  const porDia = new Map<string, number>()
  return lista.filter((o) => {
    const k = `${o.area}|${dia(o.fecha)}`
    const n = (porDia.get(k) ?? 0) + 1
    porDia.set(k, n)
    return n <= TOPE_DIARIO
  })
}

/** Crecimiento del compañero en su mes: ofrendas de su área principal que cuentan. */
export function crecimientoDelMes(p: Partida, m: Mes, ahora: Date, area: AreaId): number {
  return queCuentan(ofrendasDelMes(p, m, ahora)).filter((o) => o.area === area).length
}

/** El siguiente compañero: uno de los que aún no han salido, al azar; si ya salieron todos, cualquiera. */
export function siguienteCompanero(p: Partida, azar: Azar): CompaneroId {
  const usados = new Set(mesesDe(p).map((m) => m.companero))
  const libres = ORDEN_COMPANEROS.filter((c) => !usados.has(c))
  return elegir(libres.length ? libres : [...ORDEN_COMPANEROS], azar)!
}

/** Cierra el mes actual (tras ver el informe) y llega el huevo siguiente. */
export function empezarMesSiguiente(p: Partida, ahora: Date, azar: Azar): Partida {
  const meses = mesesDe(p)
  const cerrados = meses.map((m, i) => (i === meses.length - 1 ? { ...m, cerrado: ahora.toISOString() } : m))
  return { ...p, meses: [...cerrados, { companero: siguienteCompanero({ ...p, meses: cerrados }, azar), inicio: ahora.toISOString() }] }
}

export interface Informe {
  dias: number
  diasConAlgo: number
  porArea: Record<AreaId, number>
  total: number
}

/** Resumen del mes para el informe final (los objetos construidos y la etapa los pone quien lo muestra). */
export function informe(p: Partida, m: Mes, ahora: Date): Informe {
  const fin = finDe(m)
  const lista = ofrendasDelMes(p, m, ahora).filter((o) => new Date(o.fecha) < fin)
  const porArea = Object.fromEntries(Object.keys(AREAS).map((a) => [a, 0])) as Record<AreaId, number>
  for (const o of lista) porArea[o.area]++
  return { dias: DIAS_MES, diasConAlgo: new Set(lista.map((o) => dia(o.fecha))).size, porArea, total: lista.length }
}

/** Estado del compañero del mes: aún en el huevo, recién nacido (falta enseñar su eclosión) o ya en casa. */
export function estadoDelMes(p: Partida, ahora: Date): 'huevo' | 'naciendo' | 'vivo' {
  if (!p.meses) return 'vivo' // partidas de antes de los meses: su compañero ya vivía en casa
  const m = mesActual(p)
  if (!eclosion(p, m, ahora)) return 'huevo'
  return m.presentado ? 'vivo' : 'naciendo'
}

/** Marca como vista la eclosión y presentación del compañero del mes. */
export function marcarPresentado(p: Partida, ahora: Date): Partida {
  const meses = mesesDe(p)
  return { ...p, meses: meses.map((m, i) => (i === meses.length - 1 ? { ...m, presentado: ahora.toISOString() } : m)) }
}

/** Ofrendas que le faltan al huevo para abrirse. */
export const faltanParaEclosion = (p: Partida, ahora: Date) =>
  Math.max(0, OFRENDAS_ECLOSION - ofrendasDelMes(p, mesActual(p), ahora).length)
