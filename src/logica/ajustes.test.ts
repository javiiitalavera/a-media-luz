import { describe, expect, it } from 'vitest'
import { cambiarRitmo, tocaCopia } from './ajustes'
import { estadoRincon } from './reglas'
import { en, nueva } from './test-utils'

describe('ajustes', () => {
  it('cambiar el ritmo cambia cuándo se estropea', () => {
    const p = nueva()
    expect(estadoRincon(p, 'cuerpo', en('2026-01-08')).fase).toBe(1)
    expect(estadoRincon(cambiarRitmo(p, 'cuerpo', 'semanal'), 'cuerpo', en('2026-01-08')).fase).toBe(0)
  })

  it('Ajustes avisa de hacer copia si la partida tiene más de dos semanas y la última copia es vieja o no hay', () => {
    const ahora = en('2026-02-01')
    expect(tocaCopia(en('2026-01-25').toISOString(), undefined, ahora)).toBe(false)
    expect(tocaCopia(en('2026-01-05').toISOString(), undefined, ahora)).toBe(true)
    expect(tocaCopia(en('2026-01-05').toISOString(), en('2026-01-28').toISOString(), ahora)).toBe(false)
    expect(tocaCopia(en('2026-01-05').toISOString(), en('2026-01-10').toISOString(), ahora)).toBe(true)
  })
})
