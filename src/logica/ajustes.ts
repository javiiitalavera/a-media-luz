import type { AreaId, Ritmo } from '../contenido'
import type { Partida } from './partida'

export const cambiarRitmo = (p: Partida, area: AreaId, ritmo: Ritmo): Partida => ({ ...p, ritmos: { ...p.ritmos, [area]: ritmo } })
