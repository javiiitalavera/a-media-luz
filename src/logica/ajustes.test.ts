import { describe, expect, it } from 'vitest'
import { borrarAccion, cambiarRitmo, crearAccion } from './ajustes'
import { hacerOfrenda } from './ofrendas'
import { estadoRincon } from './reglas'
import { azarFijo, en, nueva } from './test-utils'

describe('ajustes', () => {
  it('acción propia: se crea, cuenta como cualquier ofrenda y se puede borrar', () => {
    let p = crearAccion(nueva(), 'cuerpo', '  Nadar ', '', 'x')
    expect(p.acciones.at(-1)).toEqual({ id: 'propia-x', area: 'cuerpo', nombre: 'Nadar', minima: 'Nadar' })
    expect(crearAccion(p, 'cuerpo', '   ', '', 'y')).toBe(p)
    p = hacerOfrenda(p, 'propia-x', en('2026-01-05'), azarFijo(0, 0.99), 'o1').partida
    expect(estadoRincon(p, 'cuerpo', en('2026-01-05', 20)).crecimiento).toBe(1)
    p = borrarAccion(p, 'propia-x')
    expect(p.acciones.some((a) => a.id === 'propia-x')).toBe(false)
    expect(p.ofrendas).toHaveLength(1)
  })
  it('cambiar el ritmo cambia cuándo se estropea', () => {
    const p = nueva()
    expect(estadoRincon(p, 'cuerpo', en('2026-01-08')).fase).toBe(1)
    expect(estadoRincon(cambiarRitmo(p, 'cuerpo', 'semanal'), 'cuerpo', en('2026-01-08')).fase).toBe(0)
  })
})

import { editarAccion } from './ajustes'
import { crearPartida } from './partida'

describe('editar acciones e inicio', () => {
  it('editar nombre y mínima; vacío no se guarda', () => {
    let p = editarAccion(nueva(), 'andar', { nombre: ' Andar al trabajo ', minima: 'Bajar una parada antes' })
    expect(p.acciones.find((a) => a.id === 'andar')).toMatchObject({ nombre: 'Andar al trabajo', minima: 'Bajar una parada antes' })
    p = editarAccion(p, 'andar', { nombre: '   ' })
    expect(p.acciones.find((a) => a.id === 'andar')!.nombre).toBe('Andar al trabajo')
  })
  it('acciones habituales del inicio; las áreas sin elegir reciben dos de ejemplo', () => {
    const p = crearPartida('nox', en('2026-01-05'), ['andar', 'agua', 'leer'])
    expect(p.acciones.filter((a) => a.area === 'cuerpo').map((a) => a.id)).toEqual(['andar', 'agua'])
    expect(p.acciones.filter((a) => a.area === 'mente').map((a) => a.id)).toEqual(['leer'])
    expect(p.acciones.filter((a) => a.area === 'orden')).toHaveLength(2)
  })
})
