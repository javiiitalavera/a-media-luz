import { describe, expect, it } from 'vitest'
import { curiosidadesDeHistorias, curiosidadesTenidas, resolverTravesura, sorpresa, travesuraPendiente } from './curiosidades'
import { cronicaNueva, hayAlbumNuevo, seccionesNuevas, verAlbum, verCronica, verSeccion } from './avisos'
import { deshacerOfrenda, hacerOfrenda } from './ofrendas'
import { crearPartida, type Partida } from './partida'
import { avanzar } from './situaciones'
import { azarFijo, en } from './test-utils'

function barrio(construido: string[]): Partida {
  let p = crearPartida('nox', en('2026-01-05', 8), ['pasos', 'leer'], true)
  p = { ...p, meses: [...p.meses!, { companero: 'tuerca', inicio: en('2026-01-06', 8).toISOString() }] }
  const ofrendas = Array.from({ length: 6 }, (_, i) => ({ id: 'n' + i, accionId: 'pasos', area: 'cuerpo' as const, fecha: en('2026-01-06', 9 + i).toISOString(), diaMalo: false }))
  return { ...p, ofrendas, construcciones: construido.map((objetoId) => ({ objetoId, fecha: en('2026-01-06').toISOString() })) }
}

describe('curiosidades', () => {
  it('sorpresa: solo del vecino que ya vive, con suerte y una al día', () => {
    const p = barrio([])
    expect(sorpresa(p, 'cuerpo', en('2026-01-08'), azarFijo(0.1, 0))?.vecino).toBe('nox')
    expect(sorpresa(p, 'cuerpo', en('2026-01-08'), azarFijo(0.5))).toBeNull()
    expect(sorpresa(p, 'mente', en('2026-01-08'), azarFijo(0, 0))).toBeNull() // Tofu no ha llegado
    const r = hacerOfrenda(p, 'pasos', en('2026-01-08', 10), azarFijo(0.99, 0.1, 0, 0), 'o1')
    expect(r.sorpresa?.vecino).toBe('nox')
    expect(curiosidadesTenidas(r.partida)).toHaveLength(1)
    expect(sorpresa(r.partida, 'cuerpo', en('2026-01-08', 20), azarFijo(0, 0))).toBeNull()
    expect(curiosidadesTenidas(deshacerOfrenda(r.partida, 'o1'))).toHaveLength(0) // deshacer se la lleva
  })

  it('una historia que termina deja su curiosidad; el Álbum avisa hasta que lo abres', () => {
    let p = barrio(['hoguera'])
    let antes = p
    for (const d of ['07', '08', '09']) { antes = p; p = avanzar(p, en(`2026-01-${d}`, 10)).partida }
    p = curiosidadesDeHistorias(antes, p, en('2026-01-09', 12))
    expect(curiosidadesTenidas(p).map((x) => x.c.id)).toEqual(['cartel-quemado'])
    expect(hayAlbumNuevo(p)).toBe(true)
    expect(seccionesNuevas(p)).toEqual(['cronicas', 'curiosidades'])
    // Mirar una parte apaga solo su aviso.
    p = verSeccion(p, 'curiosidades', en('2026-01-09', 13))
    expect(seccionesNuevas(p)).toEqual(['cronicas'])
    p = verAlbum(p, en('2026-01-09', 13))
    expect(hayAlbumNuevo(p)).toBe(false)
    // Al día siguiente la historia de la normativa ya terminó: si empieza otra, avisan las Crónicas.
    p = { ...p, situaciones: { ...p.situaciones, tablon: { fase: 0, dia: '2026-01-10' } } }
    expect(seccionesNuevas(p)).toEqual(['cronicas'])
    // Se sabe cuál: solo la del tablón tiene novedad, y se apaga al abrirla.
    expect(cronicaNueva(p, 'tablon')).toBe(true)
    expect(cronicaNueva(p, 'normativa')).toBe(false)
    p = verCronica(p, 'tablon')
    expect(seccionesNuevas(p)).toEqual([])
    // Si avanza otra fase, vuelve a avisar.
    p = { ...p, situaciones: { ...p.situaciones, tablon: { fase: 1, dia: '2026-01-11' } } }
    expect(cronicaNueva(p, 'tablon')).toBe(true)
  })

  it('la primera travesura de Nox: la piña espera, y al decidir pasa a tus Curiosidades', () => {
    let p = barrio([])
    expect(travesuraPendiente(p, 'nox')).toBe(true)
    expect(travesuraPendiente(p, 'tuerca')).toBe(false)
    p = resolverTravesura(p, 'aqui', en('2026-01-07'))
    expect(travesuraPendiente(p, 'nox')).toBe(false)
    expect(p.vistos?.pina).toBe('aqui')
    expect(curiosidadesTenidas(p).map((x) => x.c.id)).toEqual(['pina'])
  })
})
