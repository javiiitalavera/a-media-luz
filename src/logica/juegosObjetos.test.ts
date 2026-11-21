import { describe, expect, it } from 'vitest'
import { COMBA_INICIAL, FRASE_JUEGO_ESPECIAL, MANTENER_OBJETO, tocarComba } from './juegosObjetos'

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

  it('los cuatro gestos largos son distintos y solo corresponden a juguetes', () => {
    expect(MANTENER_OBJETO).toEqual({ hoguera: 'avivar', maceta: 'regar', gramofono: 'dar-cuerda', telefono: 'llamada' })
    expect(MANTENER_OBJETO.banco).toBeUndefined()
    expect(Object.values(FRASE_JUEGO_ESPECIAL)).toHaveLength(5)
  })
})
