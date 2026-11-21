import { describe, expect, it } from 'vitest'
import { COMBA_INICIAL, DESLIZAR_OBJETO, FRASE_JUEGO_ESPECIAL, MANTENER_OBJETO, RITMO_OBJETO, tocarComba } from './juegosObjetos'
import { JUGUETES } from './jugabilidad'

describe('objetos para jugar, sin nuevas obligaciones', () => {
  it('tres toques a ritmo activan el salto y permiten volver a jugar', () => {
    const a = tocarComba(COMBA_INICIAL, 1000)
    const b = tocarComba(a.estado, 1600)
    const c = tocarComba(b.estado, 2200)
    expect(a.especial).toBe(false)
    expect(b.especial).toBe(false)
    expect(c.especial).toBe(true)
    expect(tocarComba(c.estado, 2900).especial).toBe(false)
    expect(tocarComba(tocarComba(c.estado, 2900).estado, 3500).especial).toBe(false)
    expect(tocarComba(tocarComba(tocarComba(c.estado, 2900).estado, 3500).estado, 4100).especial).toBe(true)
  })

  it('los toques demasiado separados no obligan a empezar una misión ni penalizan', () => {
    let p = tocarComba(COMBA_INICIAL, 1000).estado
    p = tocarComba(p, 2500).estado
    p = tocarComba(p, 4200).estado
    expect(p.seguidos).toBe(1)
    expect(tocarComba(p, 4400).especial).toBe(false)
  })

  it('los dobles toques fortuitos y los tiempos inválidos no generan éxito', () => {
    const p = tocarComba(COMBA_INICIAL, 1000).estado
    expect(tocarComba(p, 1040)).toMatchObject({ especial: false, estado: { seguidos: 1 } })
    expect(tocarComba(p, Number.NaN)).toEqual({ especial: false, estado: COMBA_INICIAL })
  })

  it('los gestos largos, de deslizamiento y rítmicos son exclusivos y alcanzables', () => {
    expect(Object.entries(MANTENER_OBJETO)).toHaveLength(10)
    expect(DESLIZAR_OBJETO).toEqual({ globo: 'girar', cometa: 'elevar' })
    expect(RITMO_OBJETO).toEqual({ comba: 'salto', bici: 'pedalear' })
    const activadores = [
      ...Object.keys(MANTENER_OBJETO),
      ...Object.keys(DESLIZAR_OBJETO),
      ...Object.keys(RITMO_OBJETO),
    ]
    expect(activadores).toHaveLength(14)
    expect(new Set(activadores).size).toBe(14)
    expect(activadores.sort()).toEqual([...JUGUETES].sort())
    expect(new Set(Object.values({ ...MANTENER_OBJETO, ...DESLIZAR_OBJETO, ...RITMO_OBJETO })).size).toBe(14)
    expect(Object.values(FRASE_JUEGO_ESPECIAL)).toHaveLength(14)
    expect(MANTENER_OBJETO.banco).toBeUndefined()
  })
})
