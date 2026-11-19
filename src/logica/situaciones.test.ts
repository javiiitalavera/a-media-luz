import { describe, expect, it } from 'vitest'
import { avanzar, cronicas, decidir, decisionPendiente, dondeGregorio, fraseDeSituacion, huellasEn, microDeHoy, visitante } from './situaciones'
import { crearPartida, type Partida } from './partida'
import { en } from './test-utils'
import { sumarDias } from './fechas'

/** Nox y Tuerca nacidos, con lo construido que se pida (sin mirar materiales: es para probar las historias). */
function barrio(construido: string[]): Partida {
  let p = crearPartida('nox', en('2026-01-05', 8), undefined, true)
  p = { ...p, meses: [...p.meses!, { companero: 'tuerca', inicio: en('2026-01-06', 8).toISOString() }] }
  const a = p.acciones[0]
  const ofrendas = Array.from({ length: 6 }, (_, i) => ({ id: 'n' + i, accionId: a.id, area: a.area, fecha: en('2026-01-06', 9 + i).toISOString(), diaMalo: false }))
  return { ...p, ofrendas, construcciones: construido.map((objetoId) => ({ objetoId, fecha: en('2026-01-06').toISOString() })) }
}
/** Igual, con Tofu nacido también. */
function conTofu(construido: string[]): Partida {
  const p = barrio(construido)
  return { ...p, meses: [...p.meses!, { companero: 'tofu', inicio: en('2026-01-06', 8).toISOString() }] }
}
const dia = (n: number, h = 10) => en(sumarDias('2026-01-07', n), h)

describe('situaciones', () => {
  it('nada empieza si no se cumplen los requisitos', () => {
    expect(avanzar(barrio([]), dia(0)).nuevas).toHaveLength(0)
  })

  it('una fase al día como mucho, con noticia y huellas que cambian', () => {
    let p = barrio(['hoguera'])
    let r = avanzar(p, dia(0))
    expect(r.nuevas[0].texto).toMatch(/cartel/)
    p = r.partida
    expect(huellasEn(p, 'nox').map((h) => h.id)).toEqual(['cartel-fuego'])
    expect(avanzar(p, dia(0, 22)).nuevas).toHaveLength(0) // mismo día: nada
    p = avanzar(p, dia(1)).partida
    p = avanzar(p, dia(2)).partida
    expect(huellasEn(p, 'nox').map((h) => h.id).sort()).toEqual(['cartel-quemado', 'extintor'])
    expect(huellasEn(p, 'tuerca').map((h) => h.id)).toEqual(['expediente-fuego'])
    expect(cronicas(p).map((c) => c.id)).toEqual(['normativa'])
    expect(p.noticias).toHaveLength(3)
  })

  it('si no entras en días, sigue donde la dejaste (no salta fases)', () => {
    let p = avanzar(barrio(['hoguera']), dia(0)).partida
    p = avanzar(p, dia(10)).partida
    expect(p.situaciones!.normativa.fase).toBe(1)
  })

  it('se termina lo empezado antes de empezar otra', () => {
    let p = avanzar(barrio(['hoguera', 'tablon']), dia(0)).partida
    p = avanzar(p, dia(1)).partida
    expect(Object.keys(p.situaciones!)).toEqual(['normativa'])
    p = avanzar(avanzar(p, dia(2)).partida, dia(3)).partida
    expect(p.situaciones!.tablon.fase).toBe(0)
  })

  it('Gregorio: espera tu decisión y la respeta', () => {
    let p = barrio(['aspiradora'])
    expect(dondeGregorio(p, dia(0))).toBe('tuerca')
    p = avanzar(p, dia(0)).partida
    expect(dondeGregorio(p, dia(0))).toBeNull()
    p = avanzar(avanzar(p, dia(1)).partida, dia(2)).partida
    expect(decisionPendiente(p, 'nox')?.opciones).toHaveLength(2)
    expect(avanzar(p, dia(3)).nuevas).toHaveLength(0) // espera
    p = decidir(p, 'gregorio', 'nox')!
    p = avanzar(p, dia(4)).partida
    expect(p.situaciones!.gregorio.fin).toBe(true)
    expect(p.noticias!.at(-1)!.texto).toMatch(/se queda con Nox/)
    expect(dondeGregorio(p, dia(5))).toBe('nox')
    expect(dondeGregorio(p, dia(6))).toBe('nox')
  })

  it('custodia compartida: Gregorio cambia de casa cada día', () => {
    let p = barrio(['aspiradora'])
    for (let i = 0; i < 3; i++) p = avanzar(p, dia(i)).partida
    p = avanzar(decidir(p, 'gregorio', 'compartida')!, dia(3)).partida
    expect(new Set([dondeGregorio(p, dia(4)), dondeGregorio(p, dia(5))])).toEqual(new Set(['nox', 'tuerca']))
  })

  it('los vecinos hablan de la situación en marcha', () => {
    const p = avanzar(barrio(['hoguera']), dia(0)).partida
    expect(fraseDeSituacion(p, 'tuerca', dia(0))?.[0]).toMatch(/Artículo 1/)
    // terminada, se habla de ella dos días más y luego ya no
    let q = p
    for (let i = 1; i < 3; i++) q = avanzar(q, dia(i)).partida
    expect(fraseDeSituacion(q, 'nox', dia(4))).not.toBeNull()
    expect(fraseDeSituacion(q, 'nox', dia(6))).toBeNull()
  })

  it('tras el puente, a veces hay visita; los micros dependen de lo construido', () => {
    let p = barrio(['puente', 'hoguera'])
    p = { ...p, situaciones: { puente: { fase: 2, dia: '2026-01-07', fin: true } } }
    const visitas = Array.from({ length: 30 }, (_, i) => visitante(p, 'nox', dia(i)))
    expect(visitas.some((v) => v === 'tuerca')).toBe(true)
    expect(visitas.some((v) => v === null)).toBe(true)
    const micros = Array.from({ length: 30 }, (_, i) => microDeHoy(p, 'nox', dia(i))).filter(Boolean)
    expect(micros.length).toBeGreaterThan(0)
    expect(micros.every((m) => m!.casa === 'nox' && m!.requiere.every((r) => ['hoguera', 'tuerca', 'nox'].includes(r) || r === ''))).toBe(true)
  })

  it('Tofu: el préstamo quema un libro en casa de Nox y acaba según decidas', () => {
    expect(avanzar(barrio(['libros']), dia(0)).nuevas).toHaveLength(0) // sin Tofu, nada
    let p = avanzar(conTofu(['libros']), dia(0)).partida
    p = avanzar(p, dia(1)).partida
    expect(huellasEn(p, 'nox').map((h) => h.id)).toEqual(['libro-hoguera'])
    p = avanzar(p, dia(2)).partida
    expect(decisionPendiente(p, 'tofu')?.situacion).toBe('prestamo')
    p = avanzar(decidir(p, 'prestamo', 'salchichas')!, dia(3)).partida
    expect(p.noticias!.at(-1)!.texto).toMatch(/salchichas/)
    expect(huellasEn(p, 'nox')).toHaveLength(0)
    expect(huellasEn(p, 'tofu').map((h) => h.id)).toEqual(['libro-estante', 'salchichas-estante'])
  })

  it('Tofu: la planta se traga a Gregorio un par de días y lo devuelve', () => {
    let p = avanzar(conTofu(['maceta', 'aspiradora']), dia(0)).partida
    // Primero va Gregorio (está antes en la lista); se termina y luego llega la planta.
    p = decidir(avanzar(avanzar(p, dia(1)).partida, dia(2)).partida, 'gregorio', 'nox')!
    p = avanzar(p, dia(3)).partida
    expect(dondeGregorio(p, dia(3))).toBe('nox')
    p = avanzar(avanzar(p, dia(4)).partida, dia(5)).partida
    expect(p.situaciones!.planta.fase).toBe(1)
    expect(dondeGregorio(p, dia(5))).toBeNull()
    p = avanzar(avanzar(p, dia(6)).partida, dia(7)).partida
    expect(p.situaciones!.planta.fin).toBe(true)
    expect(dondeGregorio(p, dia(7))).toBe('nox')
  })

  it('los micros que piden a Tofu solo salen si ha nacido', () => {
    const casas = (p: Partida) => Array.from({ length: 40 }, (_, i) => microDeHoy(p, 'nox', dia(i))?.visita).filter(Boolean)
    expect(casas(barrio(['hoguera']))).not.toContain('tofu')
    expect(casas(conTofu(['hoguera']))).toContain('tofu')
  })

  it('Crónicas: las que están en marcha primero, hasta donde han llegado', () => {
    let p = avanzar(barrio(['hoguera', 'tablon']), dia(0)).partida
    expect(cronicas(p)).toEqual([{ id: 'normativa', titulo: expect.any(String), fases: [expect.stringMatching(/cartel/)], enMarcha: true }])
    p = avanzar(avanzar(avanzar(p, dia(1)).partida, dia(2)).partida, dia(3)).partida
    expect(cronicas(p).map((c) => [c.id, c.enMarcha])).toEqual([['tablon', true], ['normativa', false]])
  })

  it('una decisión pendiente no congela el barrio: puede empezar otra historia (como mucho dos)', () => {
    let p = barrio(['aspiradora', 'tablon'])
    for (let i = 1; i < 12; i++) p = avanzar(p, dia(i)).partida
    const est = p.situaciones!
    expect(est.gregorio.decision).toBeUndefined()
    expect(est.gregorio.fin).toBeFalsy() // espera tu decisión
    expect(est.tablon.fin).toBe(true) // y el tablón ha seguido mientras tanto
    expect(decisionPendiente(p, 'nox')?.situacion).toBe('gregorio')
  })
})
