import { describe, expect, it } from 'vitest'
import { eclosion, estadoDelMes, marcarPresentado, mesActual, mesesDe } from './meses'
import { incubar, nacido, progreso } from './etapas'
import { deshacerOfrenda } from './ofrendas'
import { con, en, nueva } from './test-utils'

describe('vecinos (guardados como «meses»)', () => {
  it('las partidas antiguas tienen un vecino implícito: su principal desde el inicio', () => {
    const p = nueva('nox', '2026-01-05')
    expect(mesesDe(p)).toHaveLength(1)
    expect(mesActual(p).companero).toBe('nox')
  })
  it('el huevo eclosiona con la tercera hazaña desde que llegó, de cualquier área', () => {
    let p = con(nueva(), 'mente', '2026-01-05', 2)
    expect(eclosion(p, mesActual(p), en('2026-01-05', 20))).toBeNull()
    p = con(p, 'orden', '2026-01-06')
    expect(eclosion(p, mesActual(p), en('2026-01-06', 20))).not.toBeNull()
  })
  it('desmarcar un reto no devuelve al huevo al vecino ya presentado', () => {
    const ahora = en('2026-01-05', 20)
    const p = marcarPresentado(con(nueva(), 'mente', '2026-01-05', 3), ahora)
    const sinTercera = deshacerOfrenda(p, p.ofrendas.at(-1)!.id)
    expect(estadoDelMes(sinTercera, ahora)).toBe('vivo')
    expect(nacido(sinTercera, 'nox', ahora)).toBe(true)
  })
  it('conserva al vecino de una partida antigua al incubar el siguiente huevo', () => {
    const { meses: _meses, ...antigua } = nueva()
    const ahora = en('2026-01-07', 20)
    const p = incubar(con(con(antigua, 'mente', '2026-01-06'), 'mente', '2026-01-07'), 'tuerca', ahora)
    expect(nacido(p, 'nox', ahora)).toBe(true)
    expect(mesActual(p).companero).toBe('tuerca')
    expect(estadoDelMes(p, ahora)).toBe('naciendo')
  })
  it('un huevo ya incubado en una partida antigua conserva sus avances', () => {
    const p = { ...nueva(), meses: [
      { companero: 'nox' as const, inicio: en('2026-01-05').toISOString(), presentado: en('2026-01-05').toISOString() },
      { companero: 'tuerca' as const, inicio: en('2026-01-08', 8).toISOString() },
    ] }
    const dos = con(p, 'mente', '2026-01-08', 2)
    expect(estadoDelMes(dos, en('2026-01-08'))).toBe('huevo')
    expect(estadoDelMes(con(dos, 'mente', '2026-01-09'), en('2026-01-09'))).toBe('naciendo')
  })
  it('conserva una etapa ya celebrada aunque se desmarque el reto que la desbloqueó', () => {
    const p = { ...nueva(), etapasVistas: { nox: 1 as const } }
    expect(progreso(p, 'nox', en('2026-01-05', 20))).toMatchObject({ nivel: 2, etapa: 1 })
  })
})
