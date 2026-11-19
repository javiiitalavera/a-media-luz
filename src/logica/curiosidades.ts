// Curiosidades: lo que se tiene (guardado en `hallazgos`), las sorpresas al tachar hazañas y las que
// deja cada historia al terminar.
import { AREAS, type AreaId } from '../contenido'
import { CURIOSIDADES, type Curiosidad } from '../contenido/curiosidades'
import type { Azar } from './azar'
import type { Partida } from './partida'
import { dia } from './fechas'
import { nacido } from './etapas'

/** Probabilidad de sorpresa al tachar una hazaña que cuenta (una al día como mucho). */
export const PROBABILIDAD_SORPRESA = 0.2

const tiene = (p: Partida, id: string) => p.hallazgos.some((x) => x.objetoId === id)

/** Las curiosidades conseguidas, de la más reciente a la más antigua (los hallazgos antiguos se ignoran). */
export function curiosidadesTenidas(p: Partida): { c: Curiosidad; fecha: string }[] {
  return p.hallazgos.flatMap((x) => {
    const c = CURIOSIDADES.find((k) => k.id === x.objetoId)
    return c ? [{ c, fecha: x.fecha }] : []
  }).reverse()
}

/** ¿Encuentra algo el vecino del área? Solo si ya vive en el barrio, si hoy no ha salido otra y con suerte. */
export function sorpresa(p: Partida, area: AreaId, ahora: Date, azar: Azar): Curiosidad | null {
  const vecino = AREAS[area].companero
  if (!nacido(p, vecino, ahora)) return null
  const hoy = dia(ahora)
  if (p.hallazgos.some((x) => dia(x.fecha) === hoy && CURIOSIDADES.some((c) => c.id === x.objetoId && !c.historia))) return null
  if (azar() >= PROBABILIDAD_SORPRESA) return null
  const libres = CURIOSIDADES.filter((c) => c.vecino === vecino && !c.historia && !tiene(p, c.id))
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
