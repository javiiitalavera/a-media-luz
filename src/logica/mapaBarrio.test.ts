import { describe, expect, it } from 'vitest'
import { CASITAS, PARCELAS, PROPORCION_BARRIO } from '../contenido/barrio'
import { colocarCasita } from './mapaBarrio'

describe('Colocación de las casas del barrio', () => {
  it('apoya la entrada del dibujo en las coordenadas de la parcela', () => {
    const parcela = PARCELAS[1]
    const casa = colocarCasita(parcela, 'tuerca')
    const { apoyo } = CASITAS.tuerca

    expect(casa.x + casa.ancho * apoyo.x / 100).toBeCloseTo(parcela.x)
    expect(casa.y + casa.alto * apoyo.y / 100).toBeCloseTo(parcela.y)
  })

  it.each([360, 375, 390])('reduce la casa y la mantiene visible a %i px', (anchoPantalla) => {
    const anchoMapa = 844 * PROPORCION_BARRIO
    const hueco = { ancho: 100 * anchoPantalla / anchoMapa, margen: 800 / anchoMapa }
    const bordeVisible = (100 - hueco.ancho) / 2
    const parcela = PARCELAS[2]
    const casa = colocarCasita(parcela, 'tofu', hueco)

    expect(casa.ancho).toBeLessThan(parcela.ancho)
    expect(casa.x).toBeGreaterThanOrEqual(bordeVisible + hueco.margen)
    expect(casa.x + casa.ancho).toBeLessThanOrEqual(100 - bordeVisible - hueco.margen)
    expect(casa.y + casa.alto * CASITAS.tofu.apoyo.y / 100).toBeCloseTo(parcela.y)
  })
})
