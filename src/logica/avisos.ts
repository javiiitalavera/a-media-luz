// Avisos (decidido por Javi, 18/11/2026): en vez de que las cosas salgan solas, aparece un iconito
// donde ha pasado algo y tú decides cuándo mirarlo. Todo se guarda en la partida.
import type { CompaneroId } from '../contenido'
import type { Lugar } from '../contenido/situaciones'
import type { Partida } from './partida'
import { dia, diasEntre } from './fechas'
import { misHazanas } from './hazanas'
import { decisionPendiente, huellasEn, microDeHoy } from './situaciones'

const vistos = (p: Partida) => p.vistos ?? {}

/** Día nuevo: la pestaña Hazañas avisa hasta que la abres ese día. */
export const hayHazanasNuevas = (p: Partida, ahora: Date) => misHazanas(p).length > 0 && vistos(p).hazanas !== dia(ahora)
export const verHazanas = (p: Partida, ahora: Date): Partida =>
  vistos(p).hazanas === dia(ahora) ? p : { ...p, vistos: { ...vistos(p), hazanas: dia(ahora) } }

/** Novedades sin leer (el número del sobre). */
export const noticiasSinLeer = (p: Partida) => (p.noticias ?? []).filter((n) => !n.leida).length
/** Abrir el sobre: se marcan como leídas; el «!» de su casa sigue hasta que entras. */
export function leerNoticias(p: Partida): Partida {
  if (!noticiasSinLeer(p)) return p
  return { ...p, noticias: (p.noticias ?? []).map((n) => ({ ...n, leida: true })) }
}
/** Entrar en un sitio apaga sus avisos (las novedades se quedan en el sobre, ya leídas). */
export function visitarLugar(p: Partida, lugar: Lugar): Partida {
  const n = p.noticias ?? []
  return n.some((x) => x.lugar === lugar && !x.visitada)
    ? { ...p, noticias: n.map((x) => (x.lugar === lugar ? { ...x, leida: true, visitada: true } : x)) } : p
}

/** «!» sobre una casita: ha pasado algo allí o te espera una decisión. */
export const avisoEnCasa = (p: Partida, c: CompaneroId) =>
  (p.noticias ?? []).some((n) => n.lugar === c && !n.visitada) || Boolean(decisionPendiente(p, c))

/** La pequeña cosa de hoy en una casa, si aún no la has mirado. */
export function microSinVer(p: Partida, c: CompaneroId, ahora: Date) {
  const m = microDeHoy(p, c, ahora)
  return m && vistos(p).micros?.[c] !== dia(ahora) ? m : null
}
export const verMicro = (p: Partida, c: CompaneroId, ahora: Date): Partida =>
  ({ ...p, vistos: { ...vistos(p), micros: { ...vistos(p).micros, [c]: dia(ahora) } } })

/** Huella que brilla: apareció hace poco (3 días) y aún no la has tocado. */
export function huellaNueva(p: Partida, id: string, ahora: Date): boolean {
  if (vistos(p).huellas?.includes(id)) return false
  const h = (['nox', 'tuerca', 'tofu', 'bruma', 'madeja', 'barrio'] as Lugar[]).flatMap((l) => huellasEn(p, l)).find((x) => x.id === id)
  const e = h && p.situaciones?.[h.situacion]
  return Boolean(e && diasEntre(e.dia, dia(ahora)) <= 3)
}
export const verHuella = (p: Partida, id: string): Partida =>
  vistos(p).huellas?.includes(id) ? p : { ...p, vistos: { ...vistos(p), huellas: [...(vistos(p).huellas ?? []), id] } }
