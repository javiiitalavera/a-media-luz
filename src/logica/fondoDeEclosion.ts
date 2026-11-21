// El huevo se abre sobre el paisaje exterior. Al salir el vecino, ese mismo paisaje
// sigue visible mientras se revela su casa: nunca se sustituye el fondo de golpe.
export type EstadoHuevo = 'huevo' | 'naciendo' | 'vivo'
export type PasoEclosion = 'rompiendo' | 'salio' | 'ficha' | null

export function fondoDeEclosion(estado: EstadoHuevo, paso: PasoEclosion) {
  const revelandoCasa = estado === 'naciendo' && (paso === 'salio' || paso === 'ficha')
  const conHuevo = estado !== 'vivo' && !revelandoCasa
  return { conHuevo, mostrarNido: conHuevo || revelandoCasa, revelandoCasa }
}
