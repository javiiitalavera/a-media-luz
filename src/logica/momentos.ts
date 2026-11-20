// Momentos del Álbum (decidido por Javi, 18/11/2026): fotos que hace el propio juego en los hitos
// (nace un vecino, crece, termina una historia). Se guarda cómo estaba la escena, no una imagen:
// el Álbum la vuelve a pintar con el arte que ya hay.
import { COMPANEROS, HISTORIAS, OBJETOS_CASA, PROYECTOS_BARRIO, UI, type CompaneroId, type Momento as MomentoDia } from '../contenido'
import { SITUACIONES, type Lugar } from '../contenido/situaciones'
import type { Partida } from './partida'
import { construido } from './casa'
import { nacidos, progreso } from './etapas'
import { momentoDelDia } from './momento'
import { dondeGregorio, faseDe, huellasEn, visitante } from './situaciones'

export type Cara = 'base' | 'contento' | 'enfurrunado' | 'dormido'

export interface EscenaFoto {
  lugar: Lugar
  etapa: 0 | 1 | 2
  cara: Cara
  visita?: CompaneroId
  /** Cómo era el visitante en la foto (las fotos antiguas no lo guardan: cachorro). */
  visitaEtapa?: 0 | 1 | 2
  /** Lo construido en esa casa (o en el barrio). */
  objetos: string[]
  huellas: string[]
  gregorio: boolean
  momentoDia: MomentoDia
  /** En el barrio: quién vive ya (sus casitas). */
  vecinos?: CompaneroId[]
  /** Dónde estaban las cosas que habías movido (para que la foto no cambie al reordenar después). */
  colocados?: Record<string, { x: number; y: number }>
}

export interface MomentoAlbum {
  id: string
  fecha: string
  titulo: string
  texto: string
  escena: EscenaFoto
}

/** Lo movido en una casa (si hay algo). */
function colocadosDe(p: Partida, c: CompaneroId) {
  const propios = Object.entries(p.colocados ?? {}).filter(([id]) => OBJETOS_CASA.find((o) => o.id === id)?.companero === c)
  return propios.length ? Object.fromEntries(propios) : undefined
}

/** Cómo está ahora mismo un sitio, para la foto. */
export function fotoDe(p: Partida, lugar: Lugar, ahora: Date, cara: Cara = 'contento'): EscenaFoto {
  const base = { huellas: huellasEn(p, lugar).map((h) => h.id), momentoDia: momentoDelDia(ahora) }
  if (lugar === 'barrio') return { ...base, lugar, etapa: 0, cara, objetos: PROYECTOS_BARRIO.filter((b) => construido(p, b.id)).map((b) => b.id), gregorio: false, vecinos: nacidos(p, ahora) }
  return {
    ...base,
    lugar,
    etapa: progreso(p, lugar, ahora).etapa,
    cara,
    ...(() => { const v = visitante(p, lugar, ahora); return v ? { visita: v, visitaEtapa: progreso(p, v, ahora).etapa } : {} })(),
    objetos: OBJETOS_CASA.filter((o) => o.companero === lugar && o.id !== 'aspiradora' && construido(p, o.id) && !p.guardados?.includes(o.id)).map((o) => o.id),
    gregorio: dondeGregorio(p, ahora) === lugar,
    ...(colocadosDe(p, lugar) && { colocados: colocadosDe(p, lugar) }),
  }
}

/** Añade un momento (una sola vez por id). */
export function anadirMomento(p: Partida, m: MomentoAlbum): Partida {
  if ((p.momentos ?? []).some((x) => x.id === m.id)) return p
  return { ...p, momentos: [...(p.momentos ?? []), m] }
}

export function momentoNacimiento(p: Partida, c: CompaneroId, ahora: Date): Partida {
  const nombre = COMPANEROS[c].nombre
  return anadirMomento(p, {
    id: `nace-${c}`, fecha: ahora.toISOString(), titulo: UI.album2.nacio(nombre),
    texto: HISTORIAS[c]?.despedida ?? '', escena: { ...fotoDe(p, c, ahora), etapa: 0 },
  })
}

export function momentoCrecer(p: Partida, c: CompaneroId, etapa: 1 | 2, ahora: Date, frase?: string): Partida {
  const nombre = COMPANEROS[c].nombre
  return anadirMomento(p, {
    id: `crece-${c}-${etapa}`, fecha: ahora.toISOString(), titulo: UI.casa.crecio(nombre, UI.casa.etapas[etapa]),
    texto: frase ?? '', escena: { ...fotoDe(p, c, ahora), etapa },
  })
}

/** Las historias que acaban de terminar dejan su foto, en el sitio de su última fase. */
export function momentosDeHistorias(antes: Partida, despues: Partida, ahora: Date): Partida {
  let p = despues
  for (const s of SITUACIONES) {
    const e = despues.situaciones?.[s.id]
    if (!e?.fin || antes.situaciones?.[s.id]?.fin) continue
    const ultima = faseDe(s, e.fase, e.decision, e.datos)
    p = anadirMomento(p, {
      id: `historia-${s.id}`, fecha: ahora.toISOString(), titulo: s.titulo, texto: ultima.noticia || ultima.recuerdo || '',
      escena: fotoDe(p, ultima.lugar, ahora, 'base'),
    })
  }
  return p
}

/** Los momentos, del más reciente al más antiguo. */
export const momentosRecientes = (p: Partida) => [...(p.momentos ?? [])].reverse()
