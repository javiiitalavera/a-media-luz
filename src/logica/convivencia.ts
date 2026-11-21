// El barrio responde a tus visitas, a cómo tratas a los vecinos y al tiempo de cada día.
// Reglas puras: no concede materiales, no exige entrar, no muestra barras ni rachas.
import { FRASES, type CompaneroId } from '../contenido'
import type { Partida } from './partida'
import { azarConSemilla } from './azar'
import { dia, lunes } from './fechas'
import { momentoDelDia } from './momento'

export type TipoTrato = 'visita' | 'caricia' | 'merienda' | 'juguete'
export type RelacionVecino = { semana: string; tipos: TipoTrato[]; confianza: number }
const TIPOS_POR_SEMANA = 3 // Repetir cuarenta veces un gesto no crea confianza.
export const HITOS_AMISTAD = [3, 8] as const

export function gradoAmistad(p: Partida, vecino: CompaneroId): 0 | 1 | 2 {
  const n = p.relaciones?.[vecino]?.confianza ?? 0
  return n >= HITOS_AMISTAD[1] ? 2 : n >= HITOS_AMISTAD[0] ? 1 : 0
}

/** Cuenta tipos distintos por semana (máximo tres). Al pasar la semana no se pierde confianza. */
export function registrarTrato(p: Partida, vecino: CompaneroId, tipo: TipoTrato, ahora: Date): {
  partida: Partida; nuevoHito: 0 | 1 | 2
} {
  const semana = lunes(dia(ahora))
  const anterior = p.relaciones?.[vecino]
  const tipos = anterior?.semana === semana ? anterior.tipos : []
  if (tipos.includes(tipo) || tipos.length >= TIPOS_POR_SEMANA) return { partida: p, nuevoHito: 0 }
  const anteriorGrado = gradoAmistad(p, vecino)
  const relacion: RelacionVecino = { semana, tipos: [...tipos, tipo], confianza: (anterior?.confianza ?? 0) + 1 }
  const partida = { ...p, relaciones: { ...p.relaciones, [vecino]: relacion } }
  const nuevoGrado = gradoAmistad(partida, vecino)
  return { partida, nuevoHito: nuevoGrado > anteriorGrado ? nuevoGrado : 0 }
}

export type TiempoBarrio = 'despejado' | 'lluvia' | 'niebla' | 'viento'
export type EstacionBarrio = 'primavera' | 'verano' | 'otono' | 'invierno'
export function estacionDelDia(ahora: Date): EstacionBarrio {
  const mes = ahora.getMonth() + 1
  if (mes >= 3 && mes <= 5) return 'primavera'
  if (mes >= 6 && mes <= 8) return 'verano'
  if (mes >= 9 && mes <= 11) return 'otono'
  return 'invierno'
}

/** Clima FICTICIO del bosque: mismo día = mismo tiempo, sin geolocalización ni servicios externos. */
export function tiempoDelDia(ahora: Date): TiempoBarrio {
  const r = azarConSemilla('tiempo-barrio|' + dia(ahora))()
  const estacion = estacionDelDia(ahora)
  if (estacion === 'verano') return r < .62 ? 'despejado' : r < .79 ? 'viento' : r < .94 ? 'lluvia' : 'niebla'
  if (estacion === 'invierno') return r < .28 ? 'despejado' : r < .54 ? 'niebla' : r < .82 ? 'lluvia' : 'viento'
  return r < .45 ? 'despejado' : r < .70 ? 'lluvia' : r < .86 ? 'viento' : 'niebla'
}

// Dos relaciones distintas. Los hitos los cuenta el comportamiento, no una pantalla de estadísticas.
export const GESTOS_DE_AMISTAD: Record<CompaneroId, [string, string]> = {
  nox: ['Te he dejado el lado bueno del banco. No preguntes cuál.', 'He calentado tu sitio antes de que llegaras. Era para mí, pero vale.'],
  tofu: ['He guardado una página para cuando vuelvas.', 'Puedes tocar el brote. Una vez. Lo digo en serio.'],
  bruma: ['Hay una nubecita con tu forma. No hagas preguntas.', 'Hoy te he reservado el lado tranquilo del estanque.'],
  madeja: ['He hecho un ovillo de tus visitas. Ya tengo para una bufanda.', 'Te he tejido un sitio en el sofá. Lo he probado. Funciona.'],
  tuerca: ['Tu expediente ya tiene carpeta propia. No se lo digas a los demás.', 'Te he dado una copia de mi etiqueta favorita. La original sigue bajo llave.'],
}
export const REACCIONES_TIEMPO: Record<CompaneroId, Partial<Record<TiempoBarrio, string>>> = {
  nox: { lluvia: 'Llueve. La hoguera y yo estamos en desacuerdo.', niebla: 'No veo el banco. Lo sé porque me he sentado en el suelo.', viento: 'Si la cola echa chispas, hoy es culpa del viento.' },
  tofu: { lluvia: 'La planta está encantada. Yo no me he pronunciado.', niebla: 'Hoy el paisaje está editado con poca tinta.', viento: 'Se me mueve el brote. Es meteorología, no entusiasmo.' },
  bruma: { lluvia: 'Llueve. Me estoy ampliando sin permiso.', niebla: 'He salido a pasear y me he confundido conmigo misma.', viento: 'El viento me ha llevado a casa. No era la mía.' },
  madeja: { lluvia: 'Día de lluvia. Voy a contar cuántas goteras no tenemos.', niebla: 'No veo al vecino, pero ya sé lo que está haciendo.', viento: 'He perdido una hebra. Si la encuentras, es tuya. Creo.' },
  tuerca: { lluvia: 'Humedad no prevista. Abriré una incidencia.', niebla: 'Visibilidad reducida. He etiquetado la niebla.', viento: 'Hay tres etiquetas volando. Dos son mías. La tercera también.' },
}

/** Una línea al entrar; usa saludos ya escritos y personaliza algunos encuentros. */
export function saludoDeLlegada(p: Partida, vecino: CompaneroId, ahora: Date): string {
  const grado = gradoAmistad(p, vecino)
  const clima = tiempoDelDia(ahora)
  const semilla = azarConSemilla('llegada|' + dia(ahora) + '|' + vecino + '|' + momentoDelDia(ahora))()
  // La relación no habla de números ni del diario; solo cambia el trato.
  if (grado > 0 && semilla < .60) return GESTOS_DE_AMISTAD[vecino][grado - 1]
  if (clima !== 'despejado' && semilla < .40) return REACCIONES_TIEMPO[vecino][clima]!
  const saludos = FRASES[vecino].saludo[momentoDelDia(ahora)]
  return saludos[Math.floor(semilla * saludos.length)]
}
