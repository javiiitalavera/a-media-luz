// Días en hora local, como claves 'AAAA-MM-DD'.
export type Dia = string
const dos = (n: number) => String(n).padStart(2, '0')

export function dia(f: Date | string): Dia {
  const d = typeof f === 'string' ? new Date(f) : f
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`
}
/** Días de calendario de a hasta b (inmune a cambios de hora). */
export function diasEntre(a: Dia, b: Dia): number {
  const [y1, m1, d1] = a.split('-').map(Number)
  const [y2, m2, d2] = b.split('-').map(Number)
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000)
}
export function sumarDias(d: Dia, n: number): Dia {
  const [y, m, dd] = d.split('-').map(Number)
  const f = new Date(y, m - 1, dd + n)
  return dia(f)
}
/** Lunes de la semana de un día. */
export function lunes(d: Dia): Dia {
  const [y, m, dd] = d.split('-').map(Number)
  const dow = (new Date(y, m - 1, dd).getDay() + 6) % 7
  return sumarDias(d, -dow)
}
