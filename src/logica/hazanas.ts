// Hazañas (decidido por Javi, 18/11/2026): concretas y diarias. «Mis hazañas» se quedan a la vista;
// cada día empiezan sin tachar. Lo que haces fuera de tu lista se apunta en «Algo más».
import { ACCIONES, EQUIVALENCIAS_ANTIGUAS, ORDEN_AREAS, type AreaId } from '../contenido'
import type { Accion } from '../contenido'
import type { Partida } from './partida'
import { dia } from './fechas'

export const esHabitual = (a: Accion) => a.habitual !== false && !a.soloEl

/** Como mucho, 10 retos en tu lista (más no se cumplen: se acumulan). Mínimo no hay. */
export const MAX_RETOS = 10

/** Tus retos, ordenados por área (Energía, Mente, Calma, Vínculos, Orden) y, dentro, en el orden en que los añadiste. */
export const misHazanas = (p: Partida) => {
  const lista = p.acciones.filter(esHabitual)
  return lista.map((a, i) => ({ a, i })).sort((x, y) => ORDEN_AREAS.indexOf(x.a.area) - ORDEN_AREAS.indexOf(y.a.area) || x.i - y.i).map((x) => x.a)
}

/** ¿Cabe uno más en tu lista? */
export const cabeOtro = (p: Partida) => misHazanas(p).length < MAX_RETOS

/** La hazaña está hecha hoy (cuenta una vez al día). */
export const hechaHoy = (p: Partida, id: string, ahora: Date) => p.ofrendas.some((o) => o.accionId === id && dia(o.fecha) === dia(ahora))

/** Retos puntuales de hoy (hechos o no): se ven en «Solo hoy» hasta que acaba el día. */
export function puntualesHoy(p: Partida, ahora: Date): Accion[] {
  const hoy = dia(ahora)
  return p.acciones.filter((a) => a.soloEl === hoy)
}
/** Los que aún no has hecho. */
export const pendientesHoy = (p: Partida, ahora: Date): Accion[] => puntualesHoy(p, ahora).filter((a) => !hechaHoy(p, a.id, ahora))

/** Lo apuntado hoy que no está en tu lista (desde «Algo más»). */
export function extrasHoy(p: Partida, ahora: Date): Accion[] {
  const hoy = dia(ahora)
  const ids = new Set(p.ofrendas.filter((o) => dia(o.fecha) === hoy).map((o) => o.accionId))
  return p.acciones.filter((a) => !a.soloEl && !esHabitual(a) && ids.has(a.id))
}

/** Del catálogo, las que no están en tu lista (para «Algo más» y para añadir). */
export const delCatalogoSinUsar = (p: Partida) => ACCIONES.filter((c) => !misHazanas(p).some((a) => a.id === c.id))

/** Quita del catálogo lo que no es de la partida (las reacciones). */
const limpia = (c: Accion): Accion => ({ id: c.id, area: c.area, nombre: c.nombre, ...(c.minima ? { minima: c.minima } : {}) })

/** Añade a la lista (o recupera) una hazaña del catálogo, o vuelve a hacer habitual una que se usó en «Algo más». */
export function anadirHazana(p: Partida, id: string, habitual = true): Partida {
  const ya = p.acciones.find((a) => a.id === id)
  if (ya?.soloEl) return p
  if (habitual && !(ya && esHabitual(ya)) && !cabeOtro(p)) return p
  if (ya) return { ...p, acciones: p.acciones.map((a) => (a.id === id ? { ...a, habitual: habitual ? undefined : false } : a)) }
  const c = ACCIONES.find((x) => x.id === id)
  if (!c) return p
  return { ...p, acciones: [...p.acciones, { ...limpia(c), ...(habitual ? {} : { habitual: false }) }] }
}

/** Saca una hazaña de tu lista. Su historial se conserva. */
export const quitarHazana = (p: Partida, id: string): Partida =>
  ({ ...p, acciones: p.acciones.map((a) => (a.id === id ? { ...a, habitual: false } : a)) })

/** Crea una hazaña propia. Sin nombre no se crea; la mínima es opcional. */
export function crearHazana(p: Partida, datos: { nombre: string; area: AreaId; minima?: string; soloEl?: string }, id: string, habitual = !datos.soloEl): Partida {
  const nombre = datos.nombre.trim()
  if (!nombre || (habitual && !cabeOtro(p))) return p
  const minima = datos.minima?.trim()
  return { ...p, acciones: [...p.acciones, { id: `propia-${id}`, area: datos.area, nombre, ...(minima ? { minima } : {}), ...(habitual ? {} : { habitual: false }), ...(datos.soloEl ? { soloEl: datos.soloEl } : {}) }] }
}

/** Cambia el nombre (con su meta), la versión mínima o, si es propia, el área. Una mínima vacía la quita; un nombre vacío no se guarda. */
export function editarHazana(p: Partida, id: string, cambio: { nombre?: string; minima?: string; area?: AreaId }): Partida {
  return {
    ...p,
    acciones: p.acciones.map((a) => {
      if (a.id !== id) return a
      const r: Accion = { ...a, nombre: cambio.nombre?.trim() || a.nombre, ...(cambio.area && esPropia(a) ? { area: cambio.area } : {}) }
      if (cambio.minima !== undefined) {
        const m = cambio.minima.trim()
        if (m) r.minima = m
        else delete r.minima
      }
      return r
    }),
  }
}

/** Lo que se lee en la tarjeta: con el modo día malo, su versión mínima si la tiene. */
/** En día malo, cada reto pasa a su versión mínima: la del catálogo o, si no tiene (los propios), «…, aunque sea un poco». */
export const textoHazana = (a: Accion, diaMalo: boolean) => (!diaMalo ? a.nombre : a.minima ?? `${a.nombre}, aunque sea un poco`)

/**
 * Partidas de antes (acciones genéricas): pasan a las hazañas concretas equivalentes, sin perder las
 * propias ni el historial (las ofrendas pasadas se reapuntan a la hazaña nueva).
 */
export function migrarHazanas(p: Partida): Partida {
  if (p.hazanas === 3) return p
  if (p.hazanas === 2) return alinearAreas(p)
  const nuevoId = (id: string) => EQUIVALENCIAS_ANTIGUAS[id] ?? id
  const acciones: Accion[] = []
  for (const a of p.acciones) {
    const id = nuevoId(a.id)
    if (acciones.some((x) => x.id === id)) continue
    const c = ACCIONES.find((x) => x.id === id)
    acciones.push(c ? limpia(c) : a)
  }
  return alinearAreas({ ...p, acciones, ofrendas: p.ofrendas.map((o) => ({ ...o, accionId: nuevoId(o.accionId) })) })
}

/** v3 (19/11/2026): los retos del catálogo que cambiaron de área (dormir → Calma, diario → Mente, jugar
 *  fuera → Vínculos) se pasan a su área nueva. Lo ya hecho sigue contando en el área en que se hizo. */
function alinearAreas(p: Partida): Partida {
  const acciones = p.acciones.map((a) => {
    const c = ACCIONES.find((x) => x.id === a.id)
    return c && c.area !== a.area ? { ...a, area: c.area } : a
  })
  return { ...p, hazanas: 3, acciones }
}

export const esPropia = (a: Accion) => a.id.startsWith('propia-')

/** Borra de verdad un reto propio: desaparece de tu lista y de «Algo más». Lo que ya hiciste sigue contando. */
export const borrarHazana = (p: Partida, id: string): Partida =>
  ({ ...p, acciones: p.acciones.filter((a) => !(a.id === id && esPropia(a))) })

/** Tus retos propios que no están en tu lista (los apuntaste en «Algo más» o los quitaste). */
export const propiasFuera = (p: Partida) => p.acciones.filter((a) => esPropia(a) && !a.soloEl && !esHabitual(a))
