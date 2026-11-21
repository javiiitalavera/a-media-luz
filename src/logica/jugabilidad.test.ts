import { describe, expect, it } from 'vitest'
import { colocar, encajar, guardar, ordenOriginal } from './colocar'
import { crearPartida } from './partida'
import { OBJETOS_CASA } from '../contenido'
import { esJuguete, recordarVecindades, VECINDADES, vecindadesActivas, vecindadesNuevas, zonaIncomoda } from './jugabilidad'

const base = () => ({
  ...crearPartida('nox', new Date('2026-11-20T12:00:00Z'), undefined, true),
  construcciones: [
    { objetoId: 'hoguera', fecha: '2026-11-20' },
    { objetoId: 'banco', fecha: '2026-11-20' },
  ],
})

describe('juego táctil y vecindades', () => {
  it('reconoce cinco juguetes, pero no los demás objetos', () => {
    for (const id of ['hoguera', 'comba', 'maceta', 'gramofono', 'telefono']) expect(esJuguete(id)).toBe(true)
    expect(esJuguete('banco')).toBe(false)
  })

  it('la caricia tiene una zona cómica diferente según el vecino', () => {
    expect(zonaIncomoda('tofu', 0.5, 0.1)).toBe(true)
    expect(zonaIncomoda('tofu', 0.5, 0.8)).toBe(false)
    expect(zonaIncomoda('nox', 0.9, 0.8)).toBe(true)
    expect(zonaIncomoda('tuerca', 0.5, 0.15)).toBe(true)
  })

  it('no descubre una pareja de muebles separados y sí cuando están cerca', () => {
    const p = base()
    expect(vecindadesActivas(p, 'nox')).toEqual([])
    const junto = colocar(p, 'hoguera', 76, 58)
    expect(vecindadesActivas(junto, 'nox').map((v) => v.id)).toEqual(['nox-fogata'])
    expect(vecindadesActivas(junto, 'tuerca')).toEqual([])
  })

  it('un hallazgo solo aparece una vez y no duplica registros', () => {
    const p = colocar(base(), 'hoguera', 76, 58)
    expect(vecindadesNuevas(p, 'nox')).toHaveLength(1)
    const visto = recordarVecindades(p, ['nox-fogata', 'nox-fogata'])
    expect(visto.vecindadesVistas).toEqual(['nox-fogata'])
    expect(vecindadesNuevas(visto, 'nox')).toHaveLength(0)
    expect(recordarVecindades(visto, ['nox-fogata'])).toBe(visto)
  })

  it('el baúl y restaurar posiciones eliminan la vecindad activa sin borrar el recuerdo', () => {
    const junto = colocar(base(), 'hoguera', 76, 58)
    const visto = recordarVecindades(junto, ['nox-fogata'])
    expect(vecindadesActivas(guardar(visto, 'hoguera'), 'nox')).toHaveLength(0)
    expect(vecindadesActivas(ordenOriginal(visto, 'nox'), 'nox')).toHaveLength(0)
    expect(ordenOriginal(visto, 'nox').vecindadesVistas).toEqual(['nox-fogata'])
  })

  it('no descubre combinaciones si los objetos no están construidos', () => {
    const p = colocar({ ...base(), construcciones: [] }, 'hoguera', 76, 58)
    expect(vecindadesActivas(p, 'nox')).toHaveLength(0)
  })
  it('las cinco vecindades son alcanzables al colocar objetos en sus superficies reales', () => {
    for (const vecindad of VECINDADES) {
      const a = OBJETOS_CASA.find((o) => o.id === vecindad.a)!
      const b = OBJETOS_CASA.find((o) => o.id === vecindad.b)!
      const p = { ...base(), construcciones: [{ objetoId: a.id, fecha: '2026-11-20' }, { objetoId: b.id, fecha: '2026-11-20' }] }
      let posible = false
      for (let x = 15; x <= 85 && !posible; x += 5) {
        for (let y = 20; y <= 85 && !posible; y += 5) {
          const pa = encajar(a, x, y)
          const pb = encajar(b, x, y)
          const cerca = colocar(colocar(p, a.id, pa.x, pa.y), b.id, pb.x, pb.y)
          posible = vecindadesActivas(cerca, vecindad.companero).some((v) => v.id === vecindad.id)
        }
      }
      expect(posible, `Combinación inaccesible: ${vecindad.id}`).toBe(true)
    }
  })

})
