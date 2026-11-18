// Reloj del juego.
// - Modo de prueba (Ajustes, escondido): adelanta días para ver pasar el tiempo sin esperar.
// - Inicio del día (Ajustes): si tu día empieza a las 3, lo que haces a la 1 de la madrugada cuenta
//   para el día anterior. Para eso el reloj del juego va esas horas por detrás; la luz de las escenas
//   (momentoDelDia) las vuelve a sumar, así que sigue la hora real.
const CLAVE = 'a-media-luz-desfase'
const CLAVE_INICIO = 'a-media-luz-inicio-dia'

const leer = (clave: string) => { try { return Number(localStorage.getItem(clave)) || 0 } catch { return 0 } }
const guardar = (clave: string, v: number) => {
  try { if (v) localStorage.setItem(clave, String(v)); else localStorage.removeItem(clave) } catch { /* sin almacenamiento */ }
}

export const desfaseDias = () => leer(CLAVE)
export const ponerDesfase = (dias: number) => guardar(CLAVE, dias)

/** Hora a la que empieza tu día (0, 3 o 5). */
export const inicioDia = () => leer(CLAVE_INICIO)
export const ponerInicioDia = (horas: number) => guardar(CLAVE_INICIO, horas)

/** La hora del juego: la real, más el desfase del modo de prueba, menos las horas de inicio del día. */
export const ahora = () => new Date(Date.now() + desfaseDias() * 86_400_000 - inicioDia() * 3_600_000)
