// «Tu vida es el guion» (dirección A, 20/11/2026): el barrio lee patrones del diario de retos y los cuenta a
// su manera. Reglas sencillas y explicables: días distintos dentro de una ventana, combinaciones de áreas y
// la vuelta tras un silencio. Solo se miran el tipo de reto, su área y su fecha; nunca los títulos que escribe
// el jugador. Devuelven datos para la historia (por ejemplo, cuántos días) o null si no hay patrón.
import type { AreaId } from '../contenido'
import type { Partida } from './partida'
import { dia, diasEntre, sumarDias } from './fechas'

export type DatosPatron = Record<string, number>
export type Patron = (p: Partida, ahora: Date) => DatosPatron | null

/** Ventana en la que se buscan los patrones (hoy incluido). */
export const VENTANA = 7

/** Retos del catálogo que son salir a andar. */
export const CAMINAR = new Set(['pasos', 'paseo'])

/** Días distintos (en la ventana, hasta hoy) que cumplen una condición sobre las ofrendas. */
function diasCon(p: Partida, ahora: Date, cumple: (o: Partida['ofrendas'][number]) => boolean, ventana = VENTANA): number {
  const hoy = dia(ahora)
  const desde = sumarDias(hoy, -(ventana - 1))
  return new Set(p.ofrendas.filter((o) => { const d = dia(o.fecha); return d >= desde && d <= hoy && cumple(o) }).map((o) => dia(o.fecha))).size
}
const deArea = (a: AreaId) => (o: { area: AreaId }) => o.area === a

export const PATRONES: Record<string, Patron> = {
  /** Has salido a andar al menos cuatro días distintos de la última semana. */
  caminante: (p, ahora) => {
    const dias = diasCon(p, ahora, (o) => CAMINAR.has(o.accionId))
    return dias >= 4 ? { dias } : null
  },
  /** Mente (leer, aprender, crear…) cuatro días distintos de la última semana. */
  lector: (p, ahora) => {
    const dias = diasCon(p, ahora, deArea('mente'))
    return dias >= 4 ? { dias } : null
  },
  /** Gestiones y descansos en la misma semana: dos días de Orden y dos de Calma, como poco. */
  protocolo: (p, ahora) => {
    const orden = diasCon(p, ahora, deArea('orden'))
    const calma = diasCon(p, ahora, deArea('calma'))
    return orden >= 2 && calma >= 2 ? { orden, calma } : null
  },
  /** Vínculos (llamar, quedar, escribir…) tres días distintos de la última semana. */
  contactos: (p, ahora) => {
    const dias = diasCon(p, ahora, deArea('vinculos'))
    return dias >= 3 ? { dias } : null
  },
  /** Retos escritos por ti, tres días distintos de la última semana (solo se mira que son tuyos y su área). */
  secreto: (p, ahora) => {
    const dias = diasCon(p, ahora, (o) => o.accionId.startsWith('propia-'))
    return dias >= 3 ? { dias } : null
  },
  ensayo: (p, ahora) => {
    const dias = diasCon(p, ahora, (o) => o.accionId === 'instrumento')
    return dias >= 2 ? { dias } : null
  },
  pronostico: (p, ahora) => {
    const aire = new Set(p.ofrendas.filter((o) => o.accionId === 'aire').map((o) => dia(o.fecha)))
    const dias = diasCon(p, ahora, (o) => o.accionId === 'agua' && aire.has(dia(o.fecha)))
    return dias >= 2 ? { dias } : null
  },
  cortesia: (p, ahora) => {
    const gastos = diasCon(p, ahora, (o) => o.accionId === 'gastos')
    const gracias = diasCon(p, ahora, (o) => o.accionId === 'gracias')
    return gastos && gracias ? { gastos, gracias } : null
  },
  /** Vuelves tras cuatro días o más sin registrar nada, con un diario que ya tenía historia. */
  reencuentro: (p, ahora) => {
    const hoy = dia(ahora)
    const antes = [...new Set(p.ofrendas.map((o) => dia(o.fecha)).filter((d) => d < hoy))].sort()
    const ultimo = antes.at(-1)
    if (!ultimo || antes.length < 5) return null
    const dias = diasEntre(ultimo, hoy)
    return dias >= 4 ? { dias } : null
  },
}

/** Rellena «{dias}» y compañía con los datos que se guardaron al empezar la historia. */
export const rellenar = (texto: string, datos?: DatosPatron) =>
  datos ? texto.replace(/\{(\w+)\}/g, (_, k: string) => (k in datos ? String(datos[k]) : `{${k}}`)) : texto
