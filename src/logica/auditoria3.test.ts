// Arreglos de la tercera auditoría (20/11/2026).
import { describe, expect, it } from 'vitest'
import { SITUACIONES } from '../contenido/situaciones'
import { crearPartida, type Partida } from './partida'
import { marcarPresentado } from './meses'
import { progreso } from './etapas'
import { cumpleRequisitos, diaDelBarrio, microDeHoy, visitante } from './situaciones'
import { fotoDe } from './momentos'
import { hacerOfrenda } from './ofrendas'
import { aplazarPista, retoQueFalta } from './pista'
import { en } from './test-utils'
import { sumarDias } from './fechas'
import type { CompaneroId } from '../contenido'

const TODOS: CompaneroId[] = ['nox', 'tuerca', 'tofu', 'bruma', 'madeja']
/** Los cinco en el barrio, con el puente inaugurado y lo que se pida construido. */
function barrio(construido: string[] = [], lista = ['pasos', 'gestion', 'leer', 'aire', 'amigo']): Partida {
  const p = crearPartida('nox', en('2026-01-01', 8), lista, true)
  return { ...p, meses: TODOS.map((c) => ({ companero: c, inicio: en('2026-01-01', 8).toISOString(), presentado: en('2026-01-01', 9).toISOString() })),
    situaciones: { puente: { fase: 2, dia: '2026-01-02', fin: true } },
    construcciones: construido.map((objetoId) => ({ objetoId, fecha: en('2026-01-02').toISOString() })) }
}

describe('tercera auditoría', () => {
  it('«La planta» espera a que se decida con quién se queda Gregorio', () => {
    const planta = SITUACIONES.find((s) => s.id === 'planta')!
    const p = { ...barrio(['maceta', 'aspiradora']), situaciones: { puente: { fase: 2, dia: '2026-01-02', fin: true }, gregorio: { fase: 1, dia: '2026-01-03' } } }
    expect(cumpleRequisitos(p, planta, en('2026-01-05'))).toBe(false)
    const decidida = { ...p, situaciones: { ...p.situaciones, gregorio: { fase: 2, dia: '2026-01-04', fin: true, decision: 'nox' } } }
    expect(cumpleRequisitos(decidida, planta, en('2026-01-05'))).toBe(true)
  })

  it('un vecino solo está de visita en un sitio al día, y la casa y el sorteo dicen lo mismo', () => {
    const p = barrio(['banco', 'hoguera', 'tablon', 'maceta'])
    let conVisitas = 0
    for (let i = 0; i < 366; i++) {
      const ahora = en(sumarDias('2026-01-03', i))
      const { visitas, micros } = diaDelBarrio(p, ahora)
      const quienes = Object.values(visitas)
      expect(new Set(quienes).size).toBe(quienes.length)
      for (const c of TODOS) {
        expect(visitas[c]).not.toBe(c)
        if (micros[c]?.visita) expect(visitante(p, c, ahora)).toBe(micros[c]!.visita)
        expect(microDeHoy(p, c, ahora)).toBe(micros[c] ?? null)
      }
      if (quienes.length) conVisitas++
    }
    expect(conVisitas).toBeGreaterThan(50)
  })

  it('la foto guarda al visitante de la escena y cómo era', () => {
    const p = { ...barrio(['banco']), etapasVistas: { tuerca: 2 as const } }
    let dia = ''
    for (let i = 0; i < 200 && !dia; i++) { const d = sumarDias('2026-01-03', i); if (microDeHoy(p, 'nox', en(d))?.visita === 'tuerca') dia = d }
    expect(dia).not.toBe('')
    const foto = fotoDe(p, 'nox', en(dia))
    expect(foto.visita).toBe('tuerca')
    expect(foto.visitaEtapa).toBe(progreso(p, 'tuerca', en(dia)).etapa)
    expect(foto.visitaEtapa).toBe(2)
  })

  it('el orden en que tachas no decide quién encuentra algo', () => {
    const p = barrio([], ['pasos', 'amigo'])
    const quien = (orden: string[]) => {
      let q = p, hallado: string | undefined
      for (const id of orden) { const r = hacerOfrenda(q, id, en('2026-01-10', 10), () => 0, id); q = r.partida; hallado ??= r.sorpresa?.vecino }
      return hallado
    }
    expect(quien(['pasos', 'amigo'])).toBe(quien(['amigo', 'pasos']))
    // Y se reparte: el que encontró algo deja paso al otro al día siguiente.
    let q = p
    const halladores: string[] = []
    for (let i = 0; i < 4; i++) for (const id of ['pasos', 'amigo']) {
      const r = hacerOfrenda(q, id, en(sumarDias('2026-01-10', i), 10), () => 0, `${id}${i}`)
      q = r.partida
      if (r.sorpresa) halladores.push(r.sorpresa.vecino)
    }
    expect(halladores).toHaveLength(4)
    expect(new Set(halladores)).toEqual(new Set(['nox', 'madeja']))
  })

  it('«Luego» deja la petición hasta mañana', () => {
    let p = crearPartida('nox', en('2026-01-01', 8), ['leer'], true)
    p = marcarPresentado({ ...p, ofrendas: [9, 10, 11].map((h) => ({ id: `l${h}`, accionId: 'leer', area: 'mente' as const, fecha: en('2026-01-01', h).toISOString(), diaMalo: false })) }, en('2026-01-01', 12))
    expect(retoQueFalta(p, en('2026-01-02', 9))).not.toBeNull()
    p = aplazarPista(p, 'nox', en('2026-01-02', 9))
    expect(retoQueFalta(p, en('2026-01-02', 20))).toBeNull()
    expect(retoQueFalta(p, en('2026-01-03', 9))).not.toBeNull()
  })
})
