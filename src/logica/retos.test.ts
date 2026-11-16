import { describe, expect, it } from 'vitest'
import { elegirRetos, premiosGanados, progresoRetos, retosValidos, usarComodin, NIVELES } from './retos'
import { construir } from './casa'
import { disponibles } from './casa'
import { mesActual } from './meses'
import { con, en, nueva } from './test-utils'
import type { Partida } from './partida'

const conAcciones = (): Partida => nueva('nox')
const id = (p: Partida, area: string, n = 0) => p.acciones.filter((a) => a.area === area)[n].id

describe('retos del mes', () => {
  it('el primero tiene que ser del área del compañero, sin repetir y con un número de veces válido', () => {
    const p = conAcciones()
    const m = mesActual(p)
    const bien = [{ accionId: id(p, 'cuerpo'), veces: 12 }, { accionId: id(p, 'mente'), veces: 8 }, { accionId: id(p, 'orden'), veces: 20 }]
    expect(retosValidos(p, m, bien)).toBe(true)
    expect(retosValidos(p, m, [bien[1], bien[0], bien[2]])).toBe(false) // el primero no es de Cuerpo
    expect(retosValidos(p, m, [bien[0], bien[0], bien[2]])).toBe(false) // repetido
    expect(retosValidos(p, m, [bien[0], { ...bien[1], veces: 7 }, bien[2]])).toBe(false)
    expect(retosValidos(p, m, bien.slice(0, 2))).toBe(false)
  })

  it('se eligen una vez y quedan fijos; el comodín cambia uno, una sola vez', () => {
    let p = conAcciones()
    const retos = [{ accionId: id(p, 'cuerpo'), veces: 12 }, { accionId: id(p, 'mente'), veces: 8 }, { accionId: id(p, 'orden'), veces: 8 }]
    p = elegirRetos(p, retos)!
    expect(mesActual(p).retos).toEqual(retos)
    expect(elegirRetos(p, retos)).toBeNull()
    const nuevo = { accionId: id(p, 'calma'), veces: NIVELES.suave }
    p = usarComodin(p, 2, nuevo)!
    expect(mesActual(p).retos![2]).toEqual(nuevo)
    expect(usarComodin(p, 1, { accionId: id(p, 'vinculos'), veces: 8 })).toBeNull()
  })

  it('cuenta las veces del mes (con el tope diario) y dice si está cumplido', () => {
    let p = conAcciones()
    const andar = id(p, 'cuerpo')
    p = elegirRetos(p, [{ accionId: andar, veces: 8 }, { accionId: id(p, 'mente'), veces: 8 }, { accionId: id(p, 'orden'), veces: 8 }])!
    for (let d = 5; d < 12; d++) p = con(p, 'cuerpo', `2026-01-${String(d).padStart(2, '0')}`, 1)
    p = con(p, 'cuerpo', '2026-01-12', 5) // de 5, cuentan 3
    const [r] = progresoRetos(p, mesActual(p), en('2026-01-12', 23))
    expect(r).toMatchObject({ hechas: 10, cumplido: true })
  })

  it('las hazañas de un reto dan doble material', () => {
    let p = conAcciones()
    p = elegirRetos(p, [{ accionId: id(p, 'cuerpo'), veces: 8 }, { accionId: id(p, 'mente'), veces: 8 }, { accionId: id(p, 'orden'), veces: 8 }])!
    p = con(p, 'cuerpo', '2026-01-05', 2) // con(...) usa la primera acción del área: es reto
    p = con(p, 'calma', '2026-01-05', 1) // no es reto
    const m = disponibles(p, 'nox', en('2026-01-05', 23))
    expect([m.cuerpo, m.calma]).toEqual([4, 1])
  })
  it('cada reto cumplido da su premio, que no se puede construir con materiales', () => {
    let p = conAcciones()
    p = elegirRetos(p, [{ accionId: id(p, 'cuerpo'), veces: 8 }, { accionId: id(p, 'mente'), veces: 8 }, { accionId: id(p, 'orden'), veces: 8 }])!
    for (let d = 5; d < 13; d++) p = con(p, 'cuerpo', `2026-01-${String(d).padStart(2, '0')}`, 1)
    const ahora = en('2026-01-12', 23)
    expect(premiosGanados(p, 'nox', ahora).map((o) => o.id)).toEqual(['zapatillas'])
    expect(construir(p, 'bufanda', ahora)).toBeNull()
  })
})
