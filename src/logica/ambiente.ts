// Clima del bosque: microacontecimientos optativos que nunca requieren volver ni conceden materiales.
// Reglas puras, derivadas exclusivamente de la fecha local y del clima ficticio del día.
import { azarConSemilla } from './azar'
import { dia } from './fechas'
import { estacionDelDia, tiempoDelDia, type EstacionBarrio, type TiempoBarrio } from './convivencia'

export type FenomenoBarrio = 'petalos' | 'motas' | 'hojas' | 'escarcha' | 'gotas' | 'brillos' | 'remolino'
export type ReaccionClimaObjeto = 'humo' | 'gotas' | 'ondas' | 'aire' | 'vaho' | 'halo'

/** No hay calendario de premios, cuenta atrás ni eventos perdibles: solo cambian los días. */
export function fenomenoDelDia(ahora: Date): FenomenoBarrio | null {
  const semilla = dia(ahora)
  const azar = azarConSemilla('fenomeno-ambiente-v1|' + semilla)()
  if (azar >= .38) return null
  const tiempo = tiempoDelDia(ahora)
  const estacion = estacionDelDia(ahora)
  if (tiempo === 'lluvia') return 'gotas'
  if (tiempo === 'niebla') return 'brillos'
  if (tiempo === 'viento') return estacion === 'otono' ? 'hojas' : 'remolino'
  const deEstacion: Record<EstacionBarrio, FenomenoBarrio> = {
    primavera: 'petalos',
    verano: 'motas',
    otono: 'hojas',
    invierno: 'escarcha',
  }
  return deEstacion[estacion]
}

/** Objetos concretos cambian de comportamiento según el tiempo.
 * La regla se activa únicamente si la construcción existe y está visible; no persiste datos.
 * El efecto vive dentro de la propia caja del mueble, por lo que sigue su posición. */
export function reaccionObjetoPorClima(
  objetoId: string,
  tiempo: TiempoBarrio,
  estacion: EstacionBarrio,
): ReaccionClimaObjeto | null {
  if (tiempo === 'lluvia') {
    const lluviosos: Record<string, ReaccionClimaObjeto> = {
      hoguera: 'humo', maceta: 'gotas', loto: 'ondas',
      tarro: 'gotas', 'tetera-rosa': 'vaho',
    }
    return lluviosos[objetoId] ?? null
  }
  if (tiempo === 'viento') {
    const ventosos: Record<string, ReaccionClimaObjeto> = {
      cometa: 'aire', campanillas: 'aire', guirnalda: 'aire',
      'farol-papel': 'aire', cajas: 'aire', papeles: 'aire',
    }
    return ventosos[objetoId] ?? null
  }
  if (tiempo === 'niebla') {
    const neblinosos: Record<string, ReaccionClimaObjeto> = {
      telescopio: 'vaho', lampara: 'halo', 'farol-luna': 'halo',
      loto: 'halo', marco: 'vaho',
    }
    return neblinosos[objetoId] ?? null
  }
  // Los días claros también cambian el aspecto de algunos objetos, sin pedir que los toques.
  if (estacion === 'invierno' && objetoId === 'hoguera') return 'halo'
  if (estacion === 'verano' && objetoId === 'tarro') return 'halo'
  return null
}
