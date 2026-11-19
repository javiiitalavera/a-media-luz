import { describe, expect, it } from 'vitest'
import { desplazarPartida } from './desplazar'
import { crearPartida } from './partida'
import { en } from './test-utils'

describe('volver a hoy en el modo de prueba', () => {
  it('mueve todas las fechas (horas y días) y deja los textos como están', () => {
    const p = { ...crearPartida('nox', en('2026-01-10', 9), undefined, true), diaMalo: '2026-01-10',
      situaciones: { normativa: { fase: 1, dia: '2026-01-11' } }, noticias: [{ texto: 'Pasó el 2026-01-11, o eso dicen', lugar: 'nox' as const, fecha: en('2026-01-11', 10).toISOString() }] }
    const q = desplazarPartida(p, -3)
    expect(q.inicio).toBe(en('2026-01-07', 9).toISOString())
    expect(q.meses![0].inicio).toBe(en('2026-01-07', 9).toISOString())
    expect(q.diaMalo).toBe('2026-01-07')
    expect(q.situaciones!.normativa.dia).toBe('2026-01-08')
    expect(q.noticias![0].texto).toBe('Pasó el 2026-01-11, o eso dicen')
    expect(desplazarPartida(p, 0)).toBe(p)
  })
  it('conserva los nombres de retos que parecen fechas', () => {
    const p = crearPartida('nox', en('2026-01-10', 9))
    p.acciones[0].nombre = '2026-01-10'
    p.acciones[0].minima = '2026-01-10T09:00:00.000Z'
    expect(desplazarPartida(p, -3).acciones).toEqual(p.acciones)
  })
  it('mueve también lo visto en cada parte del Álbum', () => {
    const p = { ...crearPartida('nox', en('2026-01-10', 9)), vistos: { albumSec: { cronicas: en('2026-01-10', 12).toISOString() } } }
    expect(desplazarPartida(p, -3).vistos!.albumSec!.cronicas).toBe(en('2026-01-07', 12).toISOString())
  })
})
