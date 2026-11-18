// Materiales y construcción (docs/diseno-vecindario.md). Todo se calcula a partir del historial: lo ganado
// sale de las hazañas y lo gastado, de lo construido. Los materiales son de una bolsa común del vecindario.
import { AREAS, OBJETOS_CASA, PROYECTOS_BARRIO, type AreaId, type CompaneroId, type ObjetoCasa } from '../contenido'
import type { Ofrenda, Partida } from './partida'
import { TOPE_DIARIO } from './reglas'
import { dia } from './fechas'

export type Materiales = Record<AreaId, number>
const ceros = (): Materiales => Object.fromEntries(Object.keys(AREAS).map((a) => [a, 0])) as Materiales

/**
 * Hazañas que dan recompensa (material y crecimiento): cada acción, una vez al día, y como mucho 3 por
 * área y día. Las demás se pueden registrar, pero no suman.
 */
export function queRecompensan<T extends Pick<Ofrenda, 'accionId' | 'area' | 'fecha'>>(lista: T[]): T[] {
  const vistas = new Set<string>()
  const porArea = new Map<string, number>()
  return [...lista].sort((a, b) => a.fecha.localeCompare(b.fecha)).filter((o) => {
    const d = dia(o.fecha)
    const k = `${o.accionId}|${d}`
    if (vistas.has(k)) return false
    const ka = `${o.area}|${d}`
    const n = porArea.get(ka) ?? 0
    if (n >= TOPE_DIARIO) return false
    vistas.add(k)
    porArea.set(ka, n + 1)
    return true
  })
}

/** Materiales ganados hasta `ahora`: 1 por hazaña que recompensa. */
export function ganados(p: Partida, ahora: Date): Materiales {
  const m = ceros()
  for (const o of queRecompensan(p.ofrendas.filter((x) => new Date(x.fecha) <= ahora))) m[o.area]++
  return m
}

const costeDe = (id: string) => (OBJETOS_CASA.find((x) => x.id === id) ?? PROYECTOS_BARRIO.find((x) => x.id === id))?.coste ?? {}

export function gastados(p: Partida): Materiales {
  const m = ceros()
  for (const k of p.construcciones ?? []) for (const [a, n] of Object.entries(costeDe(k.objetoId))) m[a as AreaId] += n
  return m
}

/** La bolsa común. Nunca por debajo de 0 (por si una partida antigua trae algo construido con otras reglas). */
export function disponibles(p: Partida, ahora: Date): Materiales {
  const g = ganados(p, ahora), s = gastados(p)
  return Object.fromEntries(Object.keys(g).map((a) => [a, Math.max(0, g[a as AreaId] - s[a as AreaId])])) as Materiales
}

export const construido = (p: Partida, id: string) => (p.construcciones ?? []).some((c) => c.objetoId === id)

/** Materiales que faltan para construirlo (vacío si se puede). */
export function faltan(p: Partida, o: { coste: Partial<Materiales> }, ahora: Date): Partial<Materiales> {
  const d = disponibles(p, ahora)
  const f: Partial<Materiales> = {}
  for (const [a, n] of Object.entries(o.coste)) if (d[a as AreaId] < n) f[a as AreaId] = n - d[a as AreaId]
  return f
}

/** Proyectos personales de un vecino, en orden. */
export const proyectosDe = (c: CompaneroId) =>
  OBJETOS_CASA.filter((o) => o.companero === c && o.orden !== undefined).sort((a, b) => a.orden! - b.orden!)

/** Los que se ven: los ya hechos y el siguiente (se van desvelando de uno en uno). */
export function proyectosVisibles(p: Partida, c: CompaneroId): ObjetoCasa[] {
  const todos = proyectosDe(c)
  const siguiente = todos.findIndex((o) => !construido(p, o.id))
  return siguiente < 0 ? todos : todos.slice(0, siguiente + 1)
}

export const proyectosHechos = (p: Partida, c: CompaneroId) => proyectosDe(c).filter((o) => construido(p, o.id)).length

export const puedeConstruir = (p: Partida, o: ObjetoCasa, ahora: Date) =>
  proyectosVisibles(p, o.companero).some((x) => x.id === o.id) && !construido(p, o.id) && Object.keys(faltan(p, o, ahora)).length === 0

/** Construye un proyecto personal (o del barrio, si `barrio`) si se puede; si no, devuelve null. */
export function construir(p: Partida, id: string, ahora: Date, barrioDisponible = false): Partida | null {
  const o = OBJETOS_CASA.find((x) => x.id === id)
  const b = PROYECTOS_BARRIO.find((x) => x.id === id)
  const ok = o ? puedeConstruir(p, o, ahora)
    : b ? barrioDisponible && !construido(p, b.id) && Object.keys(faltan(p, b, ahora)).length === 0
    : false
  if (!ok) return null
  return { ...p, construcciones: [...(p.construcciones ?? []), { objetoId: id, fecha: ahora.toISOString() }] }
}
