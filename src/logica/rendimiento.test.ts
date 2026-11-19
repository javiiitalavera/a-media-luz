import { describe, expect, it } from 'vitest'
import { estadoBosque } from './reglas'
import { nueva, en } from './test-utils'
import { sumarDias } from './fechas'
import type { Partida } from './partida'

describe('rendimiento', () => {
  it('el bosque de una partida de 2 años se calcula rápido', () => {
    const p: Partida = nueva('nox', '2025-01-06')
    const areas = ['cuerpo', 'mente', 'calma', 'vinculos', 'orden'] as const
    let n = 0
    for (let i = 0; i < 730; i++) {
      const d = sumarDias('2025-01-06', i)
      for (const a of areas) if ((i + a.length) % 3 !== 0) {
        const accionId = p.acciones.find((x) => x.area === a)!.id
        p.ofrendas.push({ id: `r${n++}`, accionId, area: a, fecha: en(d, 9 + (n % 10)).toISOString(), diaMalo: false })
      }
    }
    const ahora = en('2027-01-05', 20)
    // Una pasada de calentamiento y la mejor de tres: así no falla por una máquina ocupada en ese momento.
    estadoBosque(p, ahora)
    let ms = Infinity
    let e = estadoBosque(p, ahora)
    for (let i = 0; i < 3; i++) {
      const t0 = performance.now()
      e = estadoBosque({ ...p }, ahora)
      ms = Math.min(ms, performance.now() - t0)
    }
    console.log(`  ${p.ofrendas.length} ofrendas, 2 años → ${ms.toFixed(0)} ms`)
    expect(e).toHaveLength(5)
    expect(ms).toBeLessThan(200)
  })
})
