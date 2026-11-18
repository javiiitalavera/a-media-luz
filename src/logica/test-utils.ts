import type { Partida } from './partida'
import { crearPartida } from './partida'
import { ACCIONES, type AreaId, type CompaneroId } from '../contenido'

export const en = (d: string, h = 12, m = 0) => { const [y, mo, dd] = d.split('-').map(Number); return new Date(y, mo - 1, dd, h, m) }
let n = 0
/** Añade ofrendas directamente (sin azar) en un día. */
export function con(p: Partida, area: AreaId, dia: string, veces = 1, hora = 10): Partida {
  const accionId = p.acciones.find((a) => a.area === area)!.id
  const nuevas = Array.from({ length: veces }, (_, i) => ({ id: `o${++n}`, accionId, area, fecha: en(dia, hora, i).toISOString(), diaMalo: false }))
  return { ...p, ofrendas: [...p.ofrendas, ...nuevas] }
}
/** Partida de prueba con todo el catálogo en la lista. */
export const nueva = (principal: CompaneroId = 'nox', inicio = '2026-01-05') => crearPartida(principal, en(inicio, 9), ACCIONES.map((a) => a.id))
export const azarFijo = (...v: number[]) => { let i = 0; return () => v[i++ % v.length] }
