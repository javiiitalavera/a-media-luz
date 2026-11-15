// Qué capas de arte tocan según el estado de un rincón (docs/capas-arte.md).
import type { ClaveArte, Expresion } from './manifiesto'
import type { EstadoRincon } from '../logica/reglas'

export function expresionDe(r: EstadoRincon): Expresion {
  if (!r.llegado) return 'dormido'
  if (r.fase >= 2) return 'enfurrunado'
  if (r.hoy > 0) return 'contento'
  return 'base'
}

/** Capas del escenario, de abajo arriba (el compañero va aparte, encima). */
export function capasDe(r: EstadoRincon): ClaveArte[] {
  const a = r.area
  const capas: ClaveArte[] = [`rincon/${a}/fondo`]
  if (r.grado > 0) capas.push(`rincon/${a}/crecimiento-${r.grado as 1 | 2 | 3}`)
  if (r.fase >= 1) capas.push(`rincon/${a}/maleza`)
  if (r.visitante) capas.push(`rincon/${a}/visitante`)
  return capas
}


/** Piezas que unen una escena con la siguiente en el sendero del Bosque. */
export function transicionesDe(orden: readonly EstadoRincon['area'][]): ClaveArte[] {
  return orden.slice(1).map((a, i) => `sendero/${orden[i]}-${a}` as ClaveArte)
}
