import { describe, expect, it } from 'vitest'
import { exportarCopia, importarCopia } from './copia'
import { crearPartida } from './partida'
import { fotoDe } from './momentos'
import { en } from './test-utils'

const ahora = en('2026-11-19', 15)
const envolver = (partida: object) => JSON.stringify({ app: 'a-media-luz', version: 1, partida })

describe('copias de seguridad', () => {
  it('conserva el cuestionario, las historias, las fotos y los avisos de una copia actual', () => {
    const p = {
      ...crearPartida('bruma', ahora, undefined, true),
      perfil: { mejorar: ['calma' as const], actividad: 'poco' as const },
      situaciones: { normativa: { fase: 0, dia: '2026-11-19' } },
      momentos: [{ id: 'foto', fecha: ahora.toISOString(), titulo: 'Una visita', texto: '', escena: fotoDe(crearPartida('bruma', ahora), 'bruma', ahora) }],
      vistos: { album: ahora.toISOString(), micros: { bruma: '2026-11-19' } },
    }
    expect(importarCopia(exportarCopia(p, ahora))).toEqual(p)
  })

  it('sigue aceptando partidas anteriores a los vecinos y a los retos concretos', () => {
    const { hazanas: _hazanas, construcciones: _construcciones, ...antigua } = crearPartida('nox', ahora)
    expect(importarCopia(envolver(antigua))).toMatchObject({ principal: 'nox', hazanas: 3, construcciones: [] })
  })

  it('rechaza datos incompletos que romperían el barrio o el Álbum', () => {
    const p = crearPartida('nox', ahora, undefined, true)
    for (const campos of [
      { meses: [] },
      { meses: [{ companero: 'gato', inicio: p.inicio }] },
      { situaciones: { normativa: { fase: 99, dia: '2026-11-19' } } },
      { situaciones: { normativa: null } },
      { noticias: {} },
      { momentos: [{ id: 'foto', fecha: p.inicio, titulo: 'Una visita', texto: '', escena: null }] },
      { perfil: { mejorar: null } },
    ]) {
      expect(importarCopia(envolver({ ...p, ...campos }))).toBeNull()
    }
  })
})
