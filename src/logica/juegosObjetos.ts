// Mecánicas táctiles breves, sin materiales, tareas, puntuación ni repetición obligatoria.
export type JuegoEspecial = 'avivar' | 'regar' | 'dar-cuerda' | 'llamada' | 'salto'
export const MANTENER_OBJETO: Partial<Record<string, JuegoEspecial>> = {
  hoguera: 'avivar',
  maceta: 'regar',
  gramofono: 'dar-cuerda',
  telefono: 'llamada',
}

/** La comba responde a tres toques con cierto ritmo. No hay fallos ni penalizaciones. */
export interface EstadoComba { anterior: number | null; seguidos: number }
export const COMBA_INICIAL: EstadoComba = { anterior: null, seguidos: 0 }
export function tocarComba(estado: EstadoComba, instante: number): { estado: EstadoComba; especial: boolean } {
  if (!Number.isFinite(instante)) return { estado: COMBA_INICIAL, especial: false }
  const intervalo = estado.anterior === null ? Infinity : instante - estado.anterior
  const encadena = intervalo >= 150 && intervalo <= 1100
  const seguidos = encadena ? estado.seguidos + 1 : 1
  if (seguidos >= 3) return { estado: { anterior: instante, seguidos: 0 }, especial: true }
  return { estado: { anterior: instante, seguidos }, especial: false }
}

/** Respuestas únicas por acción: ver, oír y provocar algo prima sobre leer. */
export const FRASE_JUEGO_ESPECIAL: Record<JuegoEspecial, string> = {
  avivar: 'Eso ha sido avivar el fuego. No lo llames supervisión.',
  regar: 'La planta ha pedido otra ronda. Yo no.',
  'dar-cuerda': 'Ya suena. Por favor, no bailes encima de los libros.',
  llamada: 'Centralita de Madeja. Sabía que llamarías.',
  salto: 'Tres saltos seguidos. Estás contratado como entrenador. Sin sueldo.',
}
