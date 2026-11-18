import { describe, expect, it } from 'vitest'
import { crecioSinVer, diasActivos, huevoDisponible, incubar, marcarEtapaVista, nacido, progreso } from './etapas'
import { construir } from './casa'
import { estadoDelMes, mesActual } from './meses'
import { crearPartida, type Partida } from './partida'
import { en } from './test-utils'
import { sumarDias } from './fechas'

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
    expect(nacido(p, 'nox', en('2026-01-08'))).toBe(true)
  })
  it('joven con 4 días de Cuerpo y un proyecto; varias el mismo día cuentan como un día', () => {
    let p = crearPartida('nox', en('2026-01-05', 8), undefined, true)
    p = conDias(p, 'cuerpo', '2026-01-05', 4, 3)
    const ahora = en('2026-01-09')
    expect(diasActivos(p, 'nox', ahora)).toBe(4)
    expect(progreso(p, 'nox', ahora).etapa).toBe(0) // falta el proyecto
    p = construir(p, 'hoguera', ahora)!
    expect(progreso(p, 'nox', ahora)).toMatchObject({ etapa: 1, siguiente: { dias: 12, proyectos: 3 } })
  })
  it('el siguiente huevo aparece al ser joven, y se incuba cuando quieras', () => {
    let p = crearPartida('nox', en('2026-01-05', 8), undefined, true)
    p = conDias(p, 'cuerpo', '2026-01-05', 4, 3)
    const ahora = en('2026-01-09')
    expect(huevoDisponible(p, ahora, ['nox', 'tuerca'])).toBeNull()
    p = construir(p, 'hoguera', ahora)!
    expect(huevoDisponible(p, ahora, ['nox', 'tuerca'])).toBe('tuerca')
    expect(huevoDisponible(p, ahora, ['nox'])).toBeNull() // nadie más tiene su arte
    p = incubar(p, 'tuerca', ahora)
    expect(mesActual(p).companero).toBe('tuerca')
    expect(estadoDelMes(p, ahora)).toBe('huevo')
    expect(huevoDisponible(p, ahora, ['nox', 'tuerca'])).toBeNull()
  })
  it('la celebración sale una vez por etapa', () => {
    let p = crearPartida('nox', en('2026-01-05', 8))
    expect(crecioSinVer(p, 'nox', 1)).toBe(true)
    p = marcarEtapaVista(p, 'nox', 1)
    expect(crecioSinVer(p, 'nox', 1)).toBe(false)
  })
})
