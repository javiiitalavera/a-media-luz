import { describe, expect, it } from 'vitest'
import { crearPartida } from './partida'
import { estacionDelDia, gradoAmistad, HITOS_AMISTAD, puedeSaludar, recordarSaludo, registrarTrato, saludoDeLlegada, tiempoDelDia } from './convivencia'

const fecha = (dia: string) => new Date(dia + 'T12:00:00')
const base = () => crearPartida('nox', fecha('2026-11-16'), [], true)

describe('convivencia: afecto y clima sin obligaciones', () => {
  it('acariciar muchas veces no sube la amistad dos veces en la misma semana', () => {
    const p = base()
    const uno = registrarTrato(p, 'nox', 'caricia', fecha('2026-11-16'))
    expect(uno.partida.relaciones?.nox?.confianza).toBe(1)
    const otra = registrarTrato(uno.partida, 'nox', 'caricia', fecha('2026-11-19'))
    expect(otra.partida).toBe(uno.partida)
    expect(gradoAmistad(otra.partida, 'nox')).toBe(0)
  })

  it('mezclar tipos permite hitos silenciosos sin superar tres por semana', () => {
    let p = base()
    const acciones = ['visita', 'caricia', 'merienda', 'juguete'] as const
    for (const tipo of acciones) p = registrarTrato(p, 'nox', tipo, fecha('2026-11-16')).partida
    expect(p.relaciones?.nox?.confianza).toBe(3)
    expect(gradoAmistad(p, 'nox')).toBe(1)
    expect(p.relaciones?.nox?.tipos).toHaveLength(3)
    expect(gradoAmistad(p, 'tofu')).toBe(0)
    expect(HITOS_AMISTAD[0]).toBe(3)
  })

  it('la siguiente semana conserva confianza y permite nuevas formas de trato', () => {
    let p = base()
    for (const tipo of ['visita', 'caricia', 'merienda'] as const) p = registrarTrato(p, 'nox', tipo, fecha('2026-11-16')).partida
    const proxima = registrarTrato(p, 'nox', 'visita', fecha('2026-11-23'))
    expect(proxima.partida.relaciones?.nox).toMatchObject({ confianza: 4, tipos: ['visita'], semana: '2026-11-23' })
    expect(proxima.nuevoHito).toBe(0)
    p = proxima.partida
    for (const tipo of ['caricia', 'merienda'] as const) p = registrarTrato(p, 'nox', tipo, fecha('2026-11-23')).partida
    const otra = registrarTrato(p, 'nox', 'visita', fecha('2026-11-30'))
    expect(otra.partida.relaciones?.nox?.confianza).toBe(7)
    expect(registrarTrato(otra.partida, 'nox', 'caricia', fecha('2026-11-30')).nuevoHito).toBe(2)
  })

  it('no cambia los materiales, metas ni las ofrendas al jugar', () => {
    const p = { ...base(), metas: { subidas: { pasos: '2026-11-12' } } }
    const r = registrarTrato(p, 'nox', 'merienda', fecha('2026-11-16')).partida
    expect(r.ofrendas).toEqual(p.ofrendas)
    expect(r.construcciones).toEqual(p.construcciones)
    expect(r.metas).toEqual(p.metas)
  })

  it('clima ficticio consistente para las cinco casas y el mapa', () => {
    const f = fecha('2026-11-21')
    expect(tiempoDelDia(f)).toBe(tiempoDelDia(new Date('2026-11-21T19:45:00')))
    expect(estacionDelDia(fecha('2026-02-10'))).toBe('invierno')
    expect(estacionDelDia(fecha('2026-04-10'))).toBe('primavera')
    expect(estacionDelDia(fecha('2026-07-10'))).toBe('verano')
    expect(estacionDelDia(fecha('2026-10-10'))).toBe('otono')
    expect(['despejado', 'lluvia', 'niebla', 'viento']).toContain(tiempoDelDia(f))
  })

  it('volver del barrio a los dos minutos no repite el saludo, pero sí dos horas después', () => {
    const f = new Date('2026-11-21T08:00:00')
    expect(puedeSaludar(base(), 'nox', f)).toBe(true)
    const visto = recordarSaludo(base(), 'nox', f)
    expect(puedeSaludar(visto, 'nox', new Date('2026-11-21T08:02:00'))).toBe(false)
    expect(puedeSaludar(visto, 'tofu', new Date('2026-11-21T08:02:00'))).toBe(true)
    expect(recordarSaludo(visto, 'nox', new Date('2026-11-21T08:02:00'))).toBe(visto)
    expect(puedeSaludar(visto, 'nox', new Date('2026-11-21T10:01:00'))).toBe(true)
  })

  it('el saludo reutiliza frases válidas y cambia con la confianza', () => {
    const f = fecha('2026-11-21')
    for (const c of ['nox', 'tofu', 'bruma', 'madeja', 'tuerca'] as const) {
      expect(saludoDeLlegada(base(), c, f).length).toBeGreaterThan(5)
    }
    const p = { ...base(), relaciones: { nox: { semana: '2026-11-16', tipos: ['visita' as const], confianza: 9 } } }
    expect(gradoAmistad(p, 'nox')).toBe(2)
    expect(saludoDeLlegada(p, 'nox', f).length).toBeGreaterThan(5)
  })
})
