// Motor de situaciones (docs/diseno-vecindario.md). Todo es una función del estado guardado: qué fase
// toca, qué huellas se ven, dónde está Gregorio, quién está de visita y qué pequeña cosa pasa hoy.
import { FRASES_VISITA, HUELLAS, MICROS, SITUACIONES, type Huella, type Lugar, type Micro, type Situacion } from '../contenido/situaciones'
import { COMPANEROS, type CompaneroId } from '../contenido'
import type { EstadoSituacion, NoticiaBarrio, Partida } from './partida'
import { construido, proyectosHechos } from './casa'
import { expuesto, guardado } from './colocar'
import { azarConSemilla } from './azar'
import { nacido, nacidos, progreso, vecinoDe } from './etapas'
import { dia, diasEntre } from './fechas'
import { PATRONES, rellenar, type DatosPatron } from './patrones'

/** Lo que se lee del diario al empezar una historia de patrón (se guarda: recargar no lo cambia). */
function datosDe(p: Partida, s: Situacion, ahora: Date): { datos?: DatosPatron } {
  const datos = s.patron ? PATRONES[s.patron]?.(p, ahora) : null
  return datos ? { datos } : {}
}

/** Lo que recuerdan los vecinos de las historias que ya terminaron (para su charla). */
export function ecosDe(p: Partida, c: CompaneroId): string[][] {
  return SITUACIONES.filter((s) => p.situaciones?.[s.id]?.fin && s.ecos?.[c]?.length).map((s) => s.ecos![c]!)
}

const estados = (p: Partida) => p.situaciones ?? {}

/** Cuántas novedades se guardan en el sobre (las leídas se quedan en gris). */
export const NOTICIAS_GUARDADAS = 10

/** Historias en marcha a la vez, como mucho (una puede estar esperando tu decisión). */
export const EN_MARCHA_MAX = 2

export function cumpleRequisitos(p: Partida, s: Situacion, ahora: Date): boolean {
  return s.requiere.vecinos.every((c) => nacido(p, c, ahora)) && s.requiere.construido.every((id) => construido(p, id))
    && (s.requiere.terminadas ?? []).every((id) => Boolean(estados(p)[id]?.fin))
    && (!s.patron || Boolean(PATRONES[s.patron]?.(p, ahora)))
}

/** Texto y frases de una fase, teniendo en cuenta la decisión tomada. */
export function faseDe(s: Situacion, i: number, decision?: string, datos?: DatosPatron) {
  const f = s.fases[i]
  const v = decision ? f.segun?.[decision] : undefined
  const frases = v?.frases ?? f.frases
  return {
    ...f,
    noticia: rellenar(v?.noticia ?? f.noticia, datos),
    frases: frases && Object.fromEntries(Object.entries(frases).map(([c, l]) => [c, l!.map((t) => rellenar(t, datos))])) as typeof frases,
  }
}

/**
 * Avanza el vecindario: como mucho una fase al día, y primero se termina lo que está en marcha. Si una
 * fase espera una decisión tuya, esa historia no sigue hasta que decidas, pero puede empezar otra
 * (como mucho dos en marcha). Devuelve la partida y las novedades nuevas.
 */
export function avanzar(p: Partida, ahora: Date): { partida: Partida; nuevas: NoticiaBarrio[] } {
  const hoy = dia(ahora.toISOString())
  const est = estados(p)
  if (Object.values(est).some((e) => e.dia === hoy)) return { partida: p, nuevas: [] }

  // Primero sigue lo que está en marcha y no espera una decisión tuya. Si todo lo que está en marcha
  // espera una decisión, puede empezar otra historia (como mucho dos a la vez): el barrio no se congela.
  const enMarcha = SITUACIONES.filter((x) => est[x.id] && !est[x.id].fin)
  const esperando = (x: Situacion) => Boolean(x.fases[est[x.id].fase].decision && !est[x.id].decision)
  // Dos preguntas a la vez en la misma casa se taparían: la segunda espera a que contestes la primera.
  const choca = (x: Situacion, fase: number) => {
    const f = x.fases[fase]
    return Boolean(f?.decision) && enMarcha.some((y) => y !== x && esperando(y) && y.fases[est[y.id].fase].lugar === f.lugar)
  }
  const sigue = enMarcha.find((x) => !esperando(x) && !choca(x, est[x.id].fase + 1))
  let s: Situacion | undefined
  let nuevo: EstadoSituacion | undefined
  // Lo que nace de tu diario va primero: si un patrón se cumple y hay hueco, empieza hoy (lo demás sigue mañana).
  // Con «Que no lean mi lista», tampoco empiezan historias que nacen de tu diario.
  const deTuDiario = enMarcha.length < EN_MARCHA_MAX && !p.privado
    ? SITUACIONES.find((x) => x.patron && !est[x.id] && !choca(x, 0) && cumpleRequisitos(p, x, ahora)) : undefined
  if (deTuDiario) {
    s = deTuDiario
    nuevo = { fase: 0, dia: hoy, fin: deTuDiario.fases.length === 1, ...datosDe(p, deTuDiario, ahora) }
  } else if (sigue) {
    const e = est[sigue.id]
    const fase = e.fase + 1
    s = sigue
    nuevo = { ...e, fase, dia: hoy, fin: fase === sigue.fases.length - 1 }
  } else if (enMarcha.length < EN_MARCHA_MAX) {
    s = SITUACIONES.find((x) => !est[x.id] && !choca(x, 0) && cumpleRequisitos(p, x, ahora))
    if (s) nuevo = { fase: 0, dia: hoy, fin: s.fases.length === 1, ...datosDe(p, s, ahora) }
  }
  if (!s || !nuevo) return { partida: p, nuevas: [] }
  const f = faseDe(s, nuevo.fase, nuevo.decision, nuevo.datos)
  // Una fase sin noticia (el remate) no avisa en el sobre: se descubre paseando por el barrio o entrando en una casa.
  if (!f.noticia) return { partida: { ...p, situaciones: { ...est, [s.id]: nuevo } }, nuevas: [] }
  const noticia: NoticiaBarrio = { texto: f.noticia, lugar: f.lugar, fecha: ahora.toISOString() }
  return {
    partida: { ...p, situaciones: { ...est, [s.id]: nuevo }, noticias: [...(p.noticias ?? []), noticia].slice(-NOTICIAS_GUARDADAS) },
    nuevas: [noticia],
  }
}

/** ¿Ha empezado hoy una historia que nace de tu diario? (ese día no hay además lectura suelta). */
export function empiezaHoyDeTuDiario(antes: Partida, despues: Partida, ahora: Date): boolean {
  const hoy = dia(ahora.toISOString())
  return SITUACIONES.some((s) => s.patron && !antes.situaciones?.[s.id] && despues.situaciones?.[s.id]?.dia === hoy)
}

/** La decisión que espera respuesta en un lugar, si la hay. */
export function decisionPendiente(p: Partida, lugar: Lugar) {
  for (const s of SITUACIONES) {
    const e = estados(p)[s.id]
    const d = e && !e.fin ? s.fases[e.fase].decision : undefined
    if (d && !e.decision && s.fases[e.fase].lugar === lugar) return { situacion: s.id, ...d }
  }
  return null
}

/** Decide (la historia sigue al día siguiente). */
export function decidir(p: Partida, situacion: string, opcion: string): Partida | null {
  const s = SITUACIONES.find((x) => x.id === situacion)
  const e = estados(p)[situacion]
  const d = s && e ? s.fases[e.fase].decision : undefined
  if (!d || e.decision || !d.opciones.some((o) => o.id === opcion)) return null
  return { ...p, situaciones: { ...estados(p), [situacion]: { ...e, decision: opcion } } }
}

/**
 * Lo que dice un vecino de la situación más reciente en la que participa: mientras está en marcha y hasta
 * dos días después de terminar. Null si no tiene nada que contar.
 */
export function fraseDeSituacion(p: Partida, c: CompaneroId, ahora: Date): string[] | null {
  const hoy = dia(ahora.toISOString())
  const recientes = SITUACIONES.map((s) => ({ s, e: estados(p)[s.id] }))
    .filter((x) => x.e && (!x.e.fin || diasEntre(x.e.dia, hoy) <= 2))
    .sort((a, b) => b.e!.dia.localeCompare(a.e!.dia))
  for (const { s, e } of recientes) {
    const frases = faseDe(s, e!.fase, e!.decision, e!.datos).frases?.[c]
    if (frases?.length) return frases
  }
  return null
}

/** Huellas que se ven en un lugar. */
const activa = (p: Partida, h: Huella) => {
  const e = estados(p)[h.situacion]
  return Boolean(e && e.fase >= h.desde && (h.hasta === undefined || e.fase <= h.hasta) && (!h.decision || e.decision === h.decision))
}
/** El objeto de la casa ya está fuera: la huella no se duplica y su historia pasa al objeto. */
const objetoFuera = (p: Partida, h: Huella) => Boolean(h.sinObjeto && construido(p, h.sinObjeto) && !guardado(p, h.sinObjeto))

export function huellasEn(p: Partida, lugar: Lugar): Huella[] {
  return HUELLAS.filter((h) => h.lugar === lugar && activa(p, h) && !objetoFuera(p, h))
}

/** Lo que cuenta un objeto de la casa que se ha quedado con la historia de una huella (si lo hay). */
export function toqueHeredado(p: Partida, objetoId: string): string | undefined {
  return HUELLAS.find((h) => h.sinObjeto === objetoId && h.toque && activa(p, h) && objetoFuera(p, h))?.toque
}

/** Dónde está Gregorio, la aspiradora (null si no existe o ha desaparecido). */
export function dondeGregorio(p: Partida, ahora: Date): CompaneroId | null {
  if (!construido(p, 'aspiradora')) return null
  // La planta de Tofu se lo traga un par de días (y lo devuelve).
  const planta = estados(p).planta
  if (planta && (planta.fase === 1 || planta.fase === 2)) return null
  const e = estados(p).gregorio
  if (!e) return 'tuerca'
  if (e.fase === 0) return null
  if (e.fase < 3) return 'nox'
  if (e.decision === 'nox') return 'nox'
  return diasEntre('2026-01-01', dia(ahora.toISOString())) % 2 ? 'nox' : 'tuerca'
}


/**
 * El día del barrio: qué escena pasa hoy en cada casa y quién está de visita dónde. Un vecino solo está en
 * un sitio: primero las escenas que traen a alguien de visita y luego, tras el puente, las visitas sueltas
 * (con quien quede libre). Es un sorteo estable por día: igual al recargar y en cualquier orden de visita.
 */
export function diaDelBarrio(p: Partida, ahora: Date): { micros: Partial<Record<CompaneroId, Micro>>; visitas: Partial<Record<CompaneroId, CompaneroId>> } {
  const hoy = dia(ahora.toISOString())
  const casas = nacidos(p, ahora)
  const ocupados = new Set<CompaneroId>()
  const micros: Partial<Record<CompaneroId, Micro>> = {}
  const visitas: Partial<Record<CompaneroId, CompaneroId>> = {}
  for (const casa of casas) {
    // Dos extracciones del mismo sorteo del día: si hay escena y cuál.
    const r = azarConSemilla(`${hoy}|micro|${casa}`)
    if (r() >= 0.5) continue
    // El día que llega, bastante tiene con salir del huevo.
    const v = vecinoDe(p, casa)
    if (v && [v.inicio, v.presentado].some((f) => f && dia(f) === hoy)) continue
    // Lo que pasa sobre un mueble necesita el mueble a la vista (no en el baúl); quien viene de visita, estar libre.
    const etapa = progreso(p, casa, ahora).etapa
    const posibles = MICROS.filter((m) => m.casa === casa && etapa >= (m.etapaMinima ?? 0) && (!m.visita || !ocupados.has(m.visita)) && m.requiere.every((q) =>
      q in COMPANEROS ? nacido(p, q as CompaneroId, ahora) : expuesto(p, q)))
    const m = posibles.length ? posibles[Math.floor(r() * posibles.length)] : undefined
    if (!m) continue
    micros[casa] = m
    if (m.visita) { visitas[casa] = m.visita; ocupados.add(m.visita) }
  }
  if (estados(p).puente?.fin) for (const casa of casas) {
    if (visitas[casa]) continue
    const otros = casas.filter((c) => c !== casa && FRASES_VISITA[c] && !ocupados.has(c))
    const r = azarConSemilla(`${hoy}|visita|${casa}`)
    if (!otros.length || r() >= 1 / 3) continue
    const quien = otros[Math.floor(r() * otros.length)]
    visitas[casa] = quien
    ocupados.add(quien)
  }
  return { micros, visitas }
}

/** Quién está de visita hoy en una casa (por una escena o, tras el puente, de paso). */
export const visitante = (p: Partida, casa: CompaneroId, ahora: Date): CompaneroId | null => diaDelBarrio(p, ahora).visitas[casa] ?? null

/** La pequeña cosa que pasa hoy en una casa (la mitad de los días), entre las que ya se pueden dar. */
export const microDeHoy = (p: Partida, casa: CompaneroId, ahora: Date): Micro | null => diaDelBarrio(p, ahora).micros[casa] ?? null

/** Situaciones empezadas, para las Crónicas del Álbum: primero las que están en marcha (con sus noticias en orden). */
export function cronicas(p: Partida) {
  const lista = SITUACIONES.filter((s) => estados(p)[s.id]).map((s) => {
    const e = estados(p)[s.id]
    // Las que están en marcha, hasta donde han llegado.
    const fases = s.fases.slice(0, e.fin ? s.fases.length : e.fase + 1).map((f, i) => faseDe(s, i, e.decision, e.datos).noticia || f.recuerdo || '').filter(Boolean)
    return { id: s.id, titulo: s.titulo, fases, enMarcha: !e.fin }
  })
  return [...lista.filter((c) => c.enMarcha), ...lista.filter((c) => !c.enMarcha)]
}

/** ¿Se pueden construir ya los proyectos del barrio? (Nox y Tuerca nacidos, con un proyecto cada uno). */
export function barrioAbierto(p: Partida, ahora: Date): boolean {
  return (['nox', 'tuerca'] as CompaneroId[]).every((c) => nacido(p, c, ahora) && proyectosHechos(p, c) >= 1)
}
