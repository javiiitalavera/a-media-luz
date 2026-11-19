import { describe, expect, it } from 'vitest'
import { gruposDeCharla } from './charla'
import { fraseAlTocar } from './ofrendas'
import { CHARLA } from '../contenido/charla'
import { FRASES } from '../contenido'
import { crearPartida } from './partida'
import { azarFijo, con, en } from './test-utils'

// 2026-01-07 es miércoles (sin frases de día de la semana).
const ch = CHARLA.nox!
const base = () => crearPartida('nox', en('2026-01-05', 9), ['pasos', 'leer'], true)

describe('lo que comentan al tocarlos', () => {
  it('cómo va tu lista: nada (solo desde mediodía), a medias o completa', () => {
    const p = base()
    expect(gruposDeCharla(p, 'nox', en('2026-01-07', 8))).not.toContainEqual(ch.hoy.nada)
    expect(gruposDeCharla(p, 'nox', en('2026-01-07', 13))).toContainEqual(ch.hoy.nada)
    const media = con(p, 'cuerpo', '2026-01-07')
    expect(gruposDeCharla(media, 'nox', en('2026-01-07', 13))).toContainEqual(ch.hoy.algo)
    const todo = con(media, 'mente', '2026-01-07')
    expect(gruposDeCharla(todo, 'nox', en('2026-01-07', 13))).toContainEqual(ch.hoy.todo)
  })

  it('día de la semana, vuelta tras unos días, etapa y lo construido', () => {
    let p = con(base(), 'cuerpo', '2026-01-02')
    p = { ...p, construcciones: [{ objetoId: 'hoguera', fecha: en('2026-01-06').toISOString() }] }
    const lunes = gruposDeCharla(p, 'nox', en('2026-01-05', 13))
    expect(lunes).toContainEqual(ch.semana.lunes)
    expect(lunes).toContainEqual(ch.vuelta) // lo último fue el viernes 2
    expect(lunes).toContainEqual(ch.etapa[0])
    expect(lunes).toContainEqual(ch.objetos.hoguera)
    expect(lunes).not.toContainEqual(ch.objetos.horno)
    expect(gruposDeCharla(p, 'nox', en('2026-01-03', 13))).toContainEqual(ch.semana.finde)
  })

  it('habla de los otros vecinos solo si ya han llegado', () => {
    const p = base()
    expect(gruposDeCharla(p, 'nox', en('2026-01-07', 13))).not.toContainEqual(ch.vecinos.tuerca)
    const conTuerca = { ...p, meses: [...p.meses!, { companero: 'tuerca' as const, inicio: en('2026-01-06').toISOString(), presentado: en('2026-01-06').toISOString() }] }
    expect(gruposDeCharla(conTuerca, 'nox', en('2026-01-07', 13))).toContainEqual(ch.vecinos.tuerca)
  })

  it('al tocarlo mezcla saludos de la hora y charla, sin repetir las recientes', () => {
    let p = base()
    const vistas = new Set<string>()
    for (let i = 0; i < 10; i++) { // hay 11 frases posibles: ninguna se repite
      const r = fraseAlTocar(p, 'nox', en('2026-01-07', 13), azarFijo(i / 10, (i * 7 % 10) / 10))
      expect(vistas.has(r.frase!.texto)).toBe(false)
      vistas.add(r.frase!.texto)
      p = { ...p, frasesRecientes: r.recientes }
    }
    const saludos = FRASES.nox.saludo.mediodia
    expect([...vistas].some((t) => saludos.includes(t))).toBe(true)
    expect([...vistas].some((t) => !saludos.includes(t))).toBe(true)
  })
})
