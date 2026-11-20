// Los niveles cuentan días con retos de su área. Las llegadas cuentan días con cualquier reto.
import { tieneMes } from '../arte/manifiesto'
import { COMPANEROS, type AreaId, type CompaneroId } from '../contenido'
import type { Partida } from './partida'
import { eclosion, mesActual, mesesDe } from './meses'
import { queRecompensan } from './casa'
import { dia } from './fechas'

/** Variante gráfica guardada en el Álbum. Los niveles pueden compartir dibujo. */
export type Etapa = 0 | 1 | 2 | 3 | 4
export type Nivel = 1 | 2 | 3 | 4 | 5

export const NIVEL_MAXIMO = 5
// Días activos acumulados. Los umbrales siguen la frecuencia habitual de cada tipo de reto.
const DIAS_POR_NIVEL: Record<AreaId, Record<Nivel, number>> = {
  cuerpo: { 1: 0, 2: 4, 3: 10, 4: 21, 5: 35 },
  mente: { 1: 0, 2: 3, 3: 6, 4: 12, 5: 20 },
  calma: { 1: 0, 2: 3, 3: 6, 4: 12, 5: 20 },
  vinculos: { 1: 0, 2: 2, 3: 4, 4: 7, 5: 12 },
  orden: { 1: 0, 2: 2, 3: 3, 4: 5, 5: 8 },
}
const NIVELES = [5, 4, 3, 2, 1] as const
// Cada nivel con su dibujo. Quien no tenga aún los de los niveles 4 y 5, usa el adulto (rutaCompanero vuelve atrás).
const DIBUJOS: Record<Nivel, Etapa> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 }
const NIVELES_ANTIGUOS = [1, 2, 3] as const
export const dibujoDelNivel = (nivel: Nivel): Etapa => DIBUJOS[nivel]

/** Orden de llegada y días activos entre presentaciones. */
export const ORDEN_LLEGADA: CompaneroId[] = ['nox', 'tuerca', 'tofu', 'bruma', 'madeja']
const DIAS_PARA_OTRO_HUEVO = 2

export const vecinoDe = (p: Partida, c: CompaneroId) => mesesDe(p).find((m) => m.companero === c)

/**
 * ¿Está ya en el barrio? Cuenta desde que lo presentas (abres su huevo), no desde que el huevo está listo:
 * hasta entonces no sale en historias, no regala nada ni se construye para él.
 * (En partidas antiguas, un vecino anterior al último sin fecha de presentación cuenta desde su eclosión.)
 */
export function nacido(p: Partida, c: CompaneroId, ahora: Date): boolean {
  const m = vecinoDe(p, c)
  if (!m) return false
  if (m.presentado) return true
  return m !== mesesDe(p).at(-1) && eclosion(p, m, ahora) !== null
}

export const nacidos = (p: Partida, ahora: Date): CompaneroId[] =>
  mesesDe(p).map((m) => m.companero).filter((c) => nacido(p, c, ahora))

/** Días distintos con alguna hazaña de su área (que recompense) desde que llegó su huevo. */
export function diasActivos(p: Partida, c: CompaneroId, ahora: Date): number {
  const m = vecinoDe(p, c)
  if (!m) return 0
  const desde = new Date(m.inicio)
  const area = COMPANEROS[c].area
  const suyas = queRecompensan(p.ofrendas).filter((o) => o.area === area && new Date(o.fecha) >= desde && new Date(o.fecha) <= ahora)
  return new Set(suyas.map((o) => dia(o.fecha))).size
}

export interface Progreso {
  nivel: Nivel
  etapa: Etapa
  dias: number
  siguiente: { nivel: Nivel; dias: number } | null
}

/** Las apariencias que ya se celebraron equivalen a los primeros tres niveles. */
export const nivelVisto = (p: Partida, c: CompaneroId): Nivel =>
  p.nivelesVistos?.[c] ?? NIVELES_ANTIGUOS[p.etapasVistas?.[c] ?? 0]

export function progreso(p: Partida, c: CompaneroId, ahora: Date): Progreso {
  const dias = diasActivos(p, c, ahora)
  const visto = nivelVisto(p, c)
  const umbrales = DIAS_POR_NIVEL[COMPANEROS[c].area]
  const nivel = NIVELES.find((n) => n <= visto || dias >= umbrales[n]) ?? 1
  const proximo = NIVELES.find((n) => n === nivel + 1)
  const siguiente = proximo ? { nivel: proximo, dias: umbrales[proximo] } : null
  return { nivel, etapa: dibujoDelNivel(nivel), dias, siguiente }
}

export const nivelSinVer = (p: Partida, c: CompaneroId, nivel: Nivel) => nivel > nivelVisto(p, c)

export const marcarNivelVisto = (p: Partida, c: CompaneroId, nivel: Nivel): Partida =>
  nivelSinVer(p, c, nivel) ? { ...p, nivelesVistos: { ...p.nivelesVistos, [c]: nivel } } : p

/** Solo cuenta un día si se ha registrado algo después del día en que se presentó al último vecino. */
export function proximaLlegada(p: Partida, ahora: Date, posibles: readonly CompaneroId[] = ORDEN_LLEGADA.filter(tieneMes)) {
  const ultimo = mesActual(p)
  if (!ultimo.presentado) return null
  const usados = new Set(mesesDe(p).map((m) => m.companero))
  const vecino = ORDEN_LLEGADA.find((c) => posibles.includes(c) && !usados.has(c))
  if (!vecino) return null
  const desde = dia(ultimo.presentado)
  const activos = new Set<string>()
  for (const o of p.ofrendas) {
    const fecha = new Date(o.fecha)
    if (fecha > ahora) continue
    const d = dia(fecha)
    if (d > desde) activos.add(d)
    if (activos.size >= DIAS_PARA_OTRO_HUEVO) return { vecino, faltanDias: 0 }
  }
  return { vecino, faltanDias: DIAS_PARA_OTRO_HUEVO - activos.size }
}

/** Recoge el huevo de la puerta, que ya se puede abrir en su parcela. */
export function incubar(p: Partida, c: CompaneroId, ahora: Date): Partida {
  const llegada = proximaLlegada(p, ahora)
  if (llegada?.vecino !== c || llegada.faltanDias !== 0) return p
  return { ...p, meses: [...mesesDe(p), { companero: c, inicio: ahora.toISOString(), listo: true }] }
}
