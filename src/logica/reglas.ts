// Reglas del bosque (docs/diseno-juego.md, «Reglas»). Todo se calcula a partir del historial de ofrendas:
// no se guarda ningún contador, así deshacer o cambiar un ritmo no deja nada incoherente.
import { AREAS, RITMOS, type AreaId } from '../contenido'
import { dia, diasEntre, lunes, sumarDias, type Dia } from './fechas'
import { areaPrincipal, type Ofrenda, type Partida } from './partida'
import { eclosion } from './meses'

export const TOPE_DIARIO = 3
export const OFRENDAS_PARA_LLEGAR = 3
export const OFRENDAS_ARREGLO = 2
export const OFRENDAS_ECHAR_VISITANTE = 3
export const GRADOS = [5, 15, 35] // ofrendas que cuentan para los grados 1, 2 y 3
/** Meta semanal por ritmo (ofrendas de su área en la semana). */
export const META_POR_RITMO = { diario: 5, varias: 4, par: 2, semanal: 2 } as const

const ofrendasDe = (p: Partida, area: AreaId, hasta: Date) =>
  p.ofrendas.filter((o) => o.area === area && new Date(o.fecha) <= hasta).sort((a, b) => a.fecha.localeCompare(b.fecha))

/** Agrupa ofrendas por día y marca cuáles cuentan (las 3 primeras de cada día). */
function porDia(ofrendas: Ofrenda[]) {
  const m = new Map<Dia, { o: Ofrenda; cuenta: boolean }[]>()
  for (const o of ofrendas) {
    const d = dia(o.fecha)
    const lista = m.get(d) ?? []
    lista.push({ o, cuenta: lista.length < TOPE_DIARIO })
    m.set(d, lista)
  }
  return m
}

// ---------- Llegada de compañeros ----------

/**
 * Día en que llegó el compañero de un área (null si aún no). En el vecindario, el día en que lo presentaste:
 * su casa no se descuida (ni recibe intrusos) antes de existir, y nadie anuncia una mudanza que no ha pasado.
 * En partidas antiguas (sin vecindario): el principal desde el inicio y los demás con 3 ofrendas de su área.
 */
export function diaDeLlegada(p: Partida, area: AreaId, ahora: Date): Dia | null {
  if (p.meses) {
    const meses = p.meses
    const m = meses.find((x) => x.companero === AREAS[area].companero)
    if (!m) return null
    if (m.presentado) return new Date(m.presentado) <= ahora ? dia(m.presentado) : null
    const e = m !== meses.at(-1) ? eclosion(p, m, ahora) : null
    return e ? dia(e) : null
  }
  if (area === areaPrincipal(p)) return dia(p.inicio)
  const o = ofrendasDe(p, area, ahora)
  return o.length >= OFRENDAS_PARA_LLEGAR ? dia(o[OFRENDAS_PARA_LLEGAR - 1].fecha) : null
}

// ---------- Recorrido de un rincón ----------

interface Recorrido {
  llegada: Dia | null
  crecimiento: number
  fase: number
  recup: number
  visitante: boolean
  /** Día en que llegó el visitante actual (para saber qué se llevó). */
  diaVisitante: Dia | null
  /** Ofrendas que han contado para crecer y para las metas (no las de arreglo ni las que pasan del tope). */
  productivas: Set<string>
  /** Ofrendas productivas agrupadas por semana (clave: lunes). */
  productivasPorSemana: Map<Dia, Ofrenda[]>
  /** Fase del rincón al empezar cada día. */
  faseAlEmpezar: Map<Dia, number>
  ultima: Dia | null
  ofrendas: Ofrenda[]
  dias: Map<Dia, { o: Ofrenda; cuenta: boolean }[]>
}

/**
 * Recorre el área día a día desde el inicio:
 * - cada ofrenda que cuenta hace crecer (si el rincón está bien) o arregla (si está estropeado);
 * - al acabar cada día, según los días sin ofrendas: >1 margen fase 1, >2 fase 2, >3 fase 3 con visitante;
 * - 2 ofrendas de arreglo quitan la niebla y el enfado; la 3.ª echa al visitante.
 * - El progreso del arreglo NO se pierde aunque pasen días entre ofrendas (el rincón puede volver a afearse,
 *   pero lo ya arreglado cuenta).
 */
const memoria = new WeakMap<Partida, Map<string, unknown>>()
/** Las reglas dependen del día, no de los segundos: se recalcula como mucho una vez por minuto. */
const minuto = (f: Date) => Math.floor(f.getTime() / 60_000)
/** Guarda resultados mientras la partida (inmutable) y la hora no cambien. */
function recordar<T>(p: Partida, clave: string, calcular: () => T): T {
  let m = memoria.get(p)
  if (!m) memoria.set(p, (m = new Map()))
  if (m.size > 60) m.clear() // no acumular si la partida no cambia en mucho rato
  if (!m.has(clave)) m.set(clave, calcular())
  return m.get(clave) as T
}

function recorrer(p: Partida, area: AreaId, ahora: Date): Recorrido {
  return recordar(p, `recorrido|${area}|${minuto(ahora)}`, () => recorrerSinMemoria(p, area, ahora))
}

function recorrerSinMemoria(p: Partida, area: AreaId, ahora: Date): Recorrido {
  const hoy = dia(ahora)
  const margen = RITMOS[p.ritmos[area]].margen
  const llegada = diaDeLlegada(p, area, ahora)
  const ofrendas = ofrendasDe(p, area, ahora)
  const dias = porDia(ofrendas)
  const r: Recorrido = {
    llegada, crecimiento: 0, fase: 0, recup: 0, visitante: false, diaVisitante: null,
    productivas: new Set(), productivasPorSemana: new Map(), faseAlEmpezar: new Map(), ultima: null, ofrendas, dias,
  }
  for (let d = dia(p.inicio); diasEntre(d, hoy) >= 0; d = sumarDias(d, 1)) {
    r.faseAlEmpezar.set(d, r.visitante ? 3 : r.fase)
    const llegado = llegada !== null && diasEntre(llegada, d) >= 0
    for (const { o, cuenta } of dias.get(d) ?? []) {
      if (!cuenta) continue
      if (llegado && (r.fase > 0 || r.visitante)) {
        r.recup++
        if (r.recup >= OFRENDAS_ARREGLO) r.fase = 0
        if (r.visitante && r.recup >= OFRENDAS_ECHAR_VISITANTE) {
          r.visitante = false
          r.diaVisitante = null
        }
        if (r.fase === 0 && !r.visitante) r.recup = 0
      } else {
        r.crecimiento++
        r.productivas.add(o.id)
        const sem = lunes(d)
        const lista = r.productivasPorSemana.get(sem) ?? []
        lista.push(o)
        r.productivasPorSemana.set(sem, lista)
      }
    }
    if (llegado && ((dias.get(d) ?? []).length || r.ultima === null)) r.ultima = d
    // Cierre del día (solo días terminados)
    if (llegado && d !== hoy && r.ultima) {
      const sin = diasEntre(r.ultima, d)
      const nueva = sin > 3 * margen ? 3 : sin > 2 * margen ? 2 : sin > margen ? 1 : 0
      if (nueva > r.fase) {
        if (nueva === 3 && !r.visitante) {
          r.visitante = true
          r.diaVisitante = d
        }
        r.fase = nueva // el progreso de arreglo (recup) se conserva
      }
    }
  }
  return r
}

// ---------- Estado de un rincón ----------

export interface EstadoRincon {
  area: AreaId
  llegado: boolean
  /** Ofrendas que faltan para que llegue su compañero. */
  faltanParaLlegar: number
  /** 0 bien · 1 asilvestrado · 2 enfurruñado · 3 visitante */
  fase: 0 | 1 | 2 | 3
  visitante: boolean
  /** Ofrendas que faltan para arreglarlo (0 si está bien). */
  faltanParaArreglar: number
  /** Ofrendas que han contado para crecer y grado de crecimiento 0–3. */
  crecimiento: number
  grado: 0 | 1 | 2 | 3
  /** Ofrendas de hoy en esta área (incluidas las que ya no cuentan). */
  hoy: number
  /** Días que aguanta sin ofrendas antes de pasar a la siguiente fase. */
  diasDeMargen: number
}

export function estadoRincon(p: Partida, area: AreaId, ahora: Date): EstadoRincon {
  const r = recorrer(p, area, ahora)
  const margen = RITMOS[p.ritmos[area]].margen
  const llegado = r.llegada !== null
  const faltan = r.visitante ? OFRENDAS_ECHAR_VISITANTE - r.recup : r.fase > 0 ? OFRENDAS_ARREGLO - r.recup : 0
  const sinOfrendas = r.ultima ? diasEntre(r.ultima, dia(ahora)) : 0
  const siguiente = (Math.min(r.fase, 2) + 1) * margen
  return {
    area,
    llegado,
    faltanParaLlegar: llegado ? 0 : OFRENDAS_PARA_LLEGAR - r.ofrendas.length,
    fase: llegado ? ((r.visitante ? 3 : r.fase) as EstadoRincon['fase']) : 0,
    visitante: llegado && r.visitante,
    faltanParaArreglar: llegado ? Math.max(0, faltan) : 0,
    crecimiento: r.crecimiento,
    grado: GRADOS.filter((g) => r.crecimiento >= g).length as EstadoRincon['grado'],
    hoy: r.dias.get(dia(ahora))?.length ?? 0,
    diasDeMargen: siguiente - sinOfrendas,
  }
}

/** Los cinco rincones en orden. */
export function estadoBosque(p: Partida, ahora: Date) {
  return (Object.keys(AREAS) as AreaId[]).map((a) => estadoRincon(p, a, ahora))
}
