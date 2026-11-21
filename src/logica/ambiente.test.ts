import { describe, expect, it } from 'vitest'
import { OBJETOS_CASA, type CompaneroId } from '../contenido'
import { crearPartida } from './partida'
import { fenomenoDelDia, reaccionObjetoPorClima, type FenomenoBarrio } from './ambiente'
import { estacionDelDia, tiempoDelDia } from './convivencia'

const medioDia = (a: number, m: number, d: number) => new Date(a, m, d, 12)
const DIAS = Array.from({ length: 4 * 365 + 1 }, (_, i) => {
  const d = medioDia(2025, 0, 1)
  d.setDate(d.getDate() + i)
  return d
})

describe('P9: acontecimientos ambientales sin tareas ni premios', () => {
  it('un mismo día conserva exactamente el mismo fenómeno en todas las pantallas', () => {
    for (const fecha of DIAS.slice(0, 360)) {
      const tarde = new Date(fecha)
      tarde.setHours(20)
      expect(fenomenoDelDia(fecha)).toBe(fenomenoDelDia(tarde))
      expect(tiempoDelDia(fecha)).toBe(tiempoDelDia(tarde))
    }
  })

  it('los siete acontecimientos aparecen, pero también hay días normales', () => {
    const encontrados = new Set<FenomenoBarrio | null>(DIAS.map(fenomenoDelDia))
    expect(encontrados).toEqual(new Set<FenomenoBarrio | null>([
      'petalos', 'motas', 'hojas', 'escarcha', 'gotas', 'brillos', 'remolino', null,
    ]))
    const especiales = DIAS.filter((d) => fenomenoDelDia(d) !== null)
    expect(especiales.length).toBeGreaterThan(100)
    expect(especiales.length).toBeLessThan(DIAS.length / 2)
  })

  it('nunca aparecen nieve de invierno en verano ni hojas de otoño en primavera', () => {
    for (const fecha of DIAS) {
      const evento = fenomenoDelDia(fecha)
      const tiempo = tiempoDelDia(fecha)
      const estacion = estacionDelDia(fecha)
      if (evento === 'gotas') expect(tiempo).toBe('lluvia')
      if (evento === 'brillos') expect(tiempo).toBe('niebla')
      if (evento === 'remolino') expect(tiempo).toBe('viento')
      if (evento === 'petalos') { expect(tiempo).toBe('despejado'); expect(estacion).toBe('primavera') }
      if (evento === 'motas') { expect(tiempo).toBe('despejado'); expect(estacion).toBe('verano') }
      if (evento === 'escarcha') { expect(tiempo).toBe('despejado'); expect(estacion).toBe('invierno') }
      if (evento === 'hojas') { expect(estacion).toBe('otono'); expect(['viento', 'despejado']).toContain(tiempo) }
    }
  })

  it('cada una de las cinco casas tiene un objeto con una reacción al clima', () => {
    const vistos = new Set<CompaneroId>()
    for (const o of OBJETOS_CASA) {
      for (const tiempo of ['lluvia', 'viento', 'niebla', 'despejado'] as const) {
        for (const estacion of ['primavera', 'verano', 'otono', 'invierno'] as const) {
          if (reaccionObjetoPorClima(o.id, tiempo, estacion)) vistos.add(o.companero)
        }
      }
    }
    expect(vistos).toEqual(new Set(['nox', 'tofu', 'bruma', 'madeja', 'tuerca']))
    expect(reaccionObjetoPorClima('hoguera', 'lluvia', 'otono')).toBe('humo')
    expect(reaccionObjetoPorClima('maceta', 'lluvia', 'primavera')).toBe('gotas')
    expect(reaccionObjetoPorClima('loto', 'lluvia', 'invierno')).toBe('ondas')
    expect(reaccionObjetoPorClima('guirnalda', 'viento', 'otono')).toBe('aire')
    expect(reaccionObjetoPorClima('lampara', 'niebla', 'invierno')).toBe('halo')
    expect(reaccionObjetoPorClima('banco', 'lluvia', 'primavera')).toBeNull()
  })

  it('consultar clima y objetos no modifica ninguna parte de la partida', () => {
    const partida = crearPartida('nox', medioDia(2026, 10, 21), [], true)
    const antes = JSON.stringify(partida)
    for (const fecha of DIAS.slice(0, 80)) {
      fenomenoDelDia(fecha)
      reaccionObjetoPorClima('hoguera', tiempoDelDia(fecha), estacionDelDia(fecha))
    }
    expect(JSON.stringify(partida)).toBe(antes)
  })
})
