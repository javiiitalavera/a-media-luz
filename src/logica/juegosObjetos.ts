// Acciones voluntarias y físicas; nunca conceden materiales ni crean tareas.
export type JuegoEspecial =
  | 'avivar' | 'regar' | 'dar-cuerda' | 'llamada' | 'salto'
  | 'pedalear' | 'pesar' | 'escribir' | 'observar' | 'girar' | 'elevar'
  | 'lucir' | 'tejer' | 'enviar'

/** Los objetos también funcionan con un toque corto; estos gestos son descubrimientos adicionales. */
export const MANTENER_OBJETO: Partial<Record<string, JuegoEspecial>> = {
  hoguera: 'avivar',
  maceta: 'regar',
  gramofono: 'dar-cuerda',
  telefono: 'llamada',
  maquina: 'escribir',
  balanza: 'pesar',
  telescopio: 'observar',
  loto: 'lucir',
  cesto: 'tejer',
  buzon: 'enviar',
}
export const DESLIZAR_OBJETO: Partial<Record<string, JuegoEspecial>> = {
  globo: 'girar',
  cometa: 'elevar',
}
export const RITMO_OBJETO: Partial<Record<string, JuegoEspecial>> = {
  comba: 'salto',
  bici: 'pedalear',
}

/** Tres toques relativamente acompasados; no hay fallo ni castigo por tocar despacio. */
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

/** Texto mínimo: cada objeto especial muestra su frase una sola vez por visita. */
export const FRASE_JUEGO_ESPECIAL: Record<JuegoEspecial, string> = {
  avivar: 'Eso ha sido avivar el fuego. No lo llames supervisión.',
  regar: 'La planta ha pedido otra ronda. Yo no.',
  'dar-cuerda': 'Ya suena. Por favor, no bailes encima de los libros.',
  llamada: 'Centralita de Madeja. Sabía que llamarías.',
  salto: 'Tres saltos seguidos. Estás contratado como entrenador. Sin sueldo.',
  pedalear: 'Bici de madera. Velocidad máxima: la que permite la dignidad.',
  pesar: 'La balanza dice que todo está en orden. Tuerca pide una segunda opinión.',
  escribir: 'La máquina ha escrito «URGENTE». Tuerca está feliz.',
  observar: 'El telescopio ha encontrado algo. Tofu se niega a especular.',
  girar: 'Has dado la vuelta al mundo. Tofu sigue en el mismo sitio.',
  elevar: 'La cometa ha despegado. Bruma reclama el espacio aéreo.',
  lucir: 'El loto se ha encendido. Bruma pide que no aplaudas.',
  tejer: 'Del cesto sale más lana. Las matemáticas no quieren saberlo.',
  enviar: 'Carta enviada. Madeja ya conocía el contenido.',
}
