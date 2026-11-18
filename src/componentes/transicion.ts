// Paso entre el barrio y las casas: el barrio se acerca a la casita y la casa «sale» de ella; al volver,
// la casa se encoge hacia su casita y el barrio se aleja. Usa las transiciones de vista del navegador
// (iPhone con iOS 18 o más); si no las hay, o con «reducir movimiento», cambia sin más.
import { flushSync } from 'react-dom'

type Doc = Document & { startViewTransition?: (cb: () => void) => unknown }

export function transicion(tipo: 'entrar' | 'salir', punto: { x: number; y: number }, cambiar: () => void) {
  const doc = document as Doc
  const raiz = document.documentElement
  if (!doc.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) { cambiar(); return }
  raiz.style.setProperty('--vt-x', `${Math.round(punto.x)}px`)
  raiz.style.setProperty('--vt-y', `${Math.round(punto.y)}px`)
  raiz.dataset.transicion = tipo
  doc.startViewTransition(() => flushSync(cambiar))
}
