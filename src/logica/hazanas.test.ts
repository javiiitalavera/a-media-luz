import { describe, expect, it } from 'vitest'
import { anadirHazana, borrarHazana, propiasFuera, crearHazana, editarHazana, extrasHoy, hechaHoy, migrarHazanas, misHazanas, quitarHazana, textoHazana } from './hazanas'
import { hacerOfrenda } from './ofrendas'
import { crearPartida, type Partida } from './partida'
import { estadoRincon } from './reglas'
import { azarFijo, en } from './test-utils'

const base = () => crearPartida('nox', en('2026-01-05', 8), ['pasos', 'leer'])

describe('hazañas', () => {
  it('al empezar: las elegidas, o las iniciales si no se elige ninguna', () => {
    expect(misHazanas(base()).map((a) => a.id)).toEqual(['pasos', 'leer'])
    expect(misHazanas(crearPartida('nox', en('2026-01-05'))).map((a) => a.id)).toEqual(['pasos', 'leer', 'padres'])
  })

  it('cada mañana empiezan sin tachar (hecha = hay ofrenda hoy)', () => {
    const p = hacerOfrenda(base(), 'pasos', en('2026-01-05', 10), azarFijo(0, 0.99), 'o1').partida
    expect(hechaHoy(p, 'pasos', en('2026-01-05', 22))).toBe(true)
    expect(hechaHoy(p, 'pasos', en('2026-01-06', 8))).toBe(false)
    expect(misHazanas(p)).toHaveLength(2) // la lista se queda
  })

  it('el vecino del área comenta tu hazaña con su frase propia', () => {
    const r = hacerOfrenda(base(), 'pasos', en('2026-01-05', 10), azarFijo(0, 0.99), 'o1')
    expect(r.frase?.companero).toBe('nox')
    expect(r.frase?.texto).toMatch(/pasos|hoja/)
  })

  it('meta editable y mínima opcional (vacía la quita); el día malo usa la mínima si existe', () => {
    let p = editarHazana(base(), 'pasos', { nombre: ' Andar 6000 pasos ', minima: '' })
    const a = p.acciones.find((x) => x.id === 'pasos')!
    expect(a.nombre).toBe('Andar 6000 pasos')
    expect(a.minima).toBeUndefined()
    expect(textoHazana(a, true)).toBe('Andar 6000 pasos')
    p = editarHazana(p, 'pasos', { nombre: '  ', minima: 'Bajar una parada antes' })
    const b = p.acciones.find((x) => x.id === 'pasos')!
    expect(b.nombre).toBe('Andar 6000 pasos')
    expect(textoHazana(b, true)).toBe('Bajar una parada antes')
  })

  it('propias: se crean con su área, cuentan y se pueden quitar sin perder el historial', () => {
    let p = crearHazana(base(), { nombre: 'Nadar 20 minutos', area: 'cuerpo' }, 'x')
    expect(crearHazana(p, { nombre: '  ', area: 'cuerpo' }, 'y')).toBe(p)
    p = hacerOfrenda(p, 'propia-x', en('2026-01-05'), azarFijo(0, 0.99), 'o1').partida
    expect(estadoRincon(p, 'cuerpo', en('2026-01-05', 20)).crecimiento).toBe(1)
    p = quitarHazana(p, 'propia-x')
    expect(misHazanas(p).some((a) => a.id === 'propia-x')).toBe(false)
    expect(p.ofrendas).toHaveLength(1)
  })

  it('«Algo más»: lo de fuera de tu lista cuenta, sale aparte y no entra en tu lista', () => {
    let p = anadirHazana(base(), 'correr', false)
    p = hacerOfrenda(p, 'correr', en('2026-01-05', 10), azarFijo(0, 0.99), 'o1').partida
    expect(misHazanas(p).map((a) => a.id)).toEqual(['pasos', 'leer'])
    expect(extrasHoy(p, en('2026-01-05', 20)).map((a) => a.id)).toEqual(['correr'])
    expect(anadirHazana(p, 'correr').acciones.find((a) => a.id === 'correr')!.habitual).toBeUndefined()
  })

  it('partidas de antes: las acciones genéricas pasan a sus hazañas concretas, sin perder historial', () => {
    const vieja = { ...base(), hazanas: undefined, acciones: [
      { id: 'andar', area: 'cuerpo', nombre: 'Salir a andar', minima: 'Cinco minutos fuera' },
      { id: 'leer', area: 'mente', nombre: 'Leer un rato', minima: 'Leer una página' },
      { id: 'propia-z', area: 'calma', nombre: 'Tocar la guitarra', minima: 'Una canción' },
      { id: 'papeleo', area: 'orden', nombre: 'Hacer papeleo', minima: '...' },
      { id: 'pendiente', area: 'orden', nombre: 'Cerrar un pendiente', minima: '...' },
    ], ofrendas: [{ id: 'o1', accionId: 'andar', area: 'cuerpo', fecha: en('2026-01-04').toISOString(), diaMalo: false }] } as Partida
    const p = migrarHazanas(vieja)
    expect(p.acciones.map((a) => a.id)).toEqual(['pasos', 'leer', 'propia-z', 'gestion'])
    expect(p.acciones[0].nombre).toBe('Andar 8000 pasos')
    expect(p.ofrendas[0].accionId).toBe('pasos')
    expect(migrarHazanas(p)).toBe(p)
  })

  it('propios: se puede cambiar el área y borrarlos de verdad (el historial queda)', () => {
    let p = crearHazana(base(), { nombre: 'Nadar 20 minutos', area: 'calma' }, 'x')
    p = editarHazana(p, 'propia-x', { area: 'cuerpo' })
    expect(p.acciones.find((a) => a.id === 'propia-x')!.area).toBe('cuerpo')
    expect(editarHazana(p, 'pasos', { area: 'mente' }).acciones.find((a) => a.id === 'pasos')!.area).toBe('cuerpo') // los del catálogo no cambian de área
    p = hacerOfrenda(p, 'propia-x', en('2026-01-05'), azarFijo(0.99, 0.99), 'o1').partida
    p = quitarHazana(p, 'propia-x')
    expect(propiasFuera(p).map((a) => a.id)).toEqual(['propia-x'])
    p = borrarHazana(p, 'propia-x')
    expect(p.acciones.some((a) => a.id === 'propia-x')).toBe(false)
    expect(borrarHazana(p, 'pasos').acciones.some((a) => a.id === 'pasos')).toBe(true) // solo los propios
    expect(p.ofrendas).toHaveLength(1)
  })

  it('partidas de antes del cambio de áreas: dormir pasa a Calma y el diario a Mente', () => {
    const vieja = { ...base(), hazanas: 2 as const, acciones: [
      { id: 'dormir', area: 'cuerpo' as const, nombre: 'Dormir 8 horas' },
      { id: 'diario', area: 'calma' as const, nombre: 'Escribir en mi diario' },
      { id: 'propia-z', area: 'cuerpo' as const, nombre: 'Nadar' },
    ] }
    const p = migrarHazanas(vieja)
    expect(p.acciones.map((a) => [a.id, a.area, a.nombre])).toEqual([['dormir', 'calma', 'Dormir 8 horas'], ['diario', 'mente', 'Escribir en mi diario'], ['propia-z', 'cuerpo', 'Nadar']])
    expect(p.hazanas).toBe(3)
  })
})
