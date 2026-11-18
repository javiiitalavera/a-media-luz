// La partida guardada en el móvil.
import type { Mes } from './meses'
import type { Lugar } from '../contenido/situaciones'
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
  /** Cosas construidas en las casas (se añadió después: puede faltar en partidas antiguas). */
  construcciones?: Construccion[]
  /** Última etapa de crecimiento que se ha visto de cada compañero (para celebrarla una vez). */
  etapasVistas?: Partial<Record<CompaneroId, 0 | 1 | 2>>
  /** Los vecinos, en orden de llegada (se guardan como «meses» por historia: si falta, el principal ya vivía en casa). */
  meses?: Mes[]
  /** Cómo va cada situación del vecindario. */
  situaciones?: Record<string, EstadoSituacion>
  /** Novedades del barrio que aún no se han visto («Mientras no estabas…»). */
  noticias?: NoticiaBarrio[]
}

export interface EstadoSituacion {
  /** Última fase que ha ocurrido. */
  fase: number
  /** Día (AAAA-MM-DD) en que ocurrió. */
  dia: string
  decision?: string
  fin?: boolean
}

export interface NoticiaBarrio {
  texto: string
  lugar: Lugar
  fecha: string
}

export interface Construccion {
  objetoId: string
  fecha: string
}

/**
 * Crea la partida. `habituales`: acciones de ejemplo elegidas en el inicio; en las áreas donde no se
 * elige ninguna se ponen las dos primeras de ejemplo, para que todas tengan algo.
 */
export function crearPartida(principal: CompaneroId, ahora: Date, habituales?: string[], conHuevo = false): Partida {
  const acciones = habituales?.length
    ? (Object.keys(AREAS) as AreaId[]).flatMap((area) => {
        const delArea = ACCIONES.filter((a) => a.area === area)
        const elegidas = delArea.filter((a) => habituales.includes(a.id))
        return (elegidas.length ? elegidas : delArea.slice(0, 2)).map((a) => ({ ...a }))
      })
    : ACCIONES.map((a) => ({ ...a }))
  return {
    version: 1,
    inicio: ahora.toISOString(),
    principal,
    acciones,
    ritmos: Object.fromEntries(Object.values(AREAS).map((a) => [a.id, a.ritmo])) as Record<AreaId, Ritmo>,
    ofrendas: [],
    hallazgos: [],
    frasesRecientes: [],
    construcciones: [],
    ...(conHuevo ? { meses: [{ companero: principal, inicio: ahora.toISOString() }] } : {}),
  }
}

export const areaPrincipal = (p: Partida): AreaId => COMPANEROS[p.principal].area
