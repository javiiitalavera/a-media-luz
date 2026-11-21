// La partida guardada en el móvil.
import type { Mes } from './meses'
import type { RelacionVecino } from './convivencia'
import type { MomentoAlbum } from './momentos'
import type { Nivel } from './etapas'
import type { Perfil } from '../contenido/cuestionario'
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
  nivelesVistos?: Partial<Record<CompaneroId, Nivel>>
  /** Los vecinos, en orden de llegada (se guardan como «meses» por historia: si falta, el principal ya vivía en casa). */
  meses?: Mes[]
  /** Cómo va cada situación del vecindario. */
  situaciones?: Record<string, EstadoSituacion>
  /** Respuestas del cuestionario (para sugerir retos). */
  perfil?: Perfil
  /** Fotos del Álbum (hitos del barrio). */
  momentos?: MomentoAlbum[]
  /** Lo que ya has mirado (para apagar los avisos). */
  /** Dónde has dejado cada objeto al ordenar la casa (pies, en % del fondo). Si no está, en su sitio de siempre. */
  colocados?: Record<string, { x: number; y: number }>
  /** Objetos construidos que has guardado en el baúl (no se ven en su casa hasta que los sacas). */
  guardados?: string[]
  /** Parejas de muebles descubiertas al experimentar con la decoración; sin marcador visible. */
  vecindadesVistas?: string[]
  /** Confianza nacida del trato voluntario, sin barras ni castigos por ausencia. */
  relaciones?: Partial<Record<CompaneroId, RelacionVecino>>
  /** Último saludo espontáneo por vecino: entrar y salir del mapa no crea ruido. */
  saludosVistos?: Partial<Record<CompaneroId, string>>
  vistos?: { gags?: Partial<Record<string, string>>; pina?: 'guardada' | 'aqui'; album?: string; albumSec?: Partial<Record<SeccionAlbum, string>>; hazanas?: string; micros?: Partial<Record<CompaneroId, string>>; huellas?: string[]; cronicas?: Record<string, string>; momentos?: Record<string, string>; curiosidades?: Record<string, string>; proyectosCasa?: Partial<Record<CompaneroId, string[]>>; proyectosBarrio?: string[]; pideReto?: Partial<Record<CompaneroId, string>> }
  /** 2: hazañas concretas (18/11/2026). Sin él, la partida tiene las acciones genéricas de antes. */
  hazanas?: 2 | 3 | 4
  /** Novedades del barrio que aún no se han visto («Mientras no estabas…»). */
  noticias?: NoticiaBarrio[]
  /** Lecturas sueltas que ha hecho el barrio de tu diario (logica/lector.ts). */
  lecturas?: { clave: string; vecino: CompaneroId; texto: string; fecha: string }[]
  /** Subir la meta de un reto (logica/subir.ts): cuándo se subió o se dijo que no a cada uno, y el día de la última respuesta. */
  metas?: { dia?: string; subidas?: Record<string, string>; rechazos?: Record<string, string> }
  /** Semanas (su lunes) que Tuerca ya ha informado. */
  informes?: string[]
}

export interface EstadoSituacion {
  /** Lo que se leyó en tu diario al empezar (si nace de un patrón): «{dias}» y compañía. */
  datos?: Record<string, number>
  /** Última fase que ha ocurrido. */
  fase: number
  /** Día (AAAA-MM-DD) en que ocurrió. */
  dia: string
  decision?: string
  fin?: boolean
}

export interface NoticiaBarrio {
  origen?: 'diario' | 'cronica'
  texto: string
  lugar: Lugar
  fecha: string
  /** Ya se ha leído en el sobre (el aviso de su casa sigue hasta que entras). */
  leida?: boolean
  /** Ya has entrado en el sitio donde pasó (se apaga su «!»). */
  visitada?: boolean
}

export interface Construccion {
  coste?: Partial<Record<AreaId, number>>
  objetoId: string
  fecha: string
}

/**
 * Crea la partida. `habituales`: las hazañas del catálogo elegidas en el inicio; si no se pasa
 * nada, se ponen las iniciales. Una lista vacía elegida a propósito se respeta (se apunta con «Algo más»).
 */
export function crearPartida(principal: CompaneroId, ahora: Date, habituales?: string[], conHuevo = false): Partida {
  const ids = habituales ?? HAZANAS_INICIALES
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
    hazanas: 4,
    ...(conHuevo ? { meses: [{ companero: principal, inicio: ahora.toISOString() }] } : {}),
  }
}

export const areaPrincipal = (p: Partida): AreaId => COMPANEROS[p.principal].area

/** Las tres partes del Álbum. */
export type SeccionAlbum = 'momentos' | 'cronicas' | 'curiosidades'
