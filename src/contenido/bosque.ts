// El mapa del bosque: un claro por mes, del 1 (abajo) al 12 (arriba).
// Centro de cada claro y su ancho, en % del mapa (public/arte/bosque/mapa.webp, 1024 × 1536).

export const PROPORCION_MAPA = 1024 / 1536

export const CLAROS: { x: number; y: number; ancho: number }[] = [
  { x: 31.2, y: 78.3, ancho: 25.8 },
  { x: 68.6, y: 78.5, ancho: 23.3 },
  { x: 26.5, y: 66.8, ancho: 22.2 },
  { x: 72.3, y: 66.0, ancho: 23.0 },
  { x: 37.3, y: 55.5, ancho: 22.2 },
  { x: 66.8, y: 52.5, ancho: 21.9 },
  { x: 81.7, y: 41.3, ancho: 21.7 },
  { x: 18.0, y: 37.5, ancho: 21.1 },
  { x: 64.2, y: 30.0, ancho: 21.1 },
  { x: 26.2, y: 26.1, ancho: 21.0 },
  { x: 70.6, y: 16.9, ancho: 19.8 },
  { x: 33.4, y: 14.3, ancho: 19.9 },
]
