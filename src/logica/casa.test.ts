import { describe, expect, it } from 'vitest'
import { construir, disponibles, faltan, ganados, puedeConstruir } from './casa'
import { OBJETOS_CASA } from '../contenido'
import { con, en, nueva } from './test-utils'

const objeto = (id: string) => OBJETOS_CASA.find((o) => o.id === id)!

describe('materiales', () => {
  it('cada ofrenda da 1 material de su área, como mucho 3 al día', () => {
    let p = con(nueva(), 'cuerpo', '2026-01-05', 5)
    p = con(p, 'mente', '2026-01-06', 2)
    const g = ganados(p, en('2026-01-06', 20))
    expect(g.cuerpo).toBe(3)
    expect(g.mente).toBe(2)
    expect(g.calma).toBe(0)
  })
  it('no cuenta lo que aún no ha pasado', () => {
    const p = con(nueva(), 'cuerpo', '2026-01-07')
    expect(ganados(p, en('2026-01-06')).cuerpo).toBe(0)
  })
})

describe('construir', () => {
  it('gasta materiales y no deja construir dos veces lo mismo', () => {
    let p = con(con(nueva(), 'cuerpo', '2026-01-05', 3), 'cuerpo', '2026-01-06', 1)
    const ahora = en('2026-01-06', 20)
    expect(puedeConstruir(p, objeto('hoguera'), ahora)).toBe(true)
    p = construir(p, 'hoguera', ahora)!
    expect(disponibles(p, ahora).cuerpo).toBe(1)
    expect(construir(p, 'hoguera', ahora)).toBeNull()
  })
  it('dice lo que falta y no construye sin materiales', () => {
    const p = con(nueva(), 'cuerpo', '2026-01-05', 2)
    const ahora = en('2026-01-05', 20)
    expect(faltan(p, objeto('cojin'), ahora)).toEqual({ vinculos: 2 })
    expect(construir(p, 'cojin', ahora)).toBeNull()
  })
  it('partidas antiguas sin construcciones funcionan', () => {
    const p = { ...con(nueva(), 'cuerpo', '2026-01-05', 3), construcciones: undefined }
    expect(construir(p, 'hoguera', en('2026-01-05', 20))?.construcciones).toHaveLength(1)
  })
})
