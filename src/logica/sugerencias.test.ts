import { describe, expect, it } from 'vitest'
import { anadirSugerencia, metaPasos, sugerencias } from './sugerencias'
import { crearPartida } from './partida'
import { en } from './test-utils'

const ids = (p: Parameters<typeof sugerencias>[0]) => sugerencias(p).map((s) => s.id)

describe('sugerencias del cuestionario', () => {
  it('sin responder nada: tres retos sencillos', () => {
    expect(ids({ mejorar: [] })).toEqual(['pasos', 'leer', 'padres'])
  })
  it('los pasos se ajustan a lo que te mueves y a la edad', () => {
    expect(metaPasos('poco', false)).toBe(4000)
    expect(metaPasos('poco', true)).toBe(3000)
    expect(metaPasos('bastante', false)).toBe(10000)
    expect(sugerencias({ mejorar: ['moverme'], actividad: 'algo', edad: '30-49' })[0].nombre).toBe('Andar 6000 pasos')
  })
  it('menores: retos de su edad (jugar fuera, deberes, ayudar en casa)', () => {
    expect(ids({ edad: 'menor', mejorar: ['moverme', 'aprender', 'orden'] }).slice(0, 3)).toEqual(['jugar-fuera', 'deberes', 'ayudar-casa'])
  })
  it('65 o más: equilibrio; trabajo sentado: estirar aunque no lo pidas; como mucho cinco', () => {
    expect(ids({ edad: '65+', mejorar: ['moverme'], actividad: 'poco' })).toContain('equilibrio')
    expect(ids({ edad: '30-49', mejorar: ['dormir'], dia: 'sentado' })).toContain('estirar')
    expect(ids({ edad: '30-49', mejorar: ['moverme', 'dormir', 'calma'], dia: 'sentado', actividad: 'poco' }).length).toBeLessThanOrEqual(5)
  })
  it('añadir una sugerencia guarda su meta ajustada', () => {
    const p = anadirSugerencia(crearPartida('nox', en('2026-01-05'), ['leer']), { id: 'pasos', nombre: 'Andar 4000 pasos', minima: 'Andar 1000 pasos' })
    expect(p.acciones.find((a) => a.id === 'pasos')!.nombre).toBe('Andar 4000 pasos')
  })
  it('propone alternativas de varias áreas sin seleccionarlas como primera lista', () => {
    const perfil = { edad: '18-29', mejorar: ['aprender', 'gente'], actividad: 'poco' } as const
    const p = { ...perfil, mejorar: [...perfil.mejorar] }
    expect(ids(p).slice(0, 2)).toEqual(['idioma', 'amigo'])
    const alternativas = sugerencias(p, 8).map(({ id }) => id)
    expect(alternativas).toHaveLength(8)
    expect(alternativas).toContain('gastos')
    expect(alternativas).toContain('paseo')
    const mayor = sugerencias({ edad: '65+', mejorar: ['aprender', 'gente'], dia: 'jubilado' }, 8)
    expect(mayor.slice(0, 2).map(({ id }) => id)).toEqual(['curso', 'amigo'])
    expect(mayor.some(({ id }) => id === 'podcast')).toBe(true)
  })
})
