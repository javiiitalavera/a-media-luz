import { describe, expect, it } from 'vitest'
import { diaDeLlegada, estadoRincon } from './reglas'
import { con, en, nueva } from './test-utils'

// 2026-01-05 es lunes. Nox (Cuerpo, ritmo diario = margen 1) es el principal.
describe('llegada de compañeros', () => {
  it('el principal está desde el inicio; los demás llegan con 3 ofrendas de su área', () => {
    let p = nueva()
    expect(diaDeLlegada(p, 'cuerpo', en('2026-01-05'))).toBe('2026-01-05')
    expect(estadoRincon(p, 'mente', en('2026-01-05')).faltanParaLlegar).toBe(3)
    p = con(p, 'mente', '2026-01-06', 2)
    expect(estadoRincon(p, 'mente', en('2026-01-06', 20)).llegado).toBe(false)
    p = con(p, 'mente', '2026-01-08')
    expect(diaDeLlegada(p, 'mente', en('2026-01-08', 20))).toBe('2026-01-08')
  })
  it('un rincón sin compañero no sufre consecuencias', () => {
    expect(estadoRincon(nueva(), 'mente', en('2026-02-20')).fase).toBe(0)
  })
})

describe('crecimiento y tope diario', () => {
  it('solo cuentan las 3 primeras ofrendas del día', () => {
    const p = con(nueva(), 'cuerpo', '2026-01-05', 5)
    const e = estadoRincon(p, 'cuerpo', en('2026-01-05', 20))
    expect(e.crecimiento).toBe(3)
    expect(e.hoy).toBe(5)
  })
  it('grados a las 5, 15 y 35 ofrendas que cuentan', () => {
    let p = nueva()
    for (let d = 5; d <= 9; d++) p = con(p, 'cuerpo', `2026-01-0${d}`)
    expect(estadoRincon(p, 'cuerpo', en('2026-01-09', 20)).grado).toBe(1)
    for (let d = 10; d <= 13; d++) p = con(p, 'cuerpo', `2026-01-${d}`, 3)
    expect(estadoRincon(p, 'cuerpo', en('2026-01-13', 20)).crecimiento).toBe(17)
    expect(estadoRincon(p, 'cuerpo', en('2026-01-13', 20)).grado).toBe(2)
  })
})

describe('consecuencias por fases (Cuerpo: margen 1 día)', () => {
  // Sin ofrendas desde el inicio (lunes 5): al acabar el miércoles 7 van 2 días > 1 → fase 1 el jueves.
  it('asilvestrado, enfurruñado y visitante según los días sin ofrendas', () => {
    const p = nueva()
    expect(estadoRincon(p, 'cuerpo', en('2026-01-07')).fase).toBe(0)
    expect(estadoRincon(p, 'cuerpo', en('2026-01-08')).fase).toBe(1)
    expect(estadoRincon(p, 'cuerpo', en('2026-01-09')).fase).toBe(2)
    expect(estadoRincon(p, 'cuerpo', en('2026-01-10')).fase).toBe(3)
    expect(estadoRincon(p, 'cuerpo', en('2026-01-10')).visitante).toBe(true)
  })
  it('el día de hoy no estropea hasta que acaba', () => {
    const p = con(nueva(), 'cuerpo', '2026-01-05')
    expect(estadoRincon(p, 'cuerpo', en('2026-01-07', 23)).fase).toBe(0)
    expect(estadoRincon(p, 'cuerpo', en('2026-01-08', 1)).fase).toBe(1)
  })
  it('estropeado no crece; 2 ofrendas lo arreglan', () => {
    let p = con(nueva(), 'cuerpo', '2026-01-08') // fase 1 al empezar el día 8
    let e = estadoRincon(p, 'cuerpo', en('2026-01-08', 20))
    expect(e.fase).toBe(1)
    expect(e.faltanParaArreglar).toBe(1)
    expect(e.crecimiento).toBe(0)
    p = con(p, 'cuerpo', '2026-01-08', 1, 15)
    e = estadoRincon(p, 'cuerpo', en('2026-01-08', 20))
    expect(e.fase).toBe(0)
    p = con(p, 'cuerpo', '2026-01-08', 1, 18)
    expect(estadoRincon(p, 'cuerpo', en('2026-01-08', 20)).crecimiento).toBe(1)
  })
  it('el arreglo también vale en días distintos', () => {
    let p = con(nueva(), 'cuerpo', '2026-01-08') // 1 de 2
    p = con(p, 'cuerpo', '2026-01-09')
    expect(estadoRincon(p, 'cuerpo', en('2026-01-09', 20)).fase).toBe(0)
  })
  it('un ritmo más largo aguanta más (Orden, semanal)', () => {
    const p = { ...nueva('tuerca'), ritmos: { ...nueva().ritmos } }
    expect(estadoRincon(p, 'orden', en('2026-01-13')).fase).toBe(0)
    expect(estadoRincon(p, 'orden', en('2026-01-14')).fase).toBe(1)
  })
})
