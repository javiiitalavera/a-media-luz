// Curiosidades: lo que se tiene (guardado en `hallazgos`), las sorpresas al tachar hazañas y las que
// deja cada historia al terminar.
import { AREAS, ORDEN_AREAS, type AreaId } from '../contenido'
import { CURIOSIDADES, type Curiosidad } from '../contenido/curiosidades'
import type { Azar } from './azar'
import type { Partida } from './partida'
import { dia, diasEntre } from './fechas'
import { azarConSemilla } from './azar'
import { misHazanas } from './hazanas'
import { nacido } from './etapas'

/**
 * Probabilidad de hallazgo del día. Cada día hay un vecino «con suerte»: el que lleva más tiempo sin encontrar
 * nada entre los de las áreas que estás haciendo. Lo encuentra (o no) con el primer reto de su área: así no
 * importa en qué orden taches la lista y la colección crece pareja entre vecinos.
 */
export const PROBABILIDAD_SORPRESA = 0.5
const tiene = (p: Partida, id: string) => p.hallazgos.some((x) => x.objetoId === id)

/** Las curiosidades conseguidas, de la más reciente a la más antigua (los hallazgos antiguos se ignoran). */
export function curiosidadesTenidas(p: Partida): { c: Curiosidad; fecha: string }[] {
  return p.hallazgos.flatMap((x) => {
    const c = CURIOSIDADES.find((k) => k.id === x.objetoId)
    return c ? [{ c, fecha: x.fecha }] : []
  }).reverse()
}

const libresDe = (p: Partida, vecino: string) => CURIOSIDADES.filter((c) => c.vecino === vecino && !c.historia && c.id !== 'pina' && !tiene(p, c.id))
/** El último hallazgo al azar de un vecino (vacío si nunca). */
const ultimoDe = (p: Partida, vecino: string) =>
  p.hallazgos.filter((x) => CURIOSIDADES.some((c) => c.id === x.objetoId && c.vecino === vecino && !c.historia)).map((x) => x.fecha).sort().at(-1) ?? ''

/** El área con suerte hoy (o null si no hay ninguna que pueda encontrar algo). */
export function areaConSuerte(p: Partida, ahora: Date): AreaId | null {
  const hoy = dia(ahora)
  const recientes = new Set(p.ofrendas.filter((o) => { const d = diasEntre(dia(o.fecha), hoy); return d >= 0 && d < 7 }).map((o) => o.area))
  const enLista = new Set(misHazanas(p).map((a) => a.area))
  const r = azarConSemilla(`${hoy}|hallazgo`)
  const elegibles = ORDEN_AREAS.filter((a) => (recientes.has(a) || enLista.has(a)) && nacido(p, AREAS[a].companero, ahora) && libresDe(p, AREAS[a].companero).length)
    .map((a) => ({ a, u: ultimoDe(p, AREAS[a].companero), t: r() }))
    .sort((x, y) => x.u.localeCompare(y.u) || x.t - y.t)
  return elegibles[0]?.a ?? null
}

/** ¿Encuentra algo el vecino del área? Solo el del área con suerte, con el primer reto de su área del día, y con suerte. */
export function sorpresa(p: Partida, area: AreaId, ahora: Date, azar: Azar): Curiosidad | null {
  const vecino = AREAS[area].companero
  if (!nacido(p, vecino, ahora)) return null
  const hoy = dia(ahora)
  if (p.hallazgos.some((x) => dia(x.fecha) === hoy && CURIOSIDADES.some((c) => c.id === x.objetoId && !c.historia))) return null
  if (areaConSuerte(p, ahora) !== area) return null
  if (p.ofrendas.filter((o) => o.area === area && dia(o.fecha) === hoy).length > 1) return null
  if (azar() >= PROBABILIDAD_SORPRESA) return null
  const libres = libresDe(p, vecino)
  return libres.length ? libres[Math.floor(azar() * libres.length)] : null
}

export const anadirCuriosidad = (p: Partida, id: string, fecha: string): Partida =>
  tiene(p, id) ? p : { ...p, hallazgos: [...p.hallazgos, { objetoId: id, fecha }] }

/** Las historias que acaban de terminar dejan su curiosidad. */
export function curiosidadesDeHistorias(antes: Partida, despues: Partida, ahora: Date): Partida {
  let p = despues
  for (const c of CURIOSIDADES) {
    if (!c.historia) continue
    if (despues.situaciones?.[c.historia]?.fin && !antes.situaciones?.[c.historia]?.fin) p = anadirCuriosidad(p, c.id, ahora.toISOString())
  }
  return p
}

/** La primera travesura de Nox: la piña espera en su casa hasta que decides qué hacer con ella. */
export const travesuraPendiente = (p: Partida, c: string) => c === 'nox' && !p.vistos?.pina

/** Guardarla en el Álbum o dejarla junto a Nox: en los dos casos pasa a tus Curiosidades. */
export function resolverTravesura(p: Partida, opcion: 'guardada' | 'aqui', ahora: Date): Partida {
  const q = anadirCuriosidad(p, 'pina', ahora.toISOString())
  return { ...q, vistos: { ...q.vistos, pina: opcion } }
}
