import { describe, expect, it } from 'vitest'
import { eclosion, mesActual, mesesDe } from './meses'
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
})
