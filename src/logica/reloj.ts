// Reloj del juego. En el modo de prueba (Ajustes) se puede adelantar para ver pasar los días sin esperar.
const CLAVE = 'a-media-luz-desfase'

export function desfaseDias(): number {
  try { return Number(localStorage.getItem(CLAVE)) || 0 } catch { return 0 }
}

export function ponerDesfase(dias: number) {
  try { if (dias) localStorage.setItem(CLAVE, String(dias)); else localStorage.removeItem(CLAVE) } catch { /* sin almacenamiento */ }
}

/** La hora del juego: la real, más el desfase del modo de prueba. */
export const ahora = () => new Date(Date.now() + desfaseDias() * 86_400_000)
