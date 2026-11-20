// Avisos (decidido por Javi, 18/11/2026): en vez de que las cosas salgan solas, aparece un iconito
// donde ha pasado algo y tú decides cuándo mirarlo. Todo se guarda en la partida.
import { COMPANEROS, type CompaneroId } from '../contenido'
import { GAGS, type Gag } from '../contenido/gags'
import { construido, proyectosDe, proyectosVisibles, puedeConstruir } from './casa'
import type { Lugar } from '../contenido/situaciones'
import type { Partida, SeccionAlbum } from './partida'
import { dia, diasEntre } from './fechas'
import { misHazanas } from './hazanas'
import { crecioSinVer, nacido, nacidos, proximaLlegada, progreso } from './etapas'
import { estadoDelMes, mesActual, mesesDe } from './meses'
import { SITUACIONES } from '../contenido/situaciones'
import { curiosidadesTenidas } from './curiosidades'
import { decisionPendiente, dondeGregorio, faseDe, huellasEn, microDeHoy } from './situaciones'
import { expuesto } from './colocar'
import { azarConSemilla } from './azar'

const vistos = (p: Partida) => p.vistos ?? {}

/** Día nuevo: la pestaña Hazañas avisa hasta que la abres ese día. */
export const hayHazanasNuevas = (p: Partida, ahora: Date) => misHazanas(p).length > 0 && vistos(p).hazanas !== dia(ahora)
export const verHazanas = (p: Partida, ahora: Date): Partida =>
  vistos(p).hazanas === dia(ahora) ? p : { ...p, vistos: { ...vistos(p), hazanas: dia(ahora) } }

/** Novedades sin leer (sin contar las que plantean una decisión pendiente: esas van en su tarjeta). */
export const noticiasSinLeer = (p: Partida, ahora?: Date) => {
  const deDecision = ahora ? new Set(decisionesPendientes(p, ahora).map((d) => d.contexto)) : new Set<string>()
  return (p.noticias ?? []).filter((n) => !n.leida && !deDecision.has(n.texto)).length
}
/** Noticias que se listan en el sobre (la que plantea una decisión pendiente sale en la tarjeta de la decisión). */
export function noticiasDelSobre(p: Partida, ahora: Date) {
  const deDecision = new Set(decisionesPendientes(p, ahora).map((d) => d.contexto))
  return (p.noticias ?? []).filter((n) => !deDecision.has(n.texto))
}
/** El número del sobre: cada acontecimiento cuenta una vez (una decisión, con su noticia, cuenta uno). */
export const pendientesDelSobre = (p: Partida, ahora: Date) => noticiasSinLeer(p, ahora) + decisionesPendientes(p, ahora).length
/** Abrir el sobre: se marcan como leídas; el «!» de su casa sigue hasta que entras. */
export function leerNoticias(p: Partida): Partida {
  if (!noticiasSinLeer(p)) return p
  return { ...p, noticias: (p.noticias ?? []).map((n) => ({ ...n, leida: true })) }
}
/** Entrar en un sitio apaga su «!»; las novedades siguen sin leer en el sobre hasta que lo abres
 *  (al abrir la app se entra solo en una casa, y no por eso has leído lo que pasó). */
export function visitarLugar(p: Partida, lugar: Lugar): Partida {
  const n = p.noticias ?? []
  return n.some((x) => x.lugar === lugar && !x.visitada)
    ? { ...p, noticias: n.map((x) => (x.lugar === lugar ? { ...x, visitada: true } : x)) } : p
}

/** El vecino ha crecido y aún no lo has visto, o tiene un proyecto listo para construir. */
export function hayAlgoQueHacer(p: Partida, c: CompaneroId, ahora: Date): boolean {
  if (!nacido(p, c, ahora)) return false
  return crecioSinVer(p, c, progreso(p, c, ahora).etapa) || proyectosVisibles(p, c).some((o) => puedeConstruir(p, o, ahora))
}

/** «!» sobre una casita: ha pasado algo allí, te espera una decisión, ha crecido o puede construir algo. */
export const avisoEnCasa = (p: Partida, c: CompaneroId, ahora: Date) =>
  (c === mesActual(p).companero && (estadoDelMes(p, ahora) === 'naciendo' || proximaLlegada(p, ahora)?.faltanDias === 0)) ||
  (p.noticias ?? []).some((n) => n.lugar === c && !n.visitada) || Boolean(decisionPendiente(p, c)) || hayAlgoQueHacer(p, c, ahora)

/** Punto en la pestaña Inicio (cuando estás en otra): el huevo está listo, alguien ha crecido, hay una decisión o novedades. */
export const hayAlgoEnInicio = (p: Partida, ahora: Date) =>
  estadoDelMes(p, ahora) === 'naciendo' || proximaLlegada(p, ahora)?.faltanDias === 0 || pendientesDelSobre(p, ahora) > 0 ||
  nacidos(p, ahora).some((c) => crecioSinVer(p, c, progreso(p, c, ahora).etapa))

/** Lo que enseña la ficha y puede cambiar: el siguiente proyecto y las historias en las que sale. */
export function firmaFicha(p: Partida, c: CompaneroId): string {
  const siguiente = proyectosDe(c).find((o) => !construido(p, o.id))?.id ?? ''
  const historias = SITUACIONES.filter((s) => s.requiere.vecinos.includes(c) && p.situaciones?.[s.id]).map((s) => s.id)
  return [siguiente, ...historias].join('|')
}
/** Punto en la «i»: la ficha ha cambiado desde la última vez que la abriste. */
export const fichaNueva = (p: Partida, c: CompaneroId) => vistos(p).fichas?.[c] !== firmaFicha(p, c)
export const verFicha = (p: Partida, c: CompaneroId): Partida =>
  fichaNueva(p, c) ? { ...p, vistos: { ...vistos(p), fichas: { ...vistos(p).fichas, [c]: firmaFicha(p, c) } } } : p

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
    return Object.keys(p.situaciones ?? {}).some((id) => cronicaNueva(p, id))
  })
}

/** Lo que tiene una crónica hasta ahora (fase y decisión): si cambia, hay novedad. */
const firmaCronica = (e: { fase: number; decision?: string }) => `${e.fase}|${e.decision ?? ''}`
/** Una crónica tiene novedades: ha empezado o avanzado desde la última vez que la abriste. */
export function cronicaNueva(p: Partida, id: string): boolean {
  const e = p.situaciones?.[id]
  if (!e) return false
  const vistas = vistos(p).cronicas
  if (vistas) return vistas[id] !== firmaCronica(e) // una que no has abierto nunca también es nueva
  // Partidas de antes de este aviso: lo que avanzó después de la última vez que se miraron las Crónicas.
  const visto = vistoEn(p, 'cronicas')
  return !visto || e.dia > dia(visto)
}
/** Abrir una crónica apaga su punto. */
export const verCronica = (p: Partida, id: string): Partida => {
  const e = p.situaciones?.[id]
  if (!e || !cronicaNueva(p, id)) return p
  // La primera vez se pasa al registro de una en una: lo que ya estaba leído se apunta como leído.
  const previas = vistos(p).cronicas ?? Object.fromEntries(Object.entries(p.situaciones ?? {})
    .filter(([k]) => !cronicaNueva(p, k)).map(([k, x]) => [k, firmaCronica(x)]))
  return { ...p, vistos: { ...vistos(p), cronicas: { ...previas, [id]: firmaCronica(e) } } }
}
export const hayAlbumNuevo = (p: Partida) => seccionesNuevas(p).length > 0
/** Mirar una parte del Álbum apaga su aviso. */
export const verSeccion = (p: Partida, s: SeccionAlbum, ahora: Date): Partida => {
  if (!seccionesNuevas(p).includes(s)) return p
  // Las crónicas se apagan de una en una (al abrirlas); aquí, todas a la vez.
  if (s === 'cronicas') return Object.keys(p.situaciones ?? {}).reduce(verCronica, p)
  return { ...p, vistos: { ...vistos(p), albumSec: { ...vistos(p).albumSec, [s]: ahora.toISOString() } } }
}
/** Mirarlo todo. */
export const verAlbum = (p: Partida, ahora: Date): Partida => SECCIONES.reduce((q, s) => verSeccion(q, s, ahora), p)

/** Decisiones que te esperan (para el sobre): en qué casa, qué se pregunta y la noticia que la planteó. */
export function decisionesPendientes(p: Partida, ahora: Date): { lugar: CompaneroId; pregunta: string; contexto: string }[] {
  return nacidos(p, ahora).flatMap((c) => {
    const d = decisionPendiente(p, c)
    const s = d && SITUACIONES.find((x) => x.id === d.situacion)
    const e = d && p.situaciones?.[d.situacion]
    return d && s && e ? [{ lugar: c, pregunta: d.pregunta, contexto: faseDe(s, e.fase, e.decision, e.datos).noticia }] : []
  })
}

/** Avisos fuera de esta casa (para el botón «Barrio»): «?» si otro vecino espera una decisión; si no, punto. */
export function avisoFuera(p: Partida, casa: CompaneroId, ahora: Date): 'pregunta' | 'punto' | null {
  if (decisionesPendientes(p, ahora).some((d) => d.lugar !== casa)) return 'pregunta'
  const otras = mesesDe(p).map((m) => m.companero).filter((c) => c !== casa)
  if (otras.some((c) => avisoEnCasa(p, c, ahora)) || (p.noticias ?? []).some((n) => n.lugar === 'barrio' && !n.visitada)) return 'punto'
  return null
}

/** La escena que se puede tocar hoy en un sitio (uno de cada tres días, si hay alguna posible y no la has visto). */
export function gagDeHoy(p: Partida, lugar: CompaneroId | 'barrio', ahora: Date): Gag | null {
  const hoy = dia(ahora)
  if (vistos(p).gags?.[lugar] === hoy) return null
  const r = azarConSemilla(`${hoy}|gag|${lugar}`)
  if (r() >= 1 / 3) return null
  const posibles = GAGS.filter((g) => g.lugar === lugar && g.requiere.every((q) =>
    q === 'gregorio' ? dondeGregorio(p, ahora) === lugar : q in COMPANEROS ? nacido(p, q as CompaneroId, ahora) : expuesto(p, q)))
  return posibles.length ? posibles[Math.floor(r() * posibles.length)] : null
}
export const verGag = (p: Partida, lugar: CompaneroId | 'barrio', ahora: Date): Partida =>
  ({ ...p, vistos: { ...vistos(p), gags: { ...vistos(p).gags, [lugar]: dia(ahora) } } })

