// Avisos (decidido por Javi, 18/11/2026): en vez de que las cosas salgan solas, aparece un iconito
// donde ha pasado algo y tú decides cuándo mirarlo. Todo se guarda en la partida.
import { COMPANEROS, type CompaneroId } from '../contenido'
import { GAGS, type Gag } from '../contenido/gags'
import { proyectosVisibles, puedeConstruir } from './casa'
import type { Lugar } from '../contenido/situaciones'
import type { NoticiaBarrio, Partida, SeccionAlbum } from './partida'
import { dia, diasEntre, sumarDias } from './fechas'
import { misHazanas } from './hazanas'
import { nivelSinVer, nacido, nacidos, proximaLlegada, progreso } from './etapas'
import { estadoDelMes, mesActual, mesesDe } from './meses'
import { curiosidadesTenidas } from './curiosidades'
import type { MomentoAlbum } from './momentos'
import { decisionPendiente, dondeGregorio, huellasEn, microDeHoy } from './situaciones'
import { expuesto } from './colocar'
import { azarConSemilla } from './azar'

const vistos = (p: Partida) => p.vistos ?? {}

/** Día nuevo: la pestaña Hazañas avisa hasta que la abres ese día. */
export const hayHazanasNuevas = (p: Partida, ahora: Date) => misHazanas(p).length > 0 && vistos(p).hazanas !== dia(ahora)
export const verHazanas = (p: Partida, ahora: Date): Partida =>
  vistos(p).hazanas === dia(ahora) ? p : { ...p, vistos: { ...vistos(p), hazanas: dia(ahora) } }

/** Hoy y los dos días anteriores del juego. El historial de las historias se consulta en Crónicas. */
function noticiasRecientes(p: Partida, ahora: Date): NoticiaBarrio[] {
  const desde = sumarDias(dia(ahora), -2)
  return (p.noticias ?? []).filter((n) => dia(n.fecha) >= desde && new Date(n.fecha) <= ahora)
}

/** Las fases viven en Crónicas. Los mensajes antiguos del diario llevan la firma del vecino. */
export function noticiasDelSobre(p: Partida, ahora: Date) {
  return noticiasRecientes(p, ahora).filter((n) => n.origen ? n.origen === 'diario'
    : n.lugar !== 'barrio' && n.texto.startsWith(`${COMPANEROS[n.lugar].nombre}: «`))
}

export const noticiasSinLeer = (p: Partida, ahora: Date) => noticiasDelSobre(p, ahora).filter((n) => !n.leida).length
/** El número del sobre: cada acontecimiento cuenta una vez (una decisión, con su noticia, cuenta uno). */
export const pendientesDelSobre = (p: Partida, ahora: Date) => noticiasSinLeer(p, ahora) + decisionesPendientes(p, ahora).length
/** Abrir el sobre da por leída la actualidad, también la que aparece junto a una pregunta pendiente. */
export function leerNoticias(p: Partida, ahora: Date): Partida {
  const nuevas = new Set(noticiasDelSobre(p, ahora).filter((n) => !n.leida))
  return nuevas.size ? { ...p, noticias: p.noticias?.map((n) => nuevas.has(n) ? { ...n, leida: true } : n) } : p
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
  return nivelSinVer(p, c, progreso(p, c, ahora).nivel) || proyectosVisibles(p, c).some((o) => puedeConstruir(p, o, ahora))
}

/** «!» sobre una casita: ha pasado algo allí, te espera una decisión, ha crecido o puede construir algo. */
export const avisoEnCasa = (p: Partida, c: CompaneroId, ahora: Date) =>
  (c === mesActual(p).companero && (estadoDelMes(p, ahora) === 'naciendo' || proximaLlegada(p, ahora)?.faltanDias === 0)) ||
  Boolean(decisionPendiente(p, c)) || hayAlgoQueHacer(p, c, ahora)

/** Punto en la pestaña Inicio (cuando estás en otra): el huevo está listo, alguien ha crecido, hay una decisión o novedades. */
export const hayAlgoEnInicio = (p: Partida, ahora: Date) =>
  estadoDelMes(p, ahora) === 'naciendo' || proximaLlegada(p, ahora)?.faltanDias === 0 || pendientesDelSobre(p, ahora) > 0 ||
  nacidos(p, ahora).some((c) => nivelSinVer(p, c, progreso(p, c, ahora).nivel))

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

/** Lo que ya se había visto por sección en partidas anteriores. */
const SECCIONES: SeccionAlbum[] = ['momentos', 'cronicas', 'curiosidades']
const vistoEn = (p: Partida, s: SeccionAlbum) => vistos(p).albumSec?.[s] ?? vistos(p).album ?? ''
export function seccionesNuevas(p: Partida): SeccionAlbum[] {
  return SECCIONES.filter((s) => {
    if (s === 'momentos') return (p.momentos ?? []).some((m) => momentoNuevo(p, m))
    if (s === 'curiosidades') return curiosidadesTenidas(p).some(({ c, fecha }) => curiosidadNueva(p, c.id, fecha))
    return Object.keys(p.situaciones ?? {}).some((id) => cronicaNueva(p, id))
  })
}

const firmaMomento = (m: MomentoAlbum) => JSON.stringify([m.titulo, m.texto, m.escena])
export const momentoNuevo = (p: Partida, m: MomentoAlbum) => p.vistos?.momentos
  ? p.vistos.momentos[m.id] !== firmaMomento(m) : m.fecha > vistoEn(p, 'momentos')
export const curiosidadNueva = (p: Partida, id: string, fecha: string) => p.vistos?.curiosidades
  ? p.vistos.curiosidades[id] !== fecha : fecha > vistoEn(p, 'curiosidades')

export function verMomento(p: Partida, m: MomentoAlbum): Partida {
  if (!momentoNuevo(p, m)) return p
  const previos = p.vistos?.momentos ?? Object.fromEntries((p.momentos ?? [])
    .filter((x) => !momentoNuevo(p, x)).map((x) => [x.id, firmaMomento(x)]))
  return { ...p, vistos: { ...p.vistos, momentos: { ...previos, [m.id]: firmaMomento(m) } } }
}

export function verCuriosidad(p: Partida, id: string, fecha: string): Partida {
  if (!curiosidadNueva(p, id, fecha)) return p
  const previas = p.vistos?.curiosidades ?? Object.fromEntries(curiosidadesTenidas(p)
    .filter((x) => !curiosidadNueva(p, x.c.id, x.fecha)).map((x) => [x.c.id, x.fecha]))
  return { ...p, vistos: { ...p.vistos, curiosidades: { ...previas, [id]: fecha } } }
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

/** Decisiones que te esperan (para el sobre): en qué casa, qué se pregunta y la noticia que la planteó. */
export function decisionesPendientes(p: Partida, ahora: Date): { lugar: CompaneroId; situacion: string; pregunta: string; contexto: string; dia: string }[] {
  return nacidos(p, ahora).flatMap((c) => {
    const d = decisionPendiente(p, c)
    return d ? [{ lugar: c, situacion: d.situacion, pregunta: d.pregunta, contexto: d.contexto, dia: d.dia }] : []
  })
}

/** Avisos fuera de esta casa (para el botón «Barrio»): «?» si otro vecino espera una decisión; si no, punto. */
export function avisoFuera(p: Partida, casa: CompaneroId, ahora: Date): 'pregunta' | 'punto' | null {
  if (decisionesPendientes(p, ahora).some((d) => d.lugar !== casa)) return 'pregunta'
  const otras = mesesDe(p).map((m) => m.companero).filter((c) => c !== casa)
  if (otras.some((c) => avisoEnCasa(p, c, ahora))) return 'punto'
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

