import { describe, expect, it } from 'vitest'
import { crecioSinVer, etapaPorCrecimiento, marcarEtapaVista, progreso } from './etapas'
import { con, en, nueva } from './test-utils'
import { sumarDias } from './fechas'

describe('etapas de Nox', () => {
  it('cachorro, joven a 15 y adulto a 35', () => {
    expect([0, 14, 15, 34, 35, 90].map(etapaPorCrecimiento)).toEqual([0, 0, 1, 1, 2, 2])
  })
  it('crece con las ofrendas de su área y dice cuánto falta', () => {
    let p = nueva()
    for (let i = 0; i < 8; i++) p = con(p, 'cuerpo', sumarDias('2026-01-05', i), 2)
    const g = progreso(p, 'nox', en('2026-01-12', 20))
    expect(g).toMatchObject({ etapa: 1, crecimiento: 16, siguiente: 35, desde: 15 })
  })
  it('las ofrendas de otras áreas no le hacen crecer', () => {
    let p = nueva()
    for (let i = 0; i < 8; i++) p = con(p, 'mente', sumarDias('2026-01-05', i), 3)
    expect(progreso(p, 'nox', en('2026-01-12', 20)).etapa).toBe(0)
  })
  it('la celebración sale una vez por etapa', () => {
    let p = nueva()
    expect(crecioSinVer(p, 'nox', 1)).toBe(true)
    p = marcarEtapaVista(p, 'nox', 1)
    expect(crecioSinVer(p, 'nox', 1)).toBe(false)
    expect(crecioSinVer(p, 'nox', 2)).toBe(true)
  })
})
