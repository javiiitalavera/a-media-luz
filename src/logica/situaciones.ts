// Motor de situaciones (docs/diseno-vecindario.md). Todo es una función del estado guardado: qué fase
// toca, qué huellas se ven, dónde está Gregorio, quién está de visita y qué pequeña cosa pasa hoy.
import { FRASES_VISITA, HUELLAS, MICROS, SITUACIONES, type Huella, type Lugar, type Micro, type Situacion } from '../contenido/situaciones'
import { COMPANEROS, type CompaneroId } from '../contenido'
import type { EstadoSituacion, NoticiaBarrio, Partida } from './partida'
import { construido, proyectosHechos } from './casa'
import { nacido, nacidos, vecinoDe } from './etapas'
import { dia, diasEntre } from './fechas'

const estados = (p: Partida) => p.situaciones ?? {}

export function cumpleRequisitos(p: Partida, s: Situacion, ahora: Date): boolean {
  return s.requiere.vecinos.every((c) => nacido(p, c, ahora)) && s.requiere.construido.every((id) => construido(p, id))
}

/** Texto y frases de una fase, teniendo en cuenta la decisión tomada. */
export function faseDe(s: Situacion, i: number, decision?: string) {
  const f = s.fases[i]
  const v = decision ? f.segun?.[decision] : undefined
  return { ...f, noticia: v?.noticia ?? f.noticia, frases: v?.frases ?? f.frases }
}

/**
 * Avanza el vecindario: como mucho una fase al día, y primero se termina lo que está en marcha. Si una
 * fase espera una decisión tuya, no sigue hasta que decidas. Si no hay nada en marcha, empieza la
 * primera situación disponible. Devuelve la partida y las novedades nuevas.
 */
export function avanzar(p: Partida, ahora: Date): { partida: Partida; nuevas: NoticiaBarrio[] } {
  const hoy = dia(ahora.toISOString())
  const est = estados(p)
  if (Object.values(est).some((e) => e.dia === hoy)) return { partida: p, nuevas: [] }

  const enMarcha = SITUACIONES.find((s) => est[s.id] && !est[s.id].fin)
  let s: Situacion | undefined
  let nuevo: EstadoSituacion | undefined
  if (enMarcha) {
    const e = est[enMarcha.id]
    if (enMarcha.fases[e.fase].decision && !e.decision) return { partida: p, nuevas: [] }
    const fase = e.fase + 1
    s = enMarcha
    nuevo = { ...e, fase, dia: hoy, fin: fase === enMarcha.fases.length - 1 }
  } else {
    s = SITUACIONES.find((x) => !est[x.id] && cumpleRequisitos(p, x, ahora))
    if (s) nuevo = { fase: 0, dia: hoy, fin: s.fases.length === 1 }
  }
  if (!s || !nuevo) return { partida: p, nuevas: [] }
  const f = faseDe(s, nuevo.fase, nuevo.decision)
  const noticia: NoticiaBarrio = { texto: f.noticia, lugar: f.lugar, fecha: ahora.toISOString() }
  return {
    partida: { ...p, situaciones: { ...est, [s.id]: nuevo }, noticias: [...(p.noticias ?? []), noticia].slice(-5) },
    nuevas: [noticia],
  }
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
    const frases = faseDe(s, e!.fase, e!.decision).frases?.[c]
    if (frases?.length) return frases
  }
  return null
}

/** Huellas que se ven en un lugar. */
export function huellasEn(p: Partida, lugar: Lugar): Huella[] {
  return HUELLAS.filter((h) => {
    const e = estados(p)[h.situacion]
    return h.lugar === lugar && e && e.fase >= h.desde && (h.hasta === undefined || e.fase <= h.hasta)
      && (!h.decision || e.decision === h.decision)
  })
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

/** Un número estable para un día y una casa (para que lo que pasa hoy no cambie al recargar). */
function semilla(texto: string): number {
  let h = 2166136261
  for (const ch of texto) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return Math.abs(h)
}

/** Quién está de visita hoy en una casa: tras inaugurarse el puente, a veces se pasa el otro vecino. */
export function visitante(p: Partida, casa: CompaneroId, ahora: Date): CompaneroId | null {
  if (!estados(p).puente?.fin) return null
  const otros = nacidos(p, ahora).filter((c) => c !== casa && FRASES_VISITA[c])
  if (!otros.length || semilla(`${dia(ahora.toISOString())}|visita|${casa}`) % 3 !== 0) return null
  return otros[semilla(`${dia(ahora.toISOString())}|quien|${casa}`) % otros.length]
}

/** La pequeña cosa que pasa hoy en una casa (la mitad de los días), entre las que ya se pueden dar. */
export function microDeHoy(p: Partida, casa: CompaneroId, ahora: Date): Micro | null {
  const hoy = dia(ahora.toISOString())
  if (semilla(`${hoy}|micro|${casa}`) % 2) return null
  // El día que llega, bastante tiene con salir del huevo.
  const v = vecinoDe(p, casa)
  if (v && [v.inicio, v.presentado].some((f) => f && dia(f) === hoy)) return null
  const posibles = MICROS.filter((m) => m.casa === casa && m.requiere.every((r) =>
    r in COMPANEROS ? nacido(p, r as CompaneroId, ahora) : construido(p, r)))
  return posibles.length ? posibles[semilla(`${hoy}|cual|${casa}`) % posibles.length] : null
}

/** Situaciones terminadas, para las Crónicas del Álbum (con sus noticias en orden). */
export function cronicas(p: Partida) {
  return SITUACIONES.filter((s) => estados(p)[s.id]?.fin).map((s) => {
    const e = estados(p)[s.id]
    return { id: s.id, titulo: s.titulo, fases: s.fases.map((_, i) => faseDe(s, i, e.decision).noticia).filter(Boolean) }
  })
}

/** ¿Se pueden construir ya los proyectos del barrio? (Nox y Tuerca nacidos, con un proyecto cada uno). */
export function barrioAbierto(p: Partida, ahora: Date): boolean {
  return (['nox', 'tuerca'] as CompaneroId[]).every((c) => nacido(p, c, ahora) && proyectosHechos(p, c) >= 1)
}
