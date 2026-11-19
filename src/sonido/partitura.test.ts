import { describe, expect, it } from 'vitest'
import { compas, ESTILOS, frecuencia, segundosPorPulso } from './partitura'

describe('partitura del barrio', () => {
  it('afina la a 440 Hz y do central a 261,6 Hz', () => {
    expect(frecuencia(69)).toBe(440)
    expect(frecuencia(60)).toBeCloseTo(261.63, 1)
  })

  it('cada arreglo tiene armonía y melodía de la misma longitud y vuelve al inicio', () => {
    for (const estilo of Object.values(ESTILOS)) {
      expect(estilo.tema).toHaveLength(estilo.acordes.length)
      expect(compas(estilo, estilo.tema.length)).toEqual(compas(estilo, 0))
      for (let i = 0; i < estilo.tema.length; i++) {
        const c = compas(estilo, i)
        expect(c.acorde.length).toBeGreaterThanOrEqual(3)
        let previo = -1
        for (const [pulso, midi] of c.melodia) {
          expect(pulso).toBeGreaterThan(previo)
          expect(pulso).toBeLessThan(estilo.pulsos)
          expect(midi).toBeGreaterThan(c.bajo)
          previo = pulso
        }
      }
    }
  })

  it('las cuatro piezas del día duran más de 35 segundos y la noche tiene más espacio', () => {
    for (const [nombre, estilo] of Object.entries(ESTILOS)) {
      if (nombre !== 'apagada') expect(segundosPorPulso(estilo) * estilo.pulsos * estilo.tema.length).toBeGreaterThan(35)
    }
    const notasPorPulso = (e: typeof ESTILOS.noche) => e.tema.reduce((s, c) => s + c.length, 0) / (e.tema.length * e.pulsos)
    expect(notasPorPulso(ESTILOS.noche)).toBeLessThan(notasPorPulso(ESTILOS.mediodia))
    expect(ESTILOS.noche.brillo).toBeLessThan(ESTILOS.mediodia.brillo)
    expect(ESTILOS.apagada.volumen).toBeLessThan(ESTILOS.noche.volumen)
  })
})
