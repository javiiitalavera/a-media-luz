// Arreglos de la segunda auditoría (20/11/2026).
import { describe, expect, it } from 'vitest'
import { crearPartida, type Partida } from './partida'
import { marcarPresentado } from './meses'
import { incubar, nacido } from './etapas'
import { microDeHoy } from './situaciones'
import { sitioSobre } from './colocar'
import { sorpresa } from './curiosidades'
import { hacerOfrenda } from './ofrendas'
import { estadoRincon } from './reglas'
import { anadirSugerencia } from './sugerencias'
import { retoQueFalta } from './pista'
import { en } from './test-utils'
import { sumarDias } from './fechas'
import { OBJETOS_CASA } from '../contenido'

let n = 0
const registro = (p: Partida, accionId: string, area: Partida['ofrendas'][number]['area'], d: string, h = 10): Partida =>
  ({ ...p, ofrendas: [...p.ofrendas, { id: `a${++n}`, accionId, area, fecha: en(d, h).toISOString(), diaMalo: false }] })
/** Nox abierto el 1 de enero, con la hoguera. */
function conNox(): Partida {
  let p = crearPartida('nox', en('2026-01-01', 8), ['pasos', 'leer', 'dormir'], true)
  for (const h of [9, 10, 11]) p = registro(p, 'pasos', 'cuerpo', '2026-01-01', h)
  p = marcarPresentado(p, en('2026-01-01', 12))
  return { ...p, construcciones: [{ objetoId: 'hoguera', fecha: en('2026-01-02').toISOString() }] }
}

describe('segunda auditoría', () => {
  it('las escenas diarias salen todas: con dos posibles, en un año salen las dos', () => {
    const p = conNox()
    const vistas = new Set<string>()
    for (let i = 0; i < 366; i++) vistas.add(microDeHoy(p, 'nox', en(sumarDias('2026-01-03', i)))?.texto ?? '')
    expect([...vistas].filter(Boolean).length).toBeGreaterThanOrEqual(2)
    expect([...vistas].some((t) => /dormido junto a la hoguera/.test(t))).toBe(true)
  })

  it('una escena sobre un mueble guardado en el baúl no sale, y si lo mueves, se mueve con él', () => {
    const p = { ...conNox(), guardados: ['hoguera'] }
    for (let i = 0; i < 120; i++) expect(microDeHoy(p, 'nox', en(sumarDias('2026-01-03', i)))?.texto ?? '').not.toMatch(/hoguera/)
    const hoguera = OBJETOS_CASA.find((o) => o.id === 'hoguera')!
    const movida = { ...conNox(), colocados: { hoguera: { x: hoguera.sitio.x + 20, y: hoguera.sitio.y } } }
    expect(sitioSobre(movida, 'hoguera', { x: 24, y: 54 }).x).toBeCloseTo(44)
    expect(sitioSobre(movida, undefined, { x: 24, y: 54 })).toEqual({ x: 24, y: 54 })
  })

  it('con el huevo listo pero sin abrir, el vecino aún no está: ni regala, ni actúa', () => {
    let p = crearPartida('nox', en('2026-01-01', 8), ['pasos', 'leer', 'dormir'], true)
    for (const h of [9, 10, 11]) p = registro(p, 'pasos', 'cuerpo', '2026-01-01', h)
    expect(nacido(p, 'nox', en('2026-01-02'))).toBe(false)
    expect(sorpresa(p, 'cuerpo', en('2026-01-02'), () => 0)).toBeNull()
    expect(nacido(marcarPresentado(p, en('2026-01-02')), 'nox', en('2026-01-02'))).toBe(true)
  })

  it('nadie anuncia una mudanza que no ha pasado: tres de Mente con solo Nox no traen a Tofu', () => {
    let p = conNox()
    let r
    for (const d of ['2026-01-03', '2026-01-04', '2026-01-05']) { r = hacerOfrenda(p, 'leer', en(d), () => 0.99, `l${d}`); p = r.partida }
    expect(r!.eventos).not.toContain('llegada')
    expect(r!.frase?.companero).toBe('nox')
  })

  it('la casa de un vecino no se descuida antes de llegar: Tuerca estrena taller sin intruso aunque tarde', () => {
    let p = conNox()
    for (const d of ['2026-01-02', '2026-01-03', '2026-01-04']) p = registro(p, 'gestion', 'orden', d)
    p = incubar(p, 'tuerca', en('2026-01-25', 9))
    for (const h of [10, 11, 12]) p = registro(p, 'gestion', 'orden', '2026-01-25', h)
    p = marcarPresentado(p, en('2026-01-25', 13))
    const r = estadoRincon(p, 'orden', en('2026-01-25', 14))
    expect(r.fase).toBe(0)
    expect(r.visitante).toBe(false)
  })

  it('la piña solo sale de la travesura, nunca del sorteo', () => {
    const p = conNox()
    for (let i = 0; i < 20; i++) expect(sorpresa(p, 'cuerpo', en('2026-01-03'), () => i / 20)?.id).not.toBe('pina')
  })

  it('una lista vacía elegida a propósito se respeta', () => {
    expect(crearPartida('nox', en('2026-01-01'), [], true).acciones).toEqual([])
    expect(crearPartida('nox', en('2026-01-01'), undefined, true).acciones.length).toBe(3)
  })

  it('cambiar la meta desde Sugerencias respeta tu versión mínima', () => {
    let p = crearPartida('nox', en('2026-01-01'), ['pasos'], true)
    p = { ...p, acciones: p.acciones.map((a) => ({ ...a, nombre: 'Andar un rato', minima: 'Hasta el jardín' })) }
    const q = anadirSugerencia(p, { id: 'pasos', nombre: 'Andar 4.000 pasos', minima: 'Andar 1000 pasos' })
    expect(q.acciones[0]).toMatchObject({ nombre: 'Andar 4.000 pasos', minima: 'Hasta el jardín' })
  })

  it('si tu lista no tiene nada del área del último vecino, te lo pide, y con un toque se arregla', () => {
    let p = crearPartida('nox', en('2026-01-01', 8), ['concentrado', 'leer', 'dormir'], true)
    p = { ...p, perfil: { mejorar: ['aprender', 'dormir'] } }
    for (const h of [9, 10, 11]) p = registro(p, 'leer', 'mente', '2026-01-01', h)
    expect(retoQueFalta(p, en('2026-01-01', 12))).toBeNull() // aún en el huevo
    p = marcarPresentado(p, en('2026-01-01', 12))
    const pista = retoQueFalta(p, en('2026-01-02'))!
    expect(pista).toMatchObject({ vecino: 'nox', area: 'cuerpo', cabe: true })
    expect(retoQueFalta(anadirSugerencia(p, pista.reto), en('2026-01-02'))).toBeNull()
  })
})
