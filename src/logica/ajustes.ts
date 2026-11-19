import type { AreaId, Ritmo } from '../contenido'
import type { Partida } from './partida'

/** Días tras los que conviene volver a hacer copia (y avisa Ajustes). */
export const DIAS_COPIA = 14
/** ¿Toca copia? Si la partida tiene más de dos semanas y no hay copia o la última es de hace más de dos semanas. */
export function tocaCopia(inicio: string, ultimaCopia: string | undefined, ahora: Date): boolean {
  const dias = (f: string) => (ahora.getTime() - Date.parse(f)) / 86_400_000
  return dias(inicio) > DIAS_COPIA && (!ultimaCopia || dias(ultimaCopia) > DIAS_COPIA)
}

export const cambiarRitmo = (p: Partida, area: AreaId, ritmo: Ritmo): Partida => ({ ...p, ritmos: { ...p.ritmos, [area]: ritmo } })
