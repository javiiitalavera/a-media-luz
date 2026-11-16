// Materiales y construcción. Todo se calcula a partir del historial: lo ganado sale de las ofrendas
// y lo gastado, de lo construido. Cada casa tiene sus materiales: los que se ganaron durante el mes
// de su compañero (docs/diseno-meses.md).
import { AREAS, OBJETOS_CASA, type AreaId, type CompaneroId, type ObjetoCasa } from '../contenido'
import type { Partida } from './partida'
import { mesesDe, ofrendasDelMes, queCuentan } from './meses'

export type Materiales = Record<AreaId, number>
const ceros = (): Materiales => Object.fromEntries(Object.keys(AREAS).map((a) => [a, 0])) as Materiales

/** Materiales ganados en la casa de un compañero: lo ganado durante su mes (o meses). */
export function ganados(p: Partida, c: CompaneroId, ahora: Date): Materiales {
  const m = ceros()
  for (const mes of mesesDe(p).filter((x) => x.companero === c))
    for (const o of queCuentan(ofrendasDelMes(p, mes, ahora))) m[o.area]++
  return m
}

export function gastados(p: Partida, c: CompaneroId): Materiales {
  const m = ceros()
  for (const k of p.construcciones ?? []) {
    const o = OBJETOS_CASA.find((x) => x.id === k.objetoId)
    if (o && o.companero === c) for (const [a, n] of Object.entries(o.coste)) m[a as AreaId] += n
  }
  return m
}

/** Materiales que quedan en la casa de un compañero (cada casa tiene los suyos). */
export function disponibles(p: Partida, c: CompaneroId, ahora: Date): Materiales {
  const g = ganados(p, c, ahora), s = gastados(p, c)
  return Object.fromEntries(Object.keys(g).map((a) => [a, g[a as AreaId] - s[a as AreaId]])) as Materiales
}

export const construido = (p: Partida, id: string) => (p.construcciones ?? []).some((c) => c.objetoId === id)

/** Materiales que faltan para construirlo (vacío si se puede). */
export function faltan(p: Partida, o: ObjetoCasa, ahora: Date): Partial<Materiales> {
  const d = disponibles(p, o.companero, ahora)
  const f: Partial<Materiales> = {}
  for (const [a, n] of Object.entries(o.coste)) if (d[a as AreaId] < n) f[a as AreaId] = n - d[a as AreaId]
  return f
}

export const puedeConstruir = (p: Partida, o: ObjetoCasa, ahora: Date) =>
  !construido(p, o.id) && Object.keys(faltan(p, o, ahora)).length === 0

/** Construye si se puede; si no, devuelve null. */
export function construir(p: Partida, id: string, ahora: Date): Partida | null {
  const o = OBJETOS_CASA.find((x) => x.id === id)
  if (!o || !puedeConstruir(p, o, ahora)) return null
  return { ...p, construcciones: [...(p.construcciones ?? []), { objetoId: id, fecha: ahora.toISOString() }] }
}
