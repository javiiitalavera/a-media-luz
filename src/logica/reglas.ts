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

// ---------- Metas semanales ----------

export interface MetaSemana {
  semana: Dia
  area: AreaId
  meta: number
  hechas: number
  cumplida: boolean
  /** Fecha ISO de la ofrenda que la cumplió. */
  fechaCumplida?: string
  /** Premio especial ganado al cumplirla (si quedaban). */
  premio?: ObjetoColeccion
}

/** Metas de todas las semanas desde el inicio, de los compañeros que habían llegado al empezar cada semana. */
export function metas(p: Partida, ahora: Date): MetaSemana[] {
  const hoy = dia(ahora)
  const resultado: MetaSemana[] = []
  const cumplidasPorArea: Record<string, number> = {}
  for (let semana = lunes(dia(p.inicio)); diasEntre(semana, hoy) >= 0; semana = sumarDias(semana, 7)) {
    for (const area of Object.keys(AREAS) as AreaId[]) {
      const llegada = diaDeLlegada(p, area, ahora)
      // El compañero tiene meta si había llegado antes de que acabara el lunes de esa semana.
      if (!llegada || diasEntre(llegada, semana) < 0) continue
      const anterior = resultado.find((m) => m.area === area && m.semana === sumarDias(semana, -7))
      const base = META_POR_RITMO[p.ritmos[area]]
      const meta = Math.max(1, base - (anterior && !anterior.cumplida ? 1 : 0))
      const contadas = [...porDia(ofrendasDe(p, area, ahora)).entries()]
        .filter(([d]) => diasEntre(semana, d) >= 0 && diasEntre(semana, d) <= 6)
        .flatMap(([, l]) => l.filter((x) => x.cuenta).map((x) => x.o))
      const m: MetaSemana = { semana, area, meta, hechas: contadas.length, cumplida: contadas.length >= meta }
      if (m.cumplida) {
        m.fechaCumplida = contadas[meta - 1].fecha
        const especiales = COLECCION.filter((c) => c.area === area && c.especial)
        const n = cumplidasPorArea[area] ?? 0
        m.premio = especiales[n]
        cumplidasPorArea[area] = n + 1
      }
      resultado.push(m)
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
  /** Días que aguanta sin ofrendas antes de pasar a la siguiente fase (puede ser negativo si ya se estropeó). */
  diasDeMargen: number
}

/**
 * Recorre el área día a día desde el inicio:
 * - cada ofrenda que cuenta hace crecer (si el rincón está bien) o arregla (si está estropeado);
 * - al acabar cada día, según los días sin ofrendas: >1 margen fase 1, >2 fase 2, >3 fase 3 con visitante,
 *   que se lleva el último objeto conseguido de esa área;
 * - 2 ofrendas quitan la niebla y el enfado; la 3.ª echa al visitante y devuelve lo robado.
 */
export function estadoRincon(p: Partida, area: AreaId, ahora: Date): EstadoRincon {
  const hoy = dia(ahora)
  const inicio = dia(p.inicio)
  const margen = RITMOS[p.ritmos[area]].margen
  const llegada = diaDeLlegada(p, area, ahora)
  const ofrendas = ofrendasDe(p, area, ahora)
  const dias = porDia(ofrendas)
  const conseguidos = objetosConseguidos(p, ahora).filter((x) => x.objeto.area === area)

  let crecimiento = 0
  let fase = 0
  let recup = 0
  let visitante = false
  let robado: ObjetoColeccion | null = null
  let ultima: Dia | null = null

  for (let d = inicio; diasEntre(d, hoy) >= 0; d = sumarDias(d, 1)) {
    const llegadoHoy = llegada !== null && diasEntre(llegada, d) >= 0
    for (const { cuenta } of dias.get(d) ?? []) {
      if (!cuenta) continue
      if (llegadoHoy && (fase > 0 || visitante)) {
        recup++
        if (recup >= OFRENDAS_ARREGLO) fase = 0
        if (visitante && recup >= OFRENDAS_ECHAR_VISITANTE) {
          visitante = false
          robado = null
        }
        if (fase === 0 && !visitante) recup = 0
      } else {
        crecimiento++
      }
    }
    if ((dias.get(d) ?? []).length && llegadoHoy) ultima = d
    if (llegadoHoy && ultima === null) ultima = d // desde la llegada empieza a contar el margen

    // Cierre del día (solo días terminados)
    if (llegadoHoy && d !== hoy && ultima) {
      const sin = diasEntre(ultima, d)
      const nueva = sin > 3 * margen ? 3 : sin > 2 * margen ? 2 : sin > margen ? 1 : 0
      if (nueva > fase) {
        if (nueva === 3 && !visitante) {
          visitante = true
          // Se lleva el último objeto de esa área conseguido hasta ese día.
          const hasta = conseguidos.filter((x) => diasEntre(dia(x.fecha), d) >= 0)
          robado = hasta.at(-1)?.objeto ?? null
        }
        fase = Math.max(fase, nueva)
        recup = 0
      }
    }
  }

  const llegado = llegada !== null
  const faseVisible = (visitante ? 3 : fase) as EstadoRincon['fase']
  const faltan = visitante ? OFRENDAS_ECHAR_VISITANTE - recup : fase > 0 ? OFRENDAS_ARREGLO - recup : 0
  const sinOfrendas = ultima ? diasEntre(ultima, hoy) : 0
  const siguiente = (Math.min(fase, 2) + 1) * margen
  return {
    area,
    llegado,
    faltanParaLlegar: llegado ? 0 : OFRENDAS_PARA_LLEGAR - ofrendas.length,
    fase: llegado ? faseVisible : 0,
    visitante: llegado && visitante,
    robado: llegado ? robado : null,
    faltanParaArreglar: llegado ? faltan : 0,
    crecimiento,
    grado: (GRADOS.filter((g) => crecimiento >= g).length as EstadoRincon['grado']),
    hoy: dias.get(hoy)?.length ?? 0,
    diasDeMargen: siguiente - sinOfrendas,
  }
}

/** Los cinco rincones en orden. */
export const estadoBosque = (p: Partida, ahora: Date) =>
  (Object.keys(AREAS) as AreaId[]).map((a) => estadoRincon(p, a, ahora))

/** Objetos que están ahora en el nido del cuervo. */
export const robados = (p: Partida, ahora: Date) =>
  estadoBosque(p, ahora).flatMap((r) => (r.robado ? [r.robado] : []))
