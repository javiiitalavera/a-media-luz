import { describe, expect, it } from 'vitest'
import { capasDe, expresionDe, transicionesDe } from './capas'
import type { EstadoRincon } from '../logica/reglas'

const base: EstadoRincon = {
  area: 'cuerpo', llegado: true, faltanParaLlegar: 0, fase: 0, visitante: false, robado: null,
  faltanParaArreglar: 0, crecimiento: 0, grado: 0, hoy: 0, diasDeMargen: 1,
}

describe('capas de un rincón', () => {
  it('sano y sin crecer: solo el fondo', () => {
    expect(capasDe(base)).toEqual(['rincon/cuerpo/fondo'])
  })
  it('una sola capa de crecimiento, la del grado actual', () => {
    expect(capasDe({ ...base, grado: 2 })).toEqual(['rincon/cuerpo/fondo', 'rincon/cuerpo/crecimiento-2'])
  })
  it('deterioro: maleza desde la fase 1 y visitante en la 3, encima del crecimiento', () => {
    expect(capasDe({ ...base, grado: 1, fase: 3, visitante: true })).toEqual([
      'rincon/cuerpo/fondo', 'rincon/cuerpo/crecimiento-1', 'rincon/cuerpo/maleza', 'rincon/cuerpo/visitante',
    ])
  })
  it('expresión del compañero', () => {
    expect(expresionDe({ ...base, llegado: false })).toBe('dormido')
    expect(expresionDe(base)).toBe('base')
    expect(expresionDe({ ...base, hoy: 1 })).toBe('contento')
    expect(expresionDe({ ...base, hoy: 1, fase: 2 })).toBe('enfurrunado')
  })
})

describe('sendero del bosque', () => {
  it('una transición entre cada par de rincones seguidos', () => {
    expect(transicionesDe(['cuerpo', 'mente', 'calma'])).toEqual(['sendero/cuerpo-mente', 'sendero/mente-calma'])
  })
})
