import { CASITAS, PARCELAS, PROPORCION_BARRIO } from '../contenido/barrio'
import type { CompaneroId } from '../contenido'

/** Rectángulo del dibujo en porcentajes del mapa. El recorte afecta al ancho antes de mover su apoyo. */
export function colocarCasita(
  parcela: (typeof PARCELAS)[number],
  vecino: CompaneroId,
  hueco = { margen: 0, ancho: 100 },
  huevo = false,
) {
  const casita = CASITAS[vecino]
  const escala = Math.min(1, Math.max(0.88, hueco.ancho / 77))
  const ancho = Math.min(parcela.ancho * (huevo ? 0.55 : escala), hueco.ancho - 2 * hueco.margen)
  const alto = ancho * PROPORCION_BARRIO / casita.proporcion
  const libre = (100 - hueco.ancho) / 2 + hueco.margen
  const apoyo = huevo ? { x: 50, y: 68 } : casita.apoyo
  const x = Math.min(Math.max(parcela.x - ancho * apoyo.x / 100, libre), 100 - libre - ancho)
  const y = parcela.y - alto * apoyo.y / 100
  return { x, y, ancho, alto }
}
