import { describe, expect, it } from 'vitest'
import { crecioSinVer, diasActivos, incubar, marcarEtapaVista, nacido, nacidos, proximaLlegada, progreso } from './etapas'
import { construir } from './casa'
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
  it('joven con 4 días de Cuerpo y un proyecto; varias el mismo día cuentan como un día', () => {
    let p = crearPartida('nox', en('2026-01-05', 8), undefined, true)
    p = marcarPresentado(conDias(p, 'cuerpo', '2026-01-05', 4, 3), en('2026-01-05', 12))
    const ahora = en('2026-01-09')
    expect(diasActivos(p, 'nox', ahora)).toBe(4)
    expect(progreso(p, 'nox', ahora).etapa).toBe(0) // falta el proyecto
    p = construir(p, 'hoguera', ahora)!
    expect(progreso(p, 'nox', ahora)).toMatchObject({ etapa: 1, siguiente: { dias: 12, proyectos: 3 } })
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
  it('la celebración sale una vez por etapa', () => {
    let p = crearPartida('nox', en('2026-01-05', 8))
    expect(crecioSinVer(p, 'nox', 1)).toBe(true)
    p = marcarEtapaVista(p, 'nox', 1)
    expect(crecioSinVer(p, 'nox', 1)).toBe(false)
  })
})
