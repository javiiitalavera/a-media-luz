// Retos del mes (docs/diseno-meses.md): 3 por mes, el primero del área del compañero. Cuentan las veces
// que se hace cada acción a lo largo del mes (con el tope de 3 al día por área). Las hazañas de un reto
// dan doble material. Cada reto cumplido trae un objeto exclusivo para su casa.
import { COMPANEROS, OBJETOS_CASA, type AreaId, type CompaneroId, type ObjetoCasa } from '../contenido'
import type { Partida } from './partida'
import { mesActual, mesesDe, ofrendasDelMes, queCuentan, type Mes, type Reto } from './meses'

export const NUM_RETOS = 3
export type Nivel = 'suave' | 'normal' | 'valiente'
export const NIVELES: Record<Nivel, number> = { suave: 8, normal: 12, valiente: 20 }
export const nivelDe = (veces: number): Nivel => (veces >= NIVELES.valiente ? 'valiente' : veces >= NIVELES.normal ? 'normal' : 'suave')

export interface Progreso { reto: Reto; hechas: number; cumplido: boolean }

/** Cómo va cada reto de un mes. */
export function progresoRetos(p: Partida, mes: Mes, ahora: Date): Progreso[] {
  const cuentan = queCuentan(ofrendasDelMes(p, mes, ahora))
  return (mes.retos ?? []).map((reto) => {
    const hechas = cuentan.filter((o) => o.accionId === reto.accionId).length
    return { reto, hechas, cumplido: hechas >= reto.veces }
  })
}

/** ¿Son válidos? 3, sin repetir acción, el primero del área del compañero y con un número de veces de los niveles. */
export function retosValidos(p: Partida, mes: Mes, retos: Reto[]): boolean {
  const area: AreaId = COMPANEROS[mes.companero].area
  const accion = (id: string) => p.acciones.find((a) => a.id === id)
  return retos.length === NUM_RETOS
    && new Set(retos.map((r) => r.accionId)).size === NUM_RETOS
    && retos.every((r) => accion(r.accionId) && Object.values(NIVELES).includes(r.veces))
    && accion(retos[0].accionId)!.area === area
}

const conMesActual = (p: Partida, cambio: (m: Mes) => Mes): Partida => {
  const meses = mesesDe(p)
  return { ...p, meses: meses.map((m, i) => (i === meses.length - 1 ? cambio(m) : m)) }
}

/** Fija los retos del mes en curso (solo si aún no los tiene y son válidos). */
export function elegirRetos(p: Partida, retos: Reto[]): Partida | null {
  const mes = mesActual(p)
  if (mes.retos?.length || !retosValidos(p, mes, retos)) return null
  return conMesActual(p, (m) => ({ ...m, retos }))
}

/** Cambia un reto gastando el comodín del mes (una sola vez). */
export function usarComodin(p: Partida, i: number, nuevo: Reto): Partida | null {
  const mes = mesActual(p)
  if (!mes.retos || mes.comodinUsado) return null
  const retos = mes.retos.map((r, k) => (k === i ? nuevo : r))
  if (!retosValidos(p, mes, retos)) return null
  return conMesActual(p, (m) => ({ ...m, retos, comodinUsado: true }))
}

/** Acciones que son reto en un mes (dan doble material). */
export const accionesConReto = (mes: Mes) => new Set((mes.retos ?? []).map((r) => r.accionId))

/** Objetos premio que ha ganado un compañero: el del reto i, si lo cumplió en su mes. */
export function premiosGanados(p: Partida, c: CompaneroId, ahora: Date): ObjetoCasa[] {
  const ganados = new Set<number>()
  for (const mes of mesesDe(p).filter((m) => m.companero === c))
    progresoRetos(p, mes, ahora).forEach((r, i) => r.cumplido && ganados.add(i))
  return OBJETOS_CASA.filter((o) => o.companero === c && o.premio !== undefined && ganados.has(o.premio))
}

/** El premio de cada reto de un compañero (por posición). */
export const premioDeReto = (c: CompaneroId, i: number) => OBJETOS_CASA.find((o) => o.companero === c && o.premio === i)
