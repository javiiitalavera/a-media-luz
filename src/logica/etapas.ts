// Etapas de crecimiento de los compañeros: cachorro → joven → adulto.
// Suben con las ofrendas de su área principal hechas durante su mes (como mucho 3 al día) y nunca
// bajan: lo crecido no se pierde. Al acabar su mes, se queda en la etapa a la que haya llegado.
import { COMPANEROS, type CompaneroId } from '../contenido'
import type { Partida } from './partida'
import { crecimientoDelMes, mesesDe } from './meses'

export type Etapa = 0 | 1 | 2
/** Crecimiento necesario para cada etapa (coincide con los grados 2 y 3 del rincón). */
export const UMBRALES_ETAPA = [0, 15, 35] as const

export function etapaPorCrecimiento(crecimiento: number): Etapa {
  return crecimiento >= UMBRALES_ETAPA[2] ? 2 : crecimiento >= UMBRALES_ETAPA[1] ? 1 : 0
}

export interface Progreso {
  etapa: Etapa
  crecimiento: number
  /** Crecimiento al que llega la siguiente etapa (null si ya es adulto). */
  siguiente: number | null
  /** Desde dónde se cuenta la etapa actual (para la barra). */
  desde: number
}

export function progreso(p: Partida, c: CompaneroId, ahora: Date): Progreso {
  const crecimiento = mesesDe(p).filter((m) => m.companero === c)
    .reduce((n, m) => n + crecimientoDelMes(p, m, ahora, COMPANEROS[c].area), 0)
  const etapa = etapaPorCrecimiento(crecimiento)
  return { etapa, crecimiento, siguiente: etapa < 2 ? UMBRALES_ETAPA[etapa + 1] : null, desde: UMBRALES_ETAPA[etapa] }
}

/** ¿Ha crecido desde la última vez que se vio su casa? (para la celebración). */
export const crecioSinVer = (p: Partida, c: CompaneroId, etapa: Etapa) => etapa > (p.etapasVistas?.[c] ?? 0)

export const marcarEtapaVista = (p: Partida, c: CompaneroId, etapa: Etapa): Partida =>
  ({ ...p, etapasVistas: { ...p.etapasVistas, [c]: etapa } })
