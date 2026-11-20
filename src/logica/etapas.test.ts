import { describe, expect, it } from 'vitest'
import { diasActivos, incubar, marcarNivelVisto, nacido, nacidos, nivelSinVer, proximaLlegada, progreso } from './etapas'
import { estadoDelMes, marcarPresentado, mesActual } from './meses'
import { crearPartida, type Partida } from './partida'
import { con, en } from './test-utils'
import { sumarDias } from './fechas'
import { hacerOfrenda } from './ofrendas'

/** Partida nueva con huevo (como el inicio real), con hazañas de un área en días distintos. */
function conDias(p: Partida, area: string, desde: string, dias: number, porDia = 1): Partida {
  const acciones = p.acciones.filter((a) => a.area === area)
  const nuevas = []
  for (let d = 0; d < dias; d++) for (let k = 0; k < porDia; k++)
    nuevas.push({ id: `${area}${d}-${k}`, accionId: acciones[k % acciones.length].id, area: area as never, fecha: en(sumarDias(desde, d), 9 + k).toISOString(), diaMalo: false })
  return { ...p, ofrendas: [...p.ofrendas, ...nuevas] }
}

describe('vecinos y crecimiento por hitos', () => {
  it('el huevo nace con 3 hazañas', () => {
    let p = crearPartida('nox', en('2026-01-05', 8), undefined, true)
    expect(estadoDelMes(p, en('2026-01-05', 20))).toBe('huevo')
    p = conDias(p, 'mente', '2026-01-05', 3)
    // Huevo listo no es estar en el barrio: cuenta desde que lo abres.
    expect(estadoDelMes(p, en('2026-01-08'))).toBe('naciendo')
    expect(nacido(p, 'nox', en('2026-01-08'))).toBe(false)
    p = marcarPresentado(p, en('2026-01-08'))
    expect(nacido(p, 'nox', en('2026-01-08'))).toBe(true)
  })
  it('sube de nivel por días distintos de su área, sin depender de las construcciones', () => {
    let p = crearPartida('nox', en('2026-01-05', 8), undefined, true)
    p = marcarPresentado(conDias(p, 'cuerpo', '2026-01-05', 4, 3), en('2026-01-05', 12))
    const ahora = en('2026-01-09')
    expect(diasActivos(p, 'nox', ahora)).toBe(4)
    expect(progreso(p, 'nox', ahora)).toMatchObject({ nivel: 2, etapa: 1, siguiente: { nivel: 3, dias: 10 } })
  })
  it('la llegada cuenta días distintos de cualquier área, después de presentar al vecino', () => {
    let p = crearPartida('nox', en('2026-01-05', 8), ['leer', 'aire'], true)
    p = con(p, 'mente', '2026-01-05', 3)
    expect(proximaLlegada(p, en('2026-01-05', 20))).toBeNull()
    p = marcarPresentado(p, en('2026-01-05', 12))
    p = con(p, 'calma', '2026-01-05', 3, 15)
    expect(proximaLlegada(p, en('2026-01-05', 20))).toEqual({ vecino: 'tuerca', faltanDias: 2 })
    p = con(p, 'mente', '2026-01-06', 3)
    p = con(p, 'mente', '2026-01-10')
    expect(proximaLlegada(p, en('2026-01-09'))?.faltanDias).toBe(1)
    expect(incubar(p, 'tuerca', en('2026-01-09'))).toBe(p)
    const ahora = en('2026-01-10', 20)
    expect(proximaLlegada(p, ahora, ['nox'])).toBeNull()
    expect(incubar(p, 'tofu', ahora)).toBe(p)
    p = incubar(p, 'tuerca', ahora)
    expect(mesActual(p).companero).toBe('tuerca')
    expect(estadoDelMes(p, ahora)).toBe('naciendo')
    expect(nacido(p, 'tuerca', ahora)).toBe(false)
    expect(incubar(p, 'tuerca', ahora)).toBe(p)
  })
  it('conoce al quinto vecino el noveno día jugando en una sola área y sin construir', () => {
    let p = crearPartida('nox', en('2026-01-05', 8), ['leer'], true)
    p = marcarPresentado(con(p, 'mente', '2026-01-05', 3), en('2026-01-05', 12))
    const presentaciones: string[] = []
    for (let i = 1; i <= 8; i++) {
      const ahora = en(sumarDias('2026-01-05', i))
      p = hacerOfrenda(p, 'leer', ahora, () => 0.99, `leer-${i}`).partida
      const llegada = proximaLlegada(p, ahora)
      if (llegada?.faltanDias === 0) {
        p = marcarPresentado(incubar(p, llegada.vecino, ahora), ahora)
        presentaciones.push(`${llegada.vecino}:${i + 1}`)
      }
    }
    expect(presentaciones).toEqual(['tuerca:3', 'tofu:5', 'bruma:7', 'madeja:9'])
    expect(nacidos(p, en('2026-01-13'))).toHaveLength(5)
    expect(p.construcciones).toEqual([])
    expect(progreso(p, 'nox', en('2026-01-13')).etapa).toBe(0)
    expect(proximaLlegada(p, en('2026-01-13'))).toBeNull()
  })
  it('cada nivel tiene su umbral y los días sin reto no interrumpen el progreso', () => {
    let p = crearPartida('nox', en('2026-01-05', 8), ['pasos', 'leer'], true)
    p = marcarPresentado(p, en('2026-01-05', 8))
    const largos = Array.from({ length: 35 }, (_, n) => sumarDias('2026-01-05', n * 2))
    for (const d of largos) p = con(p, 'cuerpo', d)
    p = con(p, 'mente', '2026-01-06', 3)
    for (const [dia, nivel] of [[3, 1], [4, 2], [10, 3], [21, 4], [35, 5]]) {
      expect(progreso(p, 'nox', en(largos[dia - 1])).nivel).toBe(nivel)
    }
    expect(progreso(p, 'nox', en(largos[34])).siguiente).toBeNull()
  })
  it('los días de Vínculos y Orden se acumulan a ritmos distintos de Energía', () => {
    let p = crearPartida('madeja', en('2026-01-05', 8), ['preguntar', 'planificar', 'pasos'], true)
    p = { ...p, meses: [...p.meses!, { companero: 'tuerca', inicio: p.inicio, presentado: p.inicio },
      { companero: 'nox', inicio: p.inicio, presentado: p.inicio }] }
    p = conDias(conDias(conDias(p, 'vinculos', '2026-01-05', 12), 'orden', '2026-01-05', 8), 'cuerpo', '2026-01-05', 12)
    expect(progreso(p, 'madeja', en('2026-01-15'))).toMatchObject({ nivel: 4, siguiente: { nivel: 5, dias: 12 } })
    expect(progreso(p, 'madeja', en('2026-01-16')).nivel).toBe(5)
    expect(progreso(p, 'tuerca', en('2026-01-12')).nivel).toBe(5)
    expect(progreso(p, 'nox', en('2026-01-16')).nivel).toBe(3)
  })

  it('la celebración aparece una vez y el nivel visto se conserva', () => {
    let p = crearPartida('nox', en('2026-01-05', 8))
    expect(nivelSinVer(p, 'nox', 4)).toBe(true)
    p = marcarNivelVisto(p, 'nox', 4)
    expect(nivelSinVer(p, 'nox', 4)).toBe(false)
    expect(marcarNivelVisto(p, 'nox', 3)).toBe(p)
    expect(progreso(p, 'nox', en('2026-01-05')).nivel).toBe(4)
  })
})
