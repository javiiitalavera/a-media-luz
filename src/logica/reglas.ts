// Reglas del bosque (docs/diseno-juego.md, «Reglas»). Todo se calcula a partir del historial de ofrendas:
// no se guarda ningún contador, así deshacer o cambiar un ritmo no deja nada incoherente.
import { AREAS, COLECCION, RITMOS, type AreaId, type ObjetoColeccion } from '../contenido'
import { dia, diasEntre, lunes, sumarDias, type Dia } from './fechas'
import { areaPrincipal, type Ofrenda, type Partida } from './partida'

export const TOPE_DIARIO = 3
export const OFRENDAS_PARA_LLEGAR = 3
export const OFRENDAS_ARREGLO = 2
export const OFRENDAS_ECHAR_VISITANTE = 3
export const GRADOS = [5, 15, 35] // ofrendas que cuentan para los grados 1, 2 y 3
export const PROBABILIDAD_SORPRESA = 0.15
/** Meta semanal por ritmo (ofrendas de su área en la semana). */
export const META_POR_RITMO = { diario: 5, varias: 4, par: 2, semanal: 1 } as const

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

/** Día en que llegó el compañero de un área (null si aún no). El principal está desde el inicio. */
export function diaDeLlegada(p: Partida, area: AreaId, ahora: Date): Dia | null {
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

// ---------- Metas semanales ----------

export interface MetaSemana {
  semana: Dia
  area: AreaId
  meta: number
  hechas: number
  cumplida: boolean
  /** Fecha ISO de la ofrenda que la cumplió. */
  fechaCumplida?: string
  /** Premio ganado: el siguiente objeto especial y, si se han acabado, uno normal que aún no tengas. */
  premio?: ObjetoColeccion
}

/**
 * Metas de cada semana desde el inicio. Un compañero propone meta si había llegado al empezar la semana
 * y su rincón empezaba la semana bien (si está estropeado, «se pausa lo bueno»).
 * Solo cuentan las ofrendas productivas (no las de arreglo ni las que pasan del tope diario).
 */
export function metas(p: Partida, ahora: Date): MetaSemana[] {
  return recordar(p, `metas|${minuto(ahora)}`, () => metasSinMemoria(p, ahora))
}

function metasSinMemoria(p: Partida, ahora: Date): MetaSemana[] {
  const hoy = dia(ahora)
  const resultado: MetaSemana[] = []
  const recorridos = Object.fromEntries((Object.keys(AREAS) as AreaId[]).map((a) => [a, recorrer(p, a, ahora)])) as Record<AreaId, Recorrido>
  const premiados = new Set<string>()
  const ultimaMeta: Partial<Record<AreaId, MetaSemana>> = {}
  for (let semana = lunes(dia(p.inicio)); diasEntre(semana, hoy) >= 0; semana = sumarDias(semana, 7)) {
    for (const area of Object.keys(AREAS) as AreaId[]) {
      const r = recorridos[area]
      if (!r.llegada || diasEntre(r.llegada, semana) < 0) continue
      if ((r.faseAlEmpezar.get(semana) ?? 0) > 0) continue
      const anterior = ultimaMeta[area]?.semana === sumarDias(semana, -7) ? ultimaMeta[area] : undefined
      const meta = Math.max(1, META_POR_RITMO[p.ritmos[area]] - (anterior && !anterior.cumplida ? 1 : 0))
      const hechas = r.productivasPorSemana.get(semana) ?? []
      const m: MetaSemana = { semana, area, meta, hechas: hechas.length, cumplida: hechas.length >= meta }
      if (m.cumplida) {
        m.fechaCumplida = hechas[meta - 1].fecha
        const tengo = new Set([...premiados, ...p.hallazgos.filter((h) => h.fecha <= m.fechaCumplida!).map((h) => h.objetoId)])
        const delArea = COLECCION.filter((c) => c.area === area && !tengo.has(c.id))
        m.premio = delArea.find((c) => c.especial) ?? delArea.find((c) => !c.especial)
        if (m.premio) premiados.add(m.premio.id)
      }
      resultado.push(m)
      ultimaMeta[area] = m
    }
  }
  return resultado
}

// ---------- Colección ----------

/** Objetos conseguidos (sorpresas y premios semanales) con su fecha. */
export function objetosConseguidos(p: Partida, ahora: Date): { objeto: ObjetoColeccion; fecha: string }[] {
  const porSorpresa = p.hallazgos
    .filter((h) => new Date(h.fecha) <= ahora)
    .map((h) => ({ objeto: COLECCION.find((c) => c.id === h.objetoId)!, fecha: h.fecha }))
    .filter((x) => x.objeto)
  const premios = metas(p, ahora)
    .filter((m) => m.premio && m.fechaCumplida)
    .map((m) => ({ objeto: m.premio!, fecha: m.fechaCumplida! }))
  return [...porSorpresa, ...premios].sort((a, b) => a.fecha.localeCompare(b.fecha))
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
  /** Objeto que se ha llevado el visitante (vuelve al echarlo). */
  robado: ObjetoColeccion | null
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

export function estadoRincon(p: Partida, area: AreaId, ahora: Date, conseguidos = objetosConseguidos(p, ahora)): EstadoRincon {
  const r = recorrer(p, area, ahora)
  const margen = RITMOS[p.ritmos[area]].margen
  const llegado = r.llegada !== null
  // El visitante se llevó el último objeto de esa área conseguido hasta el día en que llegó.
  const robado = r.visitante && r.diaVisitante
    ? conseguidos.filter((x) => x.objeto.area === area && diasEntre(dia(x.fecha), r.diaVisitante!) >= 0).at(-1)?.objeto ?? null
    : null
  const faltan = r.visitante ? OFRENDAS_ECHAR_VISITANTE - r.recup : r.fase > 0 ? OFRENDAS_ARREGLO - r.recup : 0
  const sinOfrendas = r.ultima ? diasEntre(r.ultima, dia(ahora)) : 0
  const siguiente = (Math.min(r.fase, 2) + 1) * margen
  return {
    area,
    llegado,
    faltanParaLlegar: llegado ? 0 : OFRENDAS_PARA_LLEGAR - r.ofrendas.length,
    fase: llegado ? ((r.visitante ? 3 : r.fase) as EstadoRincon['fase']) : 0,
    visitante: llegado && r.visitante,
    robado: llegado ? robado : null,
    faltanParaArreglar: llegado ? Math.max(0, faltan) : 0,
    crecimiento: r.crecimiento,
    grado: GRADOS.filter((g) => r.crecimiento >= g).length as EstadoRincon['grado'],
    hoy: r.dias.get(dia(ahora))?.length ?? 0,
    diasDeMargen: siguiente - sinOfrendas,
  }
}

/** Los cinco rincones en orden (calcula la colección una sola vez). */
export function estadoBosque(p: Partida, ahora: Date) {
  const conseguidos = objetosConseguidos(p, ahora)
  return (Object.keys(AREAS) as AreaId[]).map((a) => estadoRincon(p, a, ahora, conseguidos))
}

/** Objetos que están ahora en el nido del cuervo. */
export const robados = (p: Partida, ahora: Date) =>
  estadoBosque(p, ahora).flatMap((r) => (r.robado ? [r.robado] : []))
