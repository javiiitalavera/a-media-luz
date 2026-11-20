// Momentos del Álbum (decidido por Javi, 18/11/2026): fotos que hace el propio juego en los hitos
// (nace un vecino, crece, termina una historia). Se guarda cómo estaba la escena, no una imagen:
// el Álbum la vuelve a pintar con el arte que ya hay.
import { COMPANEROS, HISTORIAS, OBJETOS_CASA, PROYECTOS_BARRIO, UI, type CompaneroId, type Momento as MomentoDia, type ObjetoCasa } from '../contenido'
import { SITUACIONES, type EscenaMicro, type Lugar } from '../contenido/situaciones'
import type { Partida } from './partida'
import { construido } from './casa'
import { dibujoDelNivel, nacidos, progreso, type Nivel } from './etapas'
import { momentoDelDia } from './momento'
import { diaDelBarrio, dondeGregorio, faseDe, huellasEn } from './situaciones'
import { sitioDe } from './colocar'

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
  visual?: EscenaMicro
  /** Encuadre de cada objeto visible, hasta si seguía en su sitio original. */
  sitios?: Record<string, ObjetoCasa['sitio']>
  /** Posiciones de objetos movidos en fotos de versiones anteriores. */
  colocados?: Record<string, { x: number; y: number }>
}

export interface MomentoAlbum {
  id: string
  fecha: string
  titulo: string
  texto: string
  escena: EscenaFoto
}

/** Cómo está ahora mismo un sitio, para la foto. */
export function fotoDe(p: Partida, lugar: Lugar, ahora: Date, cara: Cara = 'contento'): EscenaFoto {
  const base = { huellas: huellasEn(p, lugar).map((h) => h.id), momentoDia: momentoDelDia(ahora) }
  if (lugar === 'barrio') return { ...base, lugar, etapa: 0, cara, objetos: PROYECTOS_BARRIO.filter((b) => construido(p, b.id)).map((b) => b.id), gregorio: false, vecinos: nacidos(p, ahora) }
  const objetos = OBJETOS_CASA.filter((o) => o.companero === lugar && o.id !== 'aspiradora' && construido(p, o.id) && !p.guardados?.includes(o.id))
  const { micros, visitas } = diaDelBarrio(p, ahora)
  const visita = visitas[lugar]
  const visual = micros[lugar]?.visual
  return {
    ...base,
    lugar,
    etapa: progreso(p, lugar, ahora).etapa,
    cara,
    ...(visita && { visita, visitaEtapa: progreso(p, visita, ahora).etapa }),
    ...(visual && { visual }),
    objetos: objetos.map((o) => o.id),
    sitios: Object.fromEntries(objetos.map((o) => [o.id, sitioDe(p, o)])),
    gregorio: dondeGregorio(p, ahora) === lugar,
  }
}

/** Fija las fotos antiguas en el encuadre que conserva la partida al abrirla. */
export function fijarFotosDeCasa(p: Partida): Partida {
  if (!p.momentos?.some(({ escena }) => escena.lugar !== 'barrio' && !escena.sitios)) return p
  const momentos = p.momentos.map((m) => {
    const e = m.escena
    if (e.lugar === 'barrio' || e.sitios) return m
    const objetos = OBJETOS_CASA.filter((o) => o.companero === e.lugar && e.objetos.includes(o.id))
    const sitios = Object.fromEntries(objetos.map((o) => [o.id, sitioDe({ colocados: e.colocados }, o)]))
    return { ...m, escena: { ...e, sitios } }
  })
  return { ...p, momentos }
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

export function momentoSubirNivel(p: Partida, c: CompaneroId, nivel: Exclude<Nivel, 1>, ahora: Date, frase?: string): Partida {
  const nombre = COMPANEROS[c].nombre
  return anadirMomento(p, {
    id: `crece-${c}-${nivel - 1}`, fecha: ahora.toISOString(), titulo: UI.casa.subioNivel(nombre, nivel),
    texto: frase ?? '', escena: { ...fotoDe(p, c, ahora), etapa: dibujoDelNivel(nivel) },
  })
}

/** Los momentos antiguos conservan su foto y llevan el nombre del nivel que celebraron. */
export function tituloMomento(m: MomentoAlbum): string {
  const c = m.escena.lugar
  if (c !== 'barrio') {
    if (m.id === `crece-${c}-1`) return UI.casa.subioNivel(COMPANEROS[c].nombre, 2)
    if (m.id === `crece-${c}-2`) return UI.casa.subioNivel(COMPANEROS[c].nombre, 3)
  }
  return m.titulo
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
