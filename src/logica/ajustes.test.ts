import { describe, expect, it } from 'vitest'
import { cambiarRitmo } from './ajustes'
import { estadoRincon } from './reglas'
import { en, nueva } from './test-utils'

describe('ajustes', () => {
  it('cambiar el ritmo cambia cuándo se estropea', () => {
    const p = nueva()
    expect(estadoRincon(p, 'cuerpo', en('2026-01-08')).fase).toBe(1)
    expect(estadoRincon(cambiarRitmo(p, 'cuerpo', 'semanal'), 'cuerpo', en('2026-01-08')).fase).toBe(0)
  })
})
