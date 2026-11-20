import { describe, expect, it } from 'vitest'
import { OBJETOS_CASA } from '../contenido'
import { colocar, encajar, guardado, guardar, movible, ordenOriginal, sacar, sitioDe } from './colocar'
import { crearPartida } from './partida'
import { en } from './test-utils'

const obj = (id: string) => OBJETOS_CASA.find((o) => o.id === id)!
const base = () => crearPartida('nox', en('2026-01-05', 9), undefined, true)

describe('ordenar la casa', () => {
  it('se mueven las cosas del suelo y las colgadas; Gregorio y lo de la pared, no', () => {
    expect(movible(obj('hoguera'))).toBe(true)
    expect(movible(obj('farolillo'))).toBe(true)
    expect(movible(obj('aspiradora'))).toBe(false)
    expect(movible(obj('tablon'))).toBe(false) // está en la pared del taller
  })

  it('lo que sueltas fuera del suelo encaja en el punto más cercano; lo colgado solo se mueve de lado', () => {
    expect(encajar(obj('hoguera'), 50, 20)).toEqual({ x: 50, y: 46 })
    expect(encajar(obj('hoguera'), 99, 99)).toEqual({ x: 88, y: 82 })
    expect(encajar(obj('farolillo'), 70, 60)).toEqual({ x: 70, y: obj('farolillo').sitio.y })
    // Bruma: la tetera soltada en mitad del agua va al trozo de tierra más cercano.
    const t = encajar(obj('tetera'), 50, 60)
    expect(t).toEqual({ x: 68, y: 56 })
  })

  it('los objetos de sobremesa se apoyan sobre muebles y pueden ir al baúl', () => {
    const telefono = obj('telefono')
    for (const id of ['telefono', 'tetera-rosa', 'marco', 'flexo', 'maquina', 'colchoneta']) {
      const o = obj(id)
      expect(movible(o)).toBe(true)
      expect(encajar(o, o.sitio.x, o.sitio.y)).toEqual({ x: o.sitio.x, y: o.sitio.y })
    }
    expect(encajar(telefono, 50, 26)).toEqual({ x: 36, y: 43 })
    const p = colocar(base(), 'telefono', 70, 75)
    expect(sitioDe(p, telefono)).toMatchObject({ x: 70, y: 43.5 })
    expect(guardado(guardar(p, 'telefono'), 'telefono')).toBe(true)
    expect(sitioDe(ordenOriginal(p, 'madeja'), telefono)).toEqual(telefono.sitio)
  })

  it('al fondo se ve más pequeño y delante más grande; se guarda en la partida y se puede deshacer', () => {
    let p = colocar(base(), 'hoguera', 40, 80)
    expect(p.colocados!.hoguera).toEqual({ x: 40, y: 80 })
    const cerca = sitioDe(p, obj('hoguera'))
    expect(cerca.ancho).toBeGreaterThan(obj('hoguera').sitio.ancho)
    p = colocar(p, 'hoguera', 40, 46)
    expect(sitioDe(p, obj('hoguera')).ancho).toBeLessThan(obj('hoguera').sitio.ancho)
    p = colocar(p, 'tetera', 40, 40)
    p = ordenOriginal(p, 'nox')
    expect(p.colocados!.hoguera).toBeUndefined()
    expect(p.colocados!.tetera).toBeDefined() // lo de otras casas no se toca
    expect(sitioDe(p, obj('hoguera'))).toEqual(obj('hoguera').sitio)
    expect(colocar(p, 'aspiradora', 10, 10)).toBe(p)
  })

  it('el baúl guarda y saca; lo guardado sigue construido y Gregorio no se guarda', () => {
    let p = guardar(base(), 'hoguera')
    expect(guardado(p, 'hoguera')).toBe(true)
    expect(guardar(p, 'hoguera')).toBe(p)
    expect(guardar(p, 'aspiradora')).toBe(p)
    p = sacar(p, 'hoguera')
    expect(guardado(p, 'hoguera')).toBe(false)
    expect(p.guardados).toEqual([])
  })
})
