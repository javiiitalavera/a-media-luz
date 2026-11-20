import { describe, expect, it } from 'vitest'
import { crearPartida, type Partida } from './partida'
import { marcarPresentado } from './meses'
import { informeSemanal, lecturaDeHoy, leerElDiario } from './lector'
import { en } from './test-utils'
import { sumarDias } from './fechas'
import type { AreaId } from '../contenido'

let n = 0
const reg = (p: Partida, accionId: string, area: AreaId, d: string, h = 10): Partida =>
  ({ ...p, ofrendas: [...p.ofrendas, { id: `r${++n}`, accionId, area, fecha: en(d, h).toISOString(), diaMalo: false }] })
/** Nox y Tuerca en el barrio desde el 1 de enero de 2026 (jueves). */
function barrio(): Partida {
  const p = crearPartida('nox', en('2026-01-01', 8), ['pasos', 'leer', 'gestion'], true)
  return { ...marcarPresentado(p, en('2026-01-01', 9)), meses: [
    { companero: 'nox', inicio: en('2026-01-01', 8).toISOString(), presentado: en('2026-01-01', 9).toISOString() },
    { companero: 'tuerca', inicio: en('2026-01-01', 8).toISOString(), presentado: en('2026-01-01', 9).toISOString() }] }
}
/** Abre el juego cada día: lo que el barrio lee. */
function dias(p: Partida, desde: string, cuantos: number) {
  const dichas: string[] = []
  for (let i = 0; i < cuantos; i++) {
    const r = leerElDiario(p, en(sumarDias(desde, i), 21))
    p = r.partida
    dichas.push(...r.nuevas.map((x) => x.texto))
  }
  return { p, dichas }
}

describe('el lector', () => {
  it('el primer reto de un área lo comenta su vecino (o Nox si aún no ha llegado), una sola vez', () => {
    let p = reg(barrio(), 'leer', 'mente', '2026-01-05')
    const l = lecturaDeHoy(p, en('2026-01-05', 20))!
    expect(l.vecino).toBe('nox')
    expect(l.texto).toMatch(/Mente/)
    p = { ...p, lecturas: [l] }
    expect(lecturaDeHoy(p, en('2026-01-06', 20))?.clave ?? '').not.toBe('debut|mente')
    // Si esa primera vez fue hace semanas (una partida con historia), no se anuncia como nueva.
    expect(lecturaDeHoy(reg(barrio(), 'leer', 'mente', '2026-01-05'), en('2026-01-20', 20))?.clave ?? '').not.toBe('debut|mente')
  })

  it('una al día y tres por semana como mucho; solo habla quien está en el barrio', () => {
    let p = barrio()
    for (const d of ['2026-01-05', '2026-01-06', '2026-01-07', '2026-01-08', '2026-01-09'])
      for (const [id, a] of [['pasos', 'cuerpo'], ['leer', 'mente'], ['gestion', 'orden'], ['aire', 'calma'], ['amigo', 'vinculos']] as const) p = reg(p, id, a, d)
    const { p: q } = dias(p, '2026-01-05', 7)
    const semana = (q.lecturas ?? []).filter((l) => l.fecha >= en('2026-01-05').toISOString() && l.fecha < en('2026-01-12').toISOString())
    expect(semana.length).toBe(3)
    expect(new Set(semana.map((l) => l.fecha.slice(0, 10))).size).toBe(3)
    expect(semana.every((l) => l.vecino === 'nox' || l.vecino === 'tuerca')).toBe(true)
  })

  it('una lectura no se repite en 14 días', () => {
    let p = barrio()
    for (let i = 0; i < 40; i++) p = reg(p, 'pasos', 'cuerpo', sumarDias('2026-01-05', i), 8)
    const { p: q } = dias(p, '2026-01-05', 40)
    const constancia = (q.lecturas ?? []).filter((l) => l.clave === 'constancia|cuerpo').map((l) => l.fecha.slice(0, 10))
    for (let i = 1; i < constancia.length; i++) expect(Date.parse(constancia[i]) - Date.parse(constancia[i - 1])).toBeGreaterThanOrEqual(14 * 86_400_000)
    expect((q.lecturas ?? []).some((l) => l.clave === 'hora|manana')).toBe(true)
    expect((q.lecturas ?? []).some((l) => l.clave.startsWith('hito|cuerpo|'))).toBe(true)
  })

  it('el informe de Tuerca cierra la semana con lo hecho; una semana vacía se cierra en silencio', () => {
    let p = barrio()
    for (const d of ['2026-01-05', '2026-01-06', '2026-01-08']) p = reg(p, 'pasos', 'cuerpo', d)
    const inf = informeSemanal(p, en('2026-01-12', 9))!
    expect(inf.semana).toBe('2026-01-05')
    expect(inf.texto).toMatch(/Días con algo: 3\. Retos: 3\./)
    expect(inf.texto).toMatch(/3 ascuas/)
    // El domingo por la noche ya informa de la semana que acaba.
    expect(informeSemanal(p, en('2026-01-11', 20))?.semana).toBe('2026-01-05')
    expect(informeSemanal(p, en('2026-01-19', 9))).toEqual({ semana: '2026-01-12', texto: null })
    const r = leerElDiario(p, en('2026-01-12', 9))
    expect(r.nuevas[0].texto).toMatch(/^Tuerca: «Cierre de semana/)
    expect(informeSemanal(r.partida, en('2026-01-13', 9))).toBeNull()
  })

  it('las cifras del archivo no salen seguidas: como mucho una por semana, y cada área con su frase', () => {
    let p = barrio()
    for (let i = 0; i < 30; i++) for (const [id, a] of [['pasos', 'cuerpo'], ['leer', 'mente'], ['gestion', 'orden']] as const) p = reg(p, id, a, sumarDias('2025-12-01', i), 8 + (i % 3))
    const { p: q } = dias(p, '2026-01-05', 14)
    const hitos = (q.lecturas ?? []).filter((l) => l.clave.startsWith('hito|'))
    expect(hitos.length).toBeLessThanOrEqual(2)
    for (let i = 1; i < hitos.length; i++) expect(Date.parse(hitos[i].fecha) - Date.parse(hitos[i - 1].fecha)).toBeGreaterThanOrEqual(7 * 86_400_000)
    expect(new Set(hitos.map((h) => h.texto)).size).toBe(hitos.length)
  })
})
