// Avisos (decidido por Javi, 18/11/2026): en vez de que las cosas salgan solas, aparece un iconito
// donde ha pasado algo y tú decides cuándo mirarlo. Todo se guarda en la partida.
import { COMPANEROS, type CompaneroId } from '../contenido'
import { GAGS, type Gag } from '../contenido/gags'
import { construido } from './casa'
import type { Lugar } from '../contenido/situaciones'
import type { Partida, SeccionAlbum } from './partida'
import { dia, diasEntre } from './fechas'
import { misHazanas } from './hazanas'
import { nacido, nacidos } from './etapas'
import { curiosidadesTenidas } from './curiosidades'
import { decisionPendiente, dondeGregorio, huellasEn, microDeHoy } from './situaciones'

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

/** Álbum: cada parte (momentos, crónicas, curiosidades) avisa de lo nuevo desde la última vez que la miraste. */
const SECCIONES: SeccionAlbum[] = ['momentos', 'cronicas', 'curiosidades']
const vistoEn = (p: Partida, s: SeccionAlbum) => vistos(p).albumSec?.[s] ?? vistos(p).album ?? ''
export function seccionesNuevas(p: Partida): SeccionAlbum[] {
  return SECCIONES.filter((s) => {
    const visto = vistoEn(p, s)
    if (s === 'momentos') return (p.momentos ?? []).some((m) => m.fecha > visto)
    if (s === 'curiosidades') return curiosidadesTenidas(p).some((x) => x.fecha > visto)
    // Crónicas: una historia ha empezado o avanzado otro día después de mirarlas.
    return Object.values(p.situaciones ?? {}).some((e) => !visto || e.dia > dia(visto))
  })
}
export const hayAlbumNuevo = (p: Partida) => seccionesNuevas(p).length > 0
/** Mirar una parte del Álbum apaga su aviso. */
export const verSeccion = (p: Partida, s: SeccionAlbum, ahora: Date): Partida =>
  seccionesNuevas(p).includes(s) ? { ...p, vistos: { ...vistos(p), albumSec: { ...vistos(p).albumSec, [s]: ahora.toISOString() } } } : p
/** Mirarlo todo. */
export const verAlbum = (p: Partida, ahora: Date): Partida => SECCIONES.reduce((q, s) => verSeccion(q, s, ahora), p)

/** Decisiones que te esperan (para el sobre): en qué casa y qué se pregunta. */
export function decisionesPendientes(p: Partida, ahora: Date): { lugar: CompaneroId; pregunta: string }[] {
  return nacidos(p, ahora).flatMap((c) => {
    const d = decisionPendiente(p, c)
    return d ? [{ lugar: c, pregunta: d.pregunta }] : []
  })
}

/** La escena que se puede tocar hoy en un sitio (uno de cada tres días, si hay alguna posible y no la has visto). */
export function gagDeHoy(p: Partida, lugar: CompaneroId | 'barrio', ahora: Date): Gag | null {
  const hoy = dia(ahora)
  if (vistos(p).gags?.[lugar] === hoy) return null
  const n = semillaDe(`${hoy}|gag|${lugar}`)
  if (n % 3) return null
  const posibles = GAGS.filter((g) => g.lugar === lugar && g.requiere.every((r) =>
    r === 'gregorio' ? dondeGregorio(p, ahora) === lugar : r in COMPANEROS ? nacido(p, r as CompaneroId, ahora) : construido(p, r)))
  return posibles.length ? posibles[Math.floor(n / 3) % posibles.length] : null
}
export const verGag = (p: Partida, lugar: CompaneroId | 'barrio', ahora: Date): Partida =>
  ({ ...p, vistos: { ...vistos(p), gags: { ...vistos(p).gags, [lugar]: dia(ahora) } } })

function semillaDe(texto: string): number {
  let h = 2166136261
  for (const ch of texto) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return Math.abs(h)
}
