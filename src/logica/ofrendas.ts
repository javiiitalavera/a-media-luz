// Hacer una ofrenda: un toque → reacción del compañero que toca, crecimiento o arreglo,
// a veces una sorpresa, y la llegada de compañeros o premios semanales cuando corresponde.
import { ACCIONES, AREAS, COLECCION, COMPANEROS, FRASES, type AreaId, type CompaneroId, type ObjetoColeccion, type TipoFrase } from '../contenido'
import { elegir, type Azar } from './azar'
import { dia } from './fechas'
import { momentoDelDia } from './momento'
import type { Ofrenda, Partida } from './partida'
import { estadoBosque, estadoRincon, metas, objetosConseguidos, PROBABILIDAD_SORPRESA, TOPE_DIARIO } from './reglas'

export const RECIENTES = 8

export interface Frase {
  companero: CompaneroId
  tipo: TipoFrase
  texto: string
}

export type Evento = 'llegada' | 'arreglo' | 'visitanteFuera' | 'metaCumplida'

export interface ResultadoOfrenda {
  partida: Partida
  ofrenda: Ofrenda
  /** Si ha contado (las 3 primeras del día en el área). */
  cuenta: boolean
  frase: Frase | null
  sorpresa: ObjetoColeccion | null
  eventos: Evento[]
  premio: ObjetoColeccion | null
}

export const diaMaloActivo = (p: Partida, ahora: Date) => p.diaMalo === dia(ahora)

/** Elige una frase de un compañero sin repetir las recientes. */
export function elegirFrase(
  p: Partida, companero: CompaneroId, tipo: TipoFrase, azar: Azar, momento = momentoDelDia(new Date()),
): { frase: Frase | null; recientes: string[] } {
  const f = FRASES[companero]
  const lista = tipo === 'saludo' ? f.saludo[momento] : (f[tipo] as string[] | undefined) ?? []
  if (!lista.length) return { frase: null, recientes: p.frasesRecientes }
  const libres = lista.filter((t) => !p.frasesRecientes.includes(t))
  const texto = elegir(libres.length ? libres : lista, azar)!
  return {
    frase: { companero, tipo, texto },
    recientes: [...p.frasesRecientes.filter((t) => t !== texto), texto].slice(-RECIENTES),
  }
}

function reaccionPropia(p: Partida, companero: CompaneroId, lista: string[], azar: Azar): { frase: Frase; recientes: string[] } {
  const texto = elegir(lista, azar)!
  return { frase: { companero, tipo: 'ofrenda', texto }, recientes: [...p.frasesRecientes.filter((t) => t !== texto), texto].slice(-RECIENTES) }
}

export function hacerOfrenda(p: Partida, accionId: string, ahora: Date, azar: Azar, id: string): ResultadoOfrenda {
  const accion = p.acciones.find((a) => a.id === accionId)
  if (!accion) throw new Error(`Acción desconocida: ${accionId}`)
  const area = accion.area
  const ofrenda: Ofrenda = { id, accionId, area, fecha: ahora.toISOString(), diaMalo: diaMaloActivo(p, ahora) }

  const antes = estadoRincon(p, area, ahora)
  const metasAntes = metas(p, ahora).filter((m) => m.cumplida).length
  let nueva: Partida = { ...p, ofrendas: [...p.ofrendas, ofrenda] }
  const despues = estadoRincon(nueva, area, ahora)
  const cuenta = antes.hoy < TOPE_DIARIO

  const eventos: Evento[] = []
  if (!antes.llegado && despues.llegado) eventos.push('llegada')
  if (antes.visitante && !despues.visitante) eventos.push('visitanteFuera')
  else if (antes.fase > 0 && despues.fase === 0) eventos.push('arreglo')
  const metasDespues = metas(nueva, ahora).filter((m) => m.cumplida)
  const premio = metasDespues.length > metasAntes ? metasDespues.at(-1)?.premio ?? null : null
  if (metasDespues.length > metasAntes) eventos.push('metaCumplida')

  // Quién habla: el compañero del área si ya vive en el bosque; si no, el principal.
  const habla: CompaneroId = despues.llegado ? AREAS[area].companero : p.principal
  const tipo: TipoFrase = eventos.includes('llegada') ? 'llegada'
    : eventos.includes('visitanteFuera') ? 'visitanteFuera'
    : eventos.includes('arreglo') ? 'arreglo'
    : !cuenta ? 'tope'
    : ofrenda.diaMalo ? 'diaMalo'
    : habla === AREAS[area].companero ? 'ofrenda' : 'otraArea'
  // Si es una de tus hazañas y la reconoce su vecino, la comenta con su frase propia.
  // Cuando ya las ha dicho todas hace poco, vuelve a sus frases de siempre.
  const propias = tipo === 'ofrenda' && accion.habitual !== false
    ? (ACCIONES.find((c) => c.id === accion.id)?.reacciones ?? []).filter((t) => !nueva.frasesRecientes.includes(t)) : []
  const r = propias.length ? reaccionPropia(nueva, habla, propias, azar) : elegirFrase(nueva, habla, tipo, azar)
  nueva = { ...nueva, frasesRecientes: r.recientes }

  // Sorpresa: 15 % tras una ofrenda que cuenta, una al día como mucho, si el rincón está bien.
  let sorpresa: ObjetoColeccion | null = null
  const yaHoy = p.hallazgos.some((h) => dia(h.fecha) === dia(ahora))
  if (cuenta && despues.fase === 0 && !yaHoy && azar() < PROBABILIDAD_SORPRESA) {
    const tengo = new Set(objetosConseguidos(nueva, ahora).map((x) => x.objeto.id))
    sorpresa = elegir(COLECCION.filter((c) => c.area === area && !c.especial && !tengo.has(c.id)), azar) ?? null
    if (sorpresa) nueva = { ...nueva, hallazgos: [...nueva.hallazgos, { objetoId: sorpresa.id, fecha: ofrenda.fecha }] }
  }

  return { partida: nueva, ofrenda, cuenta, frase: r.frase, sorpresa, eventos, premio }
}

/** Deshace una ofrenda concreta (y su sorpresa, si la trajo). Lo demás se recalcula solo. */
export function deshacerOfrenda(p: Partida, ofrendaId: string): Partida {
  const o = p.ofrendas.find((x) => x.id === ofrendaId)
  if (!o) return p
  return {
    ...p,
    ofrendas: p.ofrendas.filter((x) => x.id !== ofrendaId),
    hallazgos: p.hallazgos.filter((h) => h.fecha !== o.fecha),
  }
}

export const cambiarDiaMalo = (p: Partida, activo: boolean, ahora: Date): Partida => ({ ...p, diaMalo: activo ? dia(ahora) : undefined })

/** Lo que dice un compañero al tocarlo en el bosque: si su rincón está mal, se queja; si no, saluda según la hora. */
export function fraseAlTocar(p: Partida, companero: CompaneroId, ahora: Date, azar: Azar, soloSaludo = false) {
  const area = COMPANEROS[companero].area
  const r = estadoBosque(p, ahora).find((x) => x.area === area)
  if (!soloSaludo && r && r.llegado && r.fase > 0) return elegirFrase(p, companero, `fase${r.fase}` as TipoFrase, azar)
  return elegirFrase(p, companero, 'saludo', azar, momentoDelDia(ahora))
}

export const nombreCompanero = (id: CompaneroId) => COMPANEROS[id].nombre
export const companeroDe = (a: AreaId) => AREAS[a].companero
