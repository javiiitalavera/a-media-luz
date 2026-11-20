import { describe, expect, it } from 'vitest'
import { avisoFuera, decisionesPendientes, noticiasDelSobre, pendientesDelSobre, fichaNueva, hayAlgoEnInicio, hayAlgoQueHacer, verFicha, gagDeHoy, verGag, avisoEnCasa, hayHazanasNuevas, huellaNueva, leerNoticias, microSinVer, noticiasSinLeer, verHazanas, verHuella, verMicro, visitarLugar } from './avisos'
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
    expect(avisoEnCasa(p, 'nox', en('2026-01-07', 10))).toBe(true)
    p = leerNoticias(p)
    expect(noticiasSinLeer(p)).toBe(0)
    expect(avisoEnCasa(p, 'nox', en('2026-01-07', 10))).toBe(true)
    p = visitarLugar(p, 'nox')
    expect(avisoEnCasa(p, 'nox', en('2026-01-07', 10))).toBe(false)
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

  it('escenas que se tocan: algunos días, solo con lo construido, y una vez vista ya no sale ese día', () => {
    let p = barrio(['hoguera'])
    const dias = Array.from({ length: 30 }, (_, i) => en(`2026-02-${String(1 + (i % 28)).padStart(2, '0')}`, 12))
    const conGag = dias.filter((d) => gagDeHoy(p, 'nox', d))
    expect(conGag.length).toBeGreaterThan(3)
    expect(conGag.length).toBeLessThan(20)
    expect(gagDeHoy(p, 'nox', conGag[0])!.id).toBe('hoguera-salchicha') // el del banco necesita a Gregorio
    expect(gagDeHoy(barrio([]), 'nox', conGag[0])).toBeNull()
    p = verGag(p, 'nox', conGag[0])
    expect(gagDeHoy(p, 'nox', conGag[0])).toBeNull()
  })

  it('Inicio avisa si el huevo está listo o alguien ha crecido sin que lo hayas visto', () => {
    const ahora = en('2026-01-07', 10)
    let p = barrio([])
    p = { ...p, noticias: [], meses: p.meses!.map((m) => ({ ...m, presentado: m.inicio })) }
    expect(hayAlgoEnInicio(p, ahora)).toBe(false)
    // Tuerca aún sin presentar y con sus tres retos: está naciendo.
    const naciendo = { ...p, meses: [p.meses![0], { ...p.meses![1], presentado: undefined }],
      ofrendas: [...p.ofrendas, ...[0, 1, 2].map((i) => ({ id: 't' + i, accionId: p.acciones[0].id, area: p.acciones[0].area, fecha: en('2026-01-06', 18, i).toISOString(), diaMalo: false }))] }
    expect(hayAlgoEnInicio(naciendo, ahora)).toBe(true)
    // Ha crecido (lo dicen las etapas vistas, que van por detrás).
    const crecido = { ...p, etapasVistas: { nox: 0 as const }, construcciones: [{ objetoId: 'hoguera', fecha: en('2026-01-06').toISOString() }],
      ofrendas: [...p.ofrendas, ...[5, 7, 8].map((d) => ({ id: 'c' + d, accionId: p.acciones[0].id, area: p.acciones[0].area, fecha: en(`2026-01-0${d}`, 9).toISOString(), diaMalo: false }))] }
    const luego = en('2026-01-09', 10)
    expect(hayAlgoQueHacer(crecido, 'nox', luego)).toBe(true)
    expect(avisoEnCasa(crecido, 'nox', luego)).toBe(true)
    expect(hayAlgoEnInicio(crecido, luego)).toBe(true)
  })

  it('la «i» avisa cuando cambia la ficha (siguiente proyecto o una historia nueva)', () => {
    let p = barrio([])
    expect(fichaNueva(p, 'nox')).toBe(true)
    p = verFicha(p, 'nox')
    expect(fichaNueva(p, 'nox')).toBe(false)
    p = { ...p, construcciones: [{ objetoId: 'hoguera', fecha: en('2026-01-06').toISOString() }] }
    expect(fichaNueva(p, 'nox')).toBe(true) // el siguiente proyecto ya es otro
    p = verFicha(p, 'nox')
    p = avanzar(p, en('2026-01-07', 10)).partida // empieza «La normativa»
    expect(fichaNueva(p, 'nox')).toBe(true)
  })

  it('una decisión cuenta una vez en el sobre, con la noticia que la planteó como contexto', () => {
    let p = barrio(['aspiradora'])
    for (const d of ['07', '08', '09']) p = avanzar(p, en(`2026-01-${d}`, 10)).partida // Gregorio llega a la custodia
    const ahora = en('2026-01-09', 12)
    const [d] = decisionesPendientes(p, ahora)
    expect(d.lugar).toBe('nox')
    expect(d.contexto).toMatch(/custodia/)
    expect(noticiasDelSobre(p, ahora).map((n) => n.texto)).not.toContain(d.contexto)
    expect(pendientesDelSobre(p, ahora)).toBe(3) // dos noticias anteriores + la decisión (no cuatro)
    p = leerNoticias(p)
    expect(pendientesDelSobre(p, ahora)).toBe(1) // la decisión sigue esperando
  })

  it('entrar en una casa apaga su «!» pero no da las noticias por leídas', () => {
    let p = avanzar(barrio(['hoguera']), en('2026-01-07', 10)).partida
    p = visitarLugar(p, 'nox')
    expect(avisoEnCasa(p, 'nox', en('2026-01-07', 10))).toBe(false)
    expect(noticiasSinLeer(p)).toBe(1)
  })

  it('el botón Barrio de una casa avisa de lo que pasa en las otras («?» si esperan una decisión)', () => {
    let p = barrio(['aspiradora'])
    for (const d of ['07', '08', '09']) p = avanzar(p, en(`2026-01-${d}`, 10)).partida
    const ahora = en('2026-01-09', 12)
    expect(avisoFuera(p, 'tuerca', ahora)).toBe('pregunta') // la decisión es en casa de Nox
    expect(avisoFuera(p, 'nox', ahora)).toBe('punto') // en el taller pasó algo que no has visto
    p = visitarLugar(p, 'tuerca')
    expect(avisoFuera(p, 'nox', ahora)).toBeNull()
  })
})
