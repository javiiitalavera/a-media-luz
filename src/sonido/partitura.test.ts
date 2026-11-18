import { describe, expect, it } from 'vitest'
import { azarConSemilla } from '../logica/azar'
import { ESTILOS, frecuencia, generarCompas } from './partitura'

describe('música generativa', () => {
  it('la4 = 440 Hz y do central ≈ 261,6 Hz', () => {
    expect(frecuencia(69)).toBe(440)
    expect(frecuencia(60)).toBeCloseTo(261.63, 1)
  })
  it('sigue la progresión de acordes en bucle', () => {
    const e = ESTILOS.atardecer
    const azar = azarConSemilla('x')
    expect(generarCompas(e, 0, azar).acorde).toEqual(e.progresion[0])
    expect(generarCompas(e, 5, azar).acorde).toEqual(e.progresion[1])
    expect(generarCompas(e, 0, azar).bajo).toBe(e.progresion[0][0] - 12)
  })
  it('la melodía usa solo notas de la escala, sin repetir seguidas ni corcheas pegadas', () => {
    for (const [nombre, e] of Object.entries(ESTILOS)) {
      const azar = azarConSemilla(nombre)
      let ultima: number | undefined
      for (let i = 0; i < 200; i++) {
        const c = generarCompas(e, i, azar, ultima)
        for (const [k, n] of c.melodia.entries()) {
          expect(e.escala).toContain(n.midi)
          if (k > 0) {
            expect(n.midi).not.toBe(c.melodia[k - 1].midi)
            expect(n.pulso - c.melodia[k - 1].pulso).toBeGreaterThanOrEqual(1)
          } else if (ultima !== undefined) {
            expect(n.midi).not.toBe(ultima)
          }
        }
        ultima = c.melodia.at(-1)?.midi ?? ultima
      }
    }
  })
  it('la noche es más lenta, oscura y escasa que el mediodía; la casa apagada, casi silencio', () => {
    const notas = (e: typeof ESTILOS.noche, semilla: string) => {
      const azar = azarConSemilla(semilla)
      return Array.from({ length: 400 }, (_, i) => generarCompas(e, i, azar).melodia.length).reduce((a, b) => a + b, 0)
    }
    expect(ESTILOS.noche.bpm).toBeLessThan(ESTILOS.mediodia.bpm)
    expect(ESTILOS.noche.brillo).toBeLessThan(ESTILOS.mediodia.brillo)
    expect(notas(ESTILOS.noche, 'a')).toBeLessThan(notas(ESTILOS.mediodia, 'a'))
    expect(notas(ESTILOS.apagada, 'a')).toBeLessThan(notas(ESTILOS.noche, 'a') / 2)
    expect(ESTILOS.noche.volumen).toBeLessThan(ESTILOS.mediodia.volumen)
    expect(ESTILOS.apagada.volumen).toBeLessThan(ESTILOS.noche.volumen)
  })
})
