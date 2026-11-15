import type { Momento } from '../contenido'

/** Momento del día según la hora real: 6–10:59 amanecer · 11–17:59 mediodía · 18–21:59 atardecer · resto noche. */
export function momentoDelDia(f: Date): Momento {
  const h = f.getHours()
  if (h >= 6 && h < 11) return 'amanecer'
  if (h >= 11 && h < 18) return 'mediodia'
  if (h >= 18 && h < 22) return 'atardecer'
  return 'noche'
}
