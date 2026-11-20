// Vecinos y crecimiento (docs/diseno-vecindario.md). Los vecinos son para siempre. Crecen por hitos: días
// distintos con alguna hazaña de su área (desde que llegó su huevo) y proyectos personales terminados.
// Nunca bajan. El siguiente huevo aparece cuando el último en llegar es joven; se incuba cuando quieras.
import { COMPANEROS, type CompaneroId } from '../contenido'
import type { Partida } from './partida'
import { eclosion, mesActual, mesesDe } from './meses'
import { proyectosHechos, queRecompensan } from './casa'
import { dia } from './fechas'

export type Etapa = 0 | 1 | 2

/** Días distintos con hazañas de su área para ser joven y adulto (valores iniciales, se ajustarán jugando). */
export const UMBRALES: Record<CompaneroId, { joven: number; adulto: number }> = {
  nox: { joven: 4, adulto: 12 },
  tofu: { joven: 3, adulto: 9 },
  bruma: { joven: 3, adulto: 9 },
  madeja: { joven: 2, adulto: 6 },
  tuerca: { joven: 2, adulto: 6 },
}
export const PROYECTOS_PARA = { joven: 1, adulto: 3 } as const

/** Orden en que llegan los siguientes (en el prototipo, el segundo siempre es Tuerca). */
export const ORDEN_LLEGADA: CompaneroId[] = ['nox', 'tuerca', 'tofu', 'bruma', 'madeja']

export const vecinoDe = (p: Partida, c: CompaneroId) => mesesDe(p).find((m) => m.companero === c)

/**
 * ¿Está ya en el barrio? Cuenta desde que lo presentas (abres su huevo), no desde que el huevo está listo:
 * hasta entonces no sale en historias, no regala nada ni se construye para él.
 * (En partidas antiguas, un vecino anterior al último sin fecha de presentación cuenta desde su eclosión.)
 */
export function nacido(p: Partida, c: CompaneroId, ahora: Date): boolean {
  const m = vecinoDe(p, c)
  if (!m) return false
  if (m.presentado) return true
  return m !== mesesDe(p).at(-1) && eclosion(p, m, ahora) !== null
}

export const nacidos = (p: Partida, ahora: Date): CompaneroId[] =>
  mesesDe(p).map((m) => m.companero).filter((c) => nacido(p, c, ahora))

/** Días distintos con alguna hazaña de su área (que recompense) desde que llegó su huevo. */
export function diasActivos(p: Partida, c: CompaneroId, ahora: Date): number {
  const m = vecinoDe(p, c)
  if (!m) return 0
  const desde = new Date(m.inicio)
  const area = COMPANEROS[c].area
  const suyas = queRecompensan(p.ofrendas).filter((o) => o.area === area && new Date(o.fecha) >= desde && new Date(o.fecha) <= ahora)
  return new Set(suyas.map((o) => dia(o.fecha))).size
}

export interface Progreso {
  etapa: Etapa
  dias: number
  proyectos: number
  /** Lo que pide la siguiente etapa (null si ya es adulto). */
  siguiente: { dias: number; proyectos: number } | null
  /** Cuánto lleva hacia la siguiente, de 0 a 1 (mitad días, mitad proyectos), para la barra. */
  fraccion: number
}

export function progreso(p: Partida, c: CompaneroId, ahora: Date): Progreso {
  const dias = diasActivos(p, c, ahora)
  const proyectos = proyectosHechos(p, c)
  const u = UMBRALES[c]
  const ganada: Etapa = dias >= u.adulto && proyectos >= PROYECTOS_PARA.adulto ? 2
    : dias >= u.joven && proyectos >= PROYECTOS_PARA.joven ? 1 : 0
  const vista = p.etapasVistas?.[c] ?? 0
  const etapa = vista > ganada ? vista : ganada
  const siguiente = etapa === 0 ? { dias: u.joven, proyectos: PROYECTOS_PARA.joven }
    : etapa === 1 ? { dias: u.adulto, proyectos: PROYECTOS_PARA.adulto } : null
  const fraccion = siguiente ? (Math.min(1, dias / siguiente.dias) + Math.min(1, proyectos / siguiente.proyectos)) / 2 : 1
  return { etapa, dias, proyectos, siguiente, fraccion }
}

/** ¿Ha crecido desde la última vez que se vio su casa? (para la celebración). */
export const crecioSinVer = (p: Partida, c: CompaneroId, etapa: Etapa) => etapa > (p.etapasVistas?.[c] ?? 0)

export const marcarEtapaVista = (p: Partida, c: CompaneroId, etapa: Etapa): Partida =>
  ({ ...p, etapasVistas: { ...p.etapasVistas, [c]: etapa } })

/**
 * El siguiente huevo, si ya puede aparecer: el último en llegar ha nacido, es joven y ha terminado al menos
 * un proyecto suyo. `posibles`: los que tienen su arte listo. Null si no toca o no queda nadie.
 */
export function huevoDisponible(p: Partida, ahora: Date, posibles: readonly CompaneroId[]): CompaneroId | null {
  const ultimo = mesActual(p).companero
  if (!nacido(p, ultimo, ahora)) return null
  if (progreso(p, ultimo, ahora).etapa < 1 || proyectosHechos(p, ultimo) < 1) return null
  const usados = new Set(mesesDe(p).map((m) => m.companero))
  return ORDEN_LLEGADA.find((c) => posibles.includes(c) && !usados.has(c)) ?? null
}

/** Incubar el huevo: llega el siguiente vecino (sale con 3 hazañas, como el primero). */
export function incubar(p: Partida, c: CompaneroId, ahora: Date): Partida {
  return { ...p, meses: [...mesesDe(p), { companero: c, inicio: ahora.toISOString() }] }
}
