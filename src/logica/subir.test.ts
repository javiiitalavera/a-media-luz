import { describe, expect, it } from 'vitest'
import { crearPartida, type Partida } from './partida'
import { marcarPresentado } from './meses'
import { aceptarMeta, metaSubida, propuestaDeMeta, rechazarMeta } from './subir'
import { en } from './test-utils'
import { sumarDias } from './fechas'

/** Nox presentado y diez días seguidos andando y durmiendo. */
function conCostumbre(dias = 10): Partida {
  let p = crearPartida('nox', en('2026-01-01', 8), ['pasos', 'dormir', 'amigo'], true)
  p = marcarPresentado(p, en('2026-01-01', 9))
  const ofrendas = Array.from({ length: dias }, (_, i) => sumarDias('2026-01-02', i)).flatMap((d, i) =>
    ['pasos', 'dormir', 'amigo'].map((id) => ({ id: `${id}${i}`, accionId: id, area: p.acciones.find((a) => a.id === id)!.area, fecha: en(d, 10).toISOString(), diaMalo: false })))
  return { ...p, ofrendas }
}

describe('subir la meta', () => {
  it('sube un escalón según la unidad, y no toca lo que no tiene número o no conviene subir', () => {
    expect(metaSubida('Andar 8000 pasos')).toBe('Andar 9000 pasos')
    expect(metaSubida('Andar 4.000 pasos')).toBe('Andar 5.000 pasos')
    expect(metaSubida('Leer 15 páginas')).toBe('Leer 20 páginas')
    expect(metaSubida('Trabajar 25 minutos sin distracciones')).toBe('Trabajar 30 minutos sin distracciones')
    expect(metaSubida('Nadar 20 minutos')).toBe('Nadar 25 minutos')
    expect(metaSubida('10 sentadillas')).toBe('13 sentadillas')
    expect(metaSubida('Dormir 7 horas')).toBeNull()
    expect(metaSubida('Beber 2 litros de agua')).toBeNull()
    expect(metaSubida('Llamar a un amigo')).toBeNull()
  })

  it('a los 10 días cumplido lo propone el vecino de su área; antes, no', () => {
    expect(propuestaDeMeta(conCostumbre(9), en('2026-01-11', 20))).toBeNull()
    const pr = propuestaDeMeta(conCostumbre(10), en('2026-01-11', 20))!
    expect(pr).toMatchObject({ vecino: 'nox', nueva: 'Andar 9000 pasos' })
    expect(pr.reto.id).toBe('pasos')
  })

  it('al subirla cuenta de nuevo desde hoy y la mínima no cambia; una propuesta al día', () => {
    const p = conCostumbre(10)
    const minima = p.acciones.find((a) => a.id === 'pasos')!.minima
    const q = aceptarMeta(p, 'pasos', 'Andar 9000 pasos', en('2026-01-11', 20))
    expect(q.acciones.find((a) => a.id === 'pasos')).toMatchObject({ nombre: 'Andar 9000 pasos', minima })
    expect(propuestaDeMeta(q, en('2026-01-11', 21))).toBeNull()
    expect(propuestaDeMeta(q, en('2026-01-12', 9))).toBeNull()
  })

  it('si dices que no, no vuelve a proponerlo en 14 días', () => {
    const p = rechazarMeta(conCostumbre(10), 'pasos', en('2026-01-11', 20))
    expect(propuestaDeMeta(p, en('2026-01-20', 9))).toBeNull()
    expect(propuestaDeMeta(p, en('2026-01-25', 9))?.reto.id).toBe('pasos')
  })
})
