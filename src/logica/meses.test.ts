import { describe, expect, it } from 'vitest'
import { diaDelMes, eclosion, empezarMesSiguiente, finDe, informe, mesActual, mesesDe, siguienteCompanero } from './meses'
import { construir, disponibles } from './casa'
import { progreso } from './etapas'
import { azarFijo, con, en, nueva } from './test-utils'
import type { Partida } from './partida'

describe('un compañero al mes', () => {
  it('las partidas sin meses tienen uno implícito con su principal, de 28 días', () => {
    const p = nueva('nox', '2026-01-05')
    expect(mesesDe(p)).toHaveLength(1)
    expect(mesActual(p).companero).toBe('nox')
    expect(finDe(mesActual(p))).toEqual(en('2026-02-02', 0))
    expect(diaDelMes(mesActual(p), en('2026-01-05', 20))).toEqual({ dia: 1, terminado: false })
    expect(diaDelMes(mesActual(p), en('2026-02-01', 23))).toEqual({ dia: 28, terminado: false })
    expect(diaDelMes(mesActual(p), en('2026-02-02', 0)).terminado).toBe(true)
  })

  it('el huevo eclosiona con la tercera ofrenda del mes, de cualquier área', () => {
    let p = con(con(nueva(), 'mente', '2026-01-05', 2), 'calma', '2026-01-05', 0)
    expect(eclosion(p, mesActual(p), en('2026-01-05', 20))).toBeNull()
    p = con(p, 'orden', '2026-01-06')
    expect(eclosion(p, mesActual(p), en('2026-01-06', 20))).not.toBeNull()
  })

  it('el mes siguiente empieza de cero: los materiales son de cada casa', () => {
    let p = con(nueva(), 'cuerpo', '2026-01-05', 3)
    expect(disponibles(p, 'nox', en('2026-01-05', 20)).cuerpo).toBe(3)
    p = empezarMesSiguiente(p, en('2026-02-02', 9), azarFijo(0))
    const otro = mesActual(p).companero
    expect(otro).not.toBe('nox')
    p = con(p, 'cuerpo', '2026-02-03', 2)
    const ahora = en('2026-02-03', 20)
    expect(disponibles(p, otro, ahora).cuerpo).toBe(2)
    // lo que sobró de Nox se queda en su casa, y se puede gastar allí al visitarlo
    expect(disponibles(p, 'nox', ahora).cuerpo).toBe(3)
    expect(construir(p, 'hoguera', ahora)).not.toBeNull()
  })

  it('crece solo con su área y durante su mes', () => {
    let p: Partida = nueva()
    for (let d = 5; d < 13; d++) p = con(p, 'cuerpo', `2026-01-${String(d).padStart(2, '0')}`, 2)
    expect(progreso(p, 'nox', en('2026-01-12', 20)).etapa).toBe(1)
    p = empezarMesSiguiente(p, en('2026-02-02', 9), azarFijo(0))
    for (let d = 3; d < 20; d++) p = con(p, 'cuerpo', `2026-02-${String(d).padStart(2, '0')}`, 3)
    // fuera de su mes ya no crece: se queda como estaba
    expect(progreso(p, 'nox', en('2026-02-20', 20)).crecimiento).toBe(16)
  })

  it('no repite compañero hasta que han salido todos', () => {
    let p = nueva('nox')
    const vistos = new Set(['nox'])
    for (let i = 0; i < 4; i++) {
      p = empezarMesSiguiente(p, en('2026-02-02', 9 + i), azarFijo(0.99))
      vistos.add(mesActual(p).companero)
    }
    expect(vistos.size).toBe(5)
    expect(siguienteCompanero(p, azarFijo(0))).toBeDefined()
  })

  it('mientras no llega el huevo siguiente, el mes sigue abierto: no se pierde nada', () => {
    const p = con(nueva(), 'cuerpo', '2026-02-10', 2) // pasados los 28 días
    expect(disponibles(p, 'nox', en('2026-02-10', 20)).cuerpo).toBe(2)
  })

  it('informe del mes', () => {
    let p = con(con(nueva(), 'cuerpo', '2026-01-05', 2), 'mente', '2026-01-07')
    p = con(p, 'cuerpo', '2026-02-05') // fuera del mes: no cuenta
    const i = informe(p, mesActual(p), en('2026-02-10', 20))
    expect(i).toMatchObject({ dias: 28, diasConAlgo: 2, total: 3 })
    expect(i.porArea.cuerpo).toBe(2)
  })
})
