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
  it('reconoce catorce juguetes construibles, repartidos entre las cinco casas', () => {
    const ids = ['hoguera', 'comba', 'bici', 'maquina', 'balanza', 'maceta', 'gramofono', 'telescopio', 'globo', 'cometa', 'loto', 'telefono', 'cesto', 'buzon']
    expect(ids).toHaveLength(14)
    for (const id of ids) expect(esJuguete(id)).toBe(true)
    expect(esJuguete('banco')).toBe(false)
    expect(new Set(ids.map((id) => OBJETOS_CASA.find((o) => o.id === id)!.companero)).size).toBe(5)
    for (const id of ids) expect(OBJETOS_CASA.some((o) => o.id === id)).toBe(true)
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
  it('las quince vecindades son alcanzables al colocar objetos en sus superficies reales', () => {
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

  it('hay tres combinaciones por vecino, todas con piezas propias, efectos y parejas distintas', () => {
    expect(VECINDADES).toHaveLength(15)
    for (const c of ['nox', 'tuerca', 'tofu', 'bruma', 'madeja'] as const) {
      expect(VECINDADES.filter((v) => v.companero === c)).toHaveLength(3)
    }
    const parejas = new Set<string>()
    for (const v of VECINDADES) {
      expect(v.efecto.length).toBeGreaterThan(1)
      expect(OBJETOS_CASA.find((o) => o.id === v.a)?.companero).toBe(v.companero)
      expect(OBJETOS_CASA.find((o) => o.id === v.b)?.companero).toBe(v.companero)
      expect(v.a).not.toBe(v.b)
      const clave = [v.a, v.b].sort().join('/')
      expect(parejas.has(clave)).toBe(false)
      parejas.add(clave)
    }
  })

  it('una combinación de otra casa, un mueble guardado o una pieza no construida no genera efectos', () => {
    const par = VECINDADES.find((v) => v.id === 'madeja-lana')!
    const p = { ...base(), construcciones: [{ objetoId: par.a, fecha: '2026-11-20' }, { objetoId: par.b, fecha: '2026-11-20' }] }
    const junto = colocar(colocar(p, par.a, 65, 70), par.b, 65, 70)
    expect(vecindadesActivas(junto, 'nox')).toHaveLength(0)
    expect(vecindadesActivas(guardar(junto, par.a), 'madeja')).toHaveLength(0)
    expect(vecindadesActivas({ ...junto, construcciones: [] }, 'madeja')).toHaveLength(0)
  })

  it('no da por descubiertas otras vecindades que aún no ha mostrado', () => {
    const p = {
      ...base(),
      construcciones: [
        ...base().construcciones,
        { objetoId: 'bici', fecha: '2026-11-20' },
        { objetoId: 'zapatillas', fecha: '2026-11-20' },
      ],
    }
    // Las dos parejas están físicamente cercanas y sin superponerse por completo.
    const dos = colocar(colocar(p, 'hoguera', 76, 58), 'zapatillas', 79, 77)
    expect(vecindadesNuevas(dos, 'nox').map((v) => v.id)).toEqual(['nox-fogata', 'nox-velocidad'])
    const contado = recordarVecindades(dos, [vecindadesNuevas(dos, 'nox')[0].id])
    expect(contado.vecindadesVistas).toEqual(['nox-fogata'])
    expect(vecindadesNuevas(contado, 'nox').map((v) => v.id)).toEqual(['nox-velocidad'])
    const visitaPosterior = recordarVecindades(contado, [vecindadesNuevas(contado, 'nox')[0].id])
    expect(vecindadesNuevas(visitaPosterior, 'nox')).toHaveLength(0)
  })

})
