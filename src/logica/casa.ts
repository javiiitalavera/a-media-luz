// Materiales y construcción. Todo se calcula a partir del historial: lo ganado sale de las ofrendas
// y lo gastado, de lo construido.
import { AREAS, OBJETOS_CASA, type AreaId, type ObjetoCasa } from '../contenido'
import type { Partida } from './partida'
import { TOPE_DIARIO } from './reglas'
import { dia } from './fechas'

export type Materiales = Record<AreaId, number>
const ceros = (): Materiales => Object.fromEntries(Object.keys(AREAS).map((a) => [a, 0])) as Materiales

/** Materiales ganados hasta `ahora`: 1 por ofrenda, como mucho 3 al día por área. */
export function ganados(p: Partida, ahora: Date): Materiales {
  const m = ceros()
  const porDia = new Map<string, number>()
  for (const o of p.ofrendas) {
    if (new Date(o.fecha) > ahora) continue
    const k = `${o.area}|${dia(o.fecha)}`
    const n = (porDia.get(k) ?? 0) + 1
    porDia.set(k, n)
    if (n <= TOPE_DIARIO) m[o.area]++
  }
  return m
}

export function gastados(p: Partida): Materiales {
  const m = ceros()
  for (const c of p.construcciones ?? []) {
    const o = OBJETOS_CASA.find((x) => x.id === c.objetoId)
    if (o) for (const [a, n] of Object.entries(o.coste)) m[a as AreaId] += n
  }
  return m
}

export function disponibles(p: Partida, ahora: Date): Materiales {
  const g = ganados(p, ahora), s = gastados(p)
  return Object.fromEntries(Object.keys(g).map((a) => [a, g[a as AreaId] - s[a as AreaId]])) as Materiales
}

export const construido = (p: Partida, id: string) => (p.construcciones ?? []).some((c) => c.objetoId === id)

/** Materiales que faltan para construirlo (vacío si se puede). */
export function faltan(p: Partida, o: ObjetoCasa, ahora: Date): Partial<Materiales> {
  const d = disponibles(p, ahora)
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
