import { describe, expect, it } from 'vitest'
import { PATRONES, rellenar } from './patrones'
import { avanzar, cronicas, decisionPendiente, ecosDe, decidir, fraseDeSituacion, huellasEn } from './situaciones'
import { gruposDeCharla } from './charla'
import { crearPartida, type Partida } from './partida'
import { en } from './test-utils'
import { sumarDias } from './fechas'
import type { AreaId } from '../contenido'

/** Nox y Tuerca nacidos y presentados, sin nada construido. */
function barrio(): Partida {
  let p = crearPartida('nox', en('2026-01-01', 8), undefined, true)
  p = { ...p, meses: [{ companero: 'nox', inicio: en('2026-01-01', 8).toISOString(), presentado: en('2026-01-01', 9).toISOString() },
    { companero: 'tuerca', inicio: en('2026-01-02', 8).toISOString(), presentado: en('2026-01-02', 9).toISOString() }], ofrendas: [] }
  return p
}
let n = 0
/** Un registro de un reto en un día. */
const registro = (p: Partida, accionId: string, area: AreaId, d: string, hora = 10): Partida =>
  ({ ...p, ofrendas: [...p.ofrendas, { id: `r${++n}`, accionId, area, fecha: en(d, hora).toISOString(), diaMalo: false }] })
const dias = (desde: string, cuantos: number) => Array.from({ length: cuantos }, (_, i) => sumarDias(desde, i))

describe('el barrio lee tu diario', () => {
  it('caminante: cuatro días distintos andando en una semana; varios registros el mismo día no son costumbre', () => {
    let p = barrio()
    for (let i = 0; i < 6; i++) p = registro(p, 'pasos', 'cuerpo', '2026-01-10', 8 + i)
    expect(PATRONES.caminante(p, en('2026-01-10', 20))).toBeNull()
    p = barrio()
    for (const d of ['2026-01-05', '2026-01-07', '2026-01-08', '2026-01-10']) p = registro(p, 'paseo', 'calma', d)
    expect(PATRONES.caminante(p, en('2026-01-10', 20))).toEqual({ dias: 4 })
    // Fuera de la ventana de siete días ya no cuenta.
    expect(PATRONES.caminante(p, en('2026-01-13', 20))).toBeNull()
    // Otro reto de Energía (fuerza) no es andar.
    let q = barrio()
    for (const d of dias('2026-01-05', 5)) q = registro(q, 'fuerza', 'cuerpo', d)
    expect(PATRONES.caminante(q, en('2026-01-09', 20))).toBeNull()
  })

  it('protocolo, contactos y secreto: combinaciones y retos propios (solo se mira que son tuyos)', () => {
    let p = barrio()
    for (const d of ['2026-01-05', '2026-01-06']) p = registro(p, 'gestion', 'orden', d)
    expect(PATRONES.protocolo(p, en('2026-01-07'))).toBeNull()
    for (const d of ['2026-01-06', '2026-01-07']) p = registro(p, 'meditar', 'calma', d)
    expect(PATRONES.protocolo(p, en('2026-01-07'))).toEqual({ orden: 2, calma: 2 })
    let q = barrio()
    for (const d of dias('2026-01-05', 3)) q = registro(q, 'propia-xyz', 'mente', d)
    expect(PATRONES.secreto(q, en('2026-01-07'))).toEqual({ dias: 3 })
    expect(PATRONES.contactos(q, en('2026-01-07'))).toBeNull()
  })

  it('reencuentro: vuelves tras cuatro días sin registrar, con un diario que ya tenía historia', () => {
    let p = barrio()
    for (const d of dias('2026-01-01', 3)) p = registro(p, 'leer', 'mente', d)
    expect(PATRONES.reencuentro(p, en('2026-01-10'))).toBeNull() // poca historia aún
    for (const d of dias('2026-01-04', 3)) p = registro(p, 'leer', 'mente', d)
    expect(PATRONES.reencuentro(p, en('2026-01-08'))).toBeNull() // solo dos días
    expect(PATRONES.reencuentro(p, en('2026-01-12'))).toEqual({ dias: 6 })
  })

  it('una historia de tu diario empieza sola, cuenta tus datos, deja huellas y su remate no avisa en el sobre', () => {
    let p = barrio()
    for (const d of ['2026-01-05', '2026-01-07', '2026-01-08', '2026-01-10']) p = registro(p, 'pasos', 'cuerpo', d)
    p = avanzar(p, en('2026-01-10', 20)).partida
    expect(p.situaciones!.asesoria).toMatchObject({ fase: 0, datos: { dias: 4 } })
    expect(p.noticias!.at(-1)!.texto).toMatch(/ASESORÍA DE PASEOS/)
    expect(fraseDeSituacion(p, 'nox', en('2026-01-10', 21))![0]).toMatch(/^4 días/)
    expect(huellasEn(p, 'barrio').map((h) => h.id)).toContain('cartel-asesoria')
    // Una vez empezada, sigue aunque dejes de andar (lo ocurrido no cambia al recargar).
    for (const d of ['2026-01-11', '2026-01-12']) p = avanzar(p, en(d, 10)).partida
    const avisos = p.noticias!.length
    p = avanzar(p, en('2026-01-13', 10)).partida
    expect(p.situaciones!.asesoria.fin).toBe(true)
    expect(p.noticias!.length).toBe(avisos) // el remate se descubre paseando
    expect(huellasEn(p, 'barrio').map((h) => h.id)).toContain('cartel-tarifas')
    expect(cronicas(p).find((c) => c.id === 'asesoria')!.fases.at(-1)).toMatch(/tarifas/)
    // Y queda como eco en la charla, sin volver a empezar.
    expect(ecosDe(p, 'nox')).toHaveLength(1)
    expect(gruposDeCharla(p, 'nox', en('2026-01-20', 13))).toContainEqual(ecosDe(p, 'nox')[0])
    for (const d of ['2026-01-14', '2026-01-16', '2026-01-17', '2026-01-18']) p = registro(p, 'pasos', 'cuerpo', d)
    expect(avanzar(p, en('2026-01-18', 20)).partida.situaciones!.asesoria.fin).toBe(true)
  })

  it('el reencuentro te deja decidir a quién se lo cuentas', () => {
    let p = barrio()
    for (const d of dias('2026-01-01', 6)) p = registro(p, 'leer', 'mente', d)
    p = avanzar(p, en('2026-01-12', 9)).partida
    expect(p.situaciones!.reencuentro.datos).toEqual({ dias: 6 })
    expect(p.noticias!.at(-1)!.texto).toMatch(/SE BUSCA/)
    p = avanzar(p, en('2026-01-13', 9)).partida
    expect(decisionPendiente(p, 'nox')?.situacion).toBe('reencuentro')
    p = decidir(p, 'reencuentro', 'tofu')!
    p = avanzar(p, en('2026-01-14', 9)).partida
    expect(p.noticias!.at(-1)!.texto).toMatch(/Tofu ha guardado/)
  })

  it('rellena los datos y deja como están las llaves que no conoce', () => {
    expect(rellenar('{dias} días, {otra}', { dias: 3 })).toBe('3 días, {otra}')
  })
})
