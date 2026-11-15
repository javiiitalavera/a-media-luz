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
