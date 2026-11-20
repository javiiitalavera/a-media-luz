import { describe, expect, it } from 'vitest'
import { fotoDe, momentoSubirNivel, momentoNacimiento, momentosDeHistorias, momentosRecientes, tituloMomento } from './momentos'
import { crearPartida, type Partida } from './partida'
import { avanzar } from './situaciones'
import { en } from './test-utils'

function barrio(construido: string[]): Partida {
  let p = crearPartida('nox', en('2026-01-05', 8), undefined, true)
  p = { ...p, meses: [...p.meses!, { companero: 'tuerca', inicio: en('2026-01-06', 8).toISOString(), presentado: en('2026-01-06', 8).toISOString() }] }
  const a = p.acciones[0]
  const ofrendas = Array.from({ length: 6 }, (_, i) => ({ id: 'n' + i, accionId: a.id, area: a.area, fecha: en('2026-01-06', 9 + i).toISOString(), diaMalo: false }))
  return { ...p, ofrendas, construcciones: construido.map((objetoId) => ({ objetoId, fecha: en('2026-01-06').toISOString() })) }
}

describe('momentos del Álbum', () => {
  it('la foto guarda cómo estaba la casa (lo construido y las huellas)', () => {
    const p = avanzar(barrio(['hoguera', 'banco']), en('2026-01-07', 10)).partida
    const f = fotoDe(p, 'nox', en('2026-01-07', 22))
    expect(f.objetos).toEqual(['hoguera', 'banco'])
    expect(f.huellas).toEqual(['cartel-fuego'])
    expect(f.momentoDia).toBe('noche')
  })

  it('nacer y crecer dejan su foto, una sola vez', () => {
    let p = momentoNacimiento(barrio([]), 'tuerca', en('2026-01-06', 12))
    p = momentoNacimiento(p, 'tuerca', en('2026-01-07', 12))
    p = momentoSubirNivel(p, 'tuerca', 2, en('2026-01-08', 12))
    p = momentoSubirNivel(p, 'tuerca', 5, en('2026-02-10', 12))
    expect(momentosRecientes(p).map((m) => m.id)).toEqual(['crece-tuerca-4', 'crece-tuerca-1', 'nace-tuerca'])
    expect(p.momentos![1].escena.etapa).toBe(1)
    expect(p.momentos![2].escena.etapa).toBe(2)
    expect(tituloMomento({ ...p.momentos![1], titulo: 'Tuerca ya es joven' })).toBe('Tuerca alcanza el nivel 2')
  })

  it('una historia que termina deja su foto en el sitio de su final', () => {
    let p = barrio(['hoguera'])
    let antes = p
    for (const d of ['07', '08', '09']) { antes = p; p = avanzar(p, en(`2026-01-${d}`, 10)).partida }
    expect(momentosDeHistorias(barrio(['hoguera']), avanzar(barrio(['hoguera']), en('2026-01-07', 10)).partida, en('2026-01-07')).momentos ?? []).toHaveLength(0)
    const con = momentosDeHistorias(antes, p, en('2026-01-09', 12))
    expect(con.momentos).toHaveLength(1)
    expect(con.momentos![0]).toMatchObject({ id: 'historia-normativa', escena: { lugar: 'nox' } })
    expect(con.momentos![0].escena.huellas).toContain('extintor')
  })
})
