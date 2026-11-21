// El huevo se abre sobre el paisaje exterior. Al salir el vecino, ese mismo paisaje
// sigue visible mientras se revela su casa: nunca se sustituye el fondo de golpe.
export type EstadoHuevo = 'huevo' | 'naciendo' | 'vivo'
export type PasoEclosion = 'rompiendo' | 'niebla' | 'salio' | 'ficha' | null

/** La niebla entra antes de sustituir el paisaje y no sale hasta terminar el fundido. */
export const TIEMPOS_ECLOSION = {
  rompiendo: 150,
  niebla: 1550,
  salio: 1950,
  ficha: 3550,
} as const

export function fondoDeEclosion(estado: EstadoHuevo, paso: PasoEclosion) {
  const revelandoCasa = estado === 'naciendo' && (paso === 'salio' || paso === 'ficha')
  const conHuevo = estado !== 'vivo' && !revelandoCasa
  return { conHuevo, mostrarNido: conHuevo || revelandoCasa, revelandoCasa,
    niebla: estado === 'naciendo' && (paso === 'niebla' ? 'cubriendo' : paso === 'salio' ? 'revelando' : null) } as const
}
