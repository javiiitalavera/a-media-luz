// La partida guardada en el móvil.
import { ACCIONES, AREAS, COMPANEROS, type Accion, type AreaId, type CompaneroId, type Ritmo } from '../contenido'

export interface Ofrenda {
  id: string
  accionId: string
  area: AreaId
  /** Fecha y hora ISO. */
  fecha: string
  diaMalo: boolean
}

/** Objeto encontrado por sorpresa. */
export interface Hallazgo {
  objetoId: string
  fecha: string
}

export interface Partida {
  version: 1
  inicio: string
  principal: CompaneroId
  acciones: Accion[]
  ritmos: Record<AreaId, Ritmo>
  ofrendas: Ofrenda[]
  hallazgos: Hallazgo[]
  /** Día (AAAA-MM-DD) con el modo día malo activo. */
  diaMalo?: string
  frasesRecientes: string[]
}

export function crearPartida(principal: CompaneroId, ahora: Date): Partida {
  return {
    version: 1,
    inicio: ahora.toISOString(),
    principal,
    acciones: ACCIONES.map((a) => ({ ...a })),
    ritmos: Object.fromEntries(Object.values(AREAS).map((a) => [a.id, a.ritmo])) as Record<AreaId, Ritmo>,
    ofrendas: [],
    hallazgos: [],
    frasesRecientes: [],
  }
}

export const areaPrincipal = (p: Partida): AreaId => COMPANEROS[p.principal].area
