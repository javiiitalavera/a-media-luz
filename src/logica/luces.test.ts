import { describe, expect, it } from 'vitest'
import { OBJETOS_CASA } from '../contenido'
import { objetoAlumbra, objetoApagadoDeNoche } from './luces'

const objeto = (id: string) => OBJETOS_CASA.find((o) => o.id === id)!

describe('luces según el momento del día', () => {
  it('apaga de noche fuego, horno, parrilla, flexo y lámpara del taller', () => {
    for (const id of ['hoguera', 'horno', 'parrilla', 'flexo', 'lampara']) {
      expect(objetoAlumbra(objeto(id), false)).toBe(true)
      expect(objetoAlumbra(objeto(id), true)).toBe(false)
      expect(objetoApagadoDeNoche(id, true)).toBe(true)
    }
  })
  it('mantiene farolillos, loto, luciérnagas y setas luminosas', () => {
    for (const id of ['farolillo', 'farol-luna', 'farol-punto', 'farol-papel', 'seta', 'tarro', 'loto']) {
      expect(objetoAlumbra(objeto(id), true)).toBe(true)
    }
  })
  it('no crea luz para objetos sin luminaria', () => {
    expect(objetoAlumbra(objeto('banco'), false)).toBe(false)
    expect(objetoAlumbra(objeto('banco'), true)).toBe(false)
  })
})
