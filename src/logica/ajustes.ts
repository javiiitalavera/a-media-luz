import type { AreaId, Ritmo } from '../contenido'
import type { Partida } from './partida'

/** Crea una acción propia en un área (sin nombre no se crea; sin mínima, usa el nombre). */
export function crearAccion(p: Partida, area: AreaId, nombre: string, minima: string, id: string): Partida {
  const n = nombre.trim()
  if (!n) return p
  return { ...p, acciones: [...p.acciones, { id: `propia-${id}`, area, nombre: n, minima: minima.trim() || n }] }
}

/** Borra una acción propia o de ejemplo (sus ofrendas pasadas se conservan). */
export const borrarAccion = (p: Partida, id: string): Partida => ({ ...p, acciones: p.acciones.filter((a) => a.id !== id) })

export const cambiarRitmo = (p: Partida, area: AreaId, ritmo: Ritmo): Partida => ({ ...p, ritmos: { ...p.ritmos, [area]: ritmo } })

/** Cambia el nombre o la versión mínima de una acción. Un texto vacío no se guarda. */
export function editarAccion(p: Partida, id: string, cambio: { nombre?: string; minima?: string }): Partida {
  return {
    ...p,
    acciones: p.acciones.map((a) =>
      a.id !== id ? a : { ...a, nombre: cambio.nombre?.trim() || a.nombre, minima: cambio.minima?.trim() || a.minima }),
  }
}
