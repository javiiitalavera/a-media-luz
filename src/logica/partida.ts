// La partida guardada en el móvil.
import type { Mes } from './meses'
import type { MomentoAlbum } from './momentos'
import type { Lugar } from '../contenido/situaciones'
import { ACCIONES, AREAS, COMPANEROS, HAZANAS_INICIALES, type Accion, type AreaId, type CompaneroId, type Ritmo } from '../contenido'

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
  /** Fotos del Álbum (hitos del barrio). */
  momentos?: MomentoAlbum[]
  /** Lo que ya has mirado (para apagar los avisos). */
  vistos?: { album?: string; hazanas?: string; micros?: Partial<Record<CompaneroId, string>>; huellas?: string[] }
  /** 2: hazañas concretas (18/11/2026). Sin él, la partida tiene las acciones genéricas de antes. */
  hazanas?: 2
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
  /** Ya se ha leído en el sobre (el aviso de su casa sigue hasta que entras). */
  leida?: boolean
  /** Ya has entrado en el sitio donde pasó (se apaga su «!»). */
  visitada?: boolean
}

export interface Construccion {
  objetoId: string
  fecha: string
}

/**
 * Crea la partida. `habituales`: las hazañas del catálogo elegidas en el inicio; si no se elige
 * ninguna, se ponen las iniciales.
 */
export function crearPartida(principal: CompaneroId, ahora: Date, habituales?: string[], conHuevo = false): Partida {
  const ids = habituales?.length ? habituales : HAZANAS_INICIALES
  const acciones: Accion[] = ACCIONES.filter((a) => ids.includes(a.id)).map((a) => ({ id: a.id, area: a.area, nombre: a.nombre, ...(a.minima ? { minima: a.minima } : {}) }))
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
    hazanas: 2,
    ...(conHuevo ? { meses: [{ companero: principal, inicio: ahora.toISOString() }] } : {}),
  }
}

export const areaPrincipal = (p: Partida): AreaId => COMPANEROS[p.principal].area
