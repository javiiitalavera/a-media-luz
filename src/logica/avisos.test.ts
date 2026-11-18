import { describe, expect, it } from 'vitest'
import { avisoEnCasa, hayHazanasNuevas, huellaNueva, leerNoticias, microSinVer, noticiasSinLeer, verHazanas, verHuella, verMicro, visitarLugar } from './avisos'
import { crearPartida, type Partida } from './partida'
import { avanzar } from './situaciones'
import { en } from './test-utils'

function barrio(construido: string[]): Partida {
  let p = crearPartida('nox', en('2026-01-05', 8), undefined, true)
  p = { ...p, meses: [...p.meses!, { companero: 'tuerca', inicio: en('2026-01-06', 8).toISOString() }] }
  const a = p.acciones[0]
  const ofrendas = Array.from({ length: 6 }, (_, i) => ({ id: 'n' + i, accionId: a.id, area: a.area, fecha: en('2026-01-06', 9 + i).toISOString(), diaMalo: false }))
  return { ...p, ofrendas, construcciones: construido.map((objetoId) => ({ objetoId, fecha: en('2026-01-06').toISOString() })) }
}

describe('avisos', () => {
  it('Hazañas avisa cada día nuevo hasta que la abres', () => {
    let p = crearPartida('nox', en('2026-01-05', 8))
    expect(hayHazanasNuevas(p, en('2026-01-05'))).toBe(true)
    p = verHazanas(p, en('2026-01-05'))
    expect(hayHazanasNuevas(p, en('2026-01-05', 23))).toBe(false)
    expect(hayHazanasNuevas(p, en('2026-01-06', 7))).toBe(true)
  })

  it('el sobre cuenta las no leídas; el «!» de la casa sigue hasta que entras', () => {
    let p = avanzar(barrio(['hoguera']), en('2026-01-07', 10)).partida
    expect(noticiasSinLeer(p)).toBe(1)
    expect(avisoEnCasa(p, 'nox')).toBe(true)
    p = leerNoticias(p)
    expect(noticiasSinLeer(p)).toBe(0)
    expect(avisoEnCasa(p, 'nox')).toBe(true)
    p = visitarLugar(p, 'nox')
    expect(avisoEnCasa(p, 'nox')).toBe(false)
    expect(p.noticias).toHaveLength(1) // se queda en el sobre, leída
  })

  it('las cosas pequeñas del día esperan a que las mires', () => {
    let p = barrio(['hoguera', 'banco'])
    const dias = Array.from({ length: 10 }, (_, i) => en(`2026-01-${String(10 + i).padStart(2, '0')}`, 10))
    const conMicro = dias.find((d) => microSinVer(p, 'nox', d))!
    expect(conMicro).toBeDefined()
    p = verMicro(p, 'nox', conMicro)
    expect(microSinVer(p, 'nox', conMicro)).toBeNull()
  })

  it('una huella nueva brilla hasta que la tocas (y deja de brillar sola a los pocos días)', () => {
    let p = avanzar(barrio(['hoguera']), en('2026-01-07', 10)).partida
    expect(huellaNueva(p, 'cartel-fuego', en('2026-01-07', 12))).toBe(true)
    expect(huellaNueva(p, 'cartel-fuego', en('2026-01-12', 12))).toBe(false)
    p = verHuella(p, 'cartel-fuego')
    expect(huellaNueva(p, 'cartel-fuego', en('2026-01-07', 12))).toBe(false)
  })
})
