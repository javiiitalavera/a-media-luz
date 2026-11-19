// El origen se expresa en la escena de juego, también cuando está centrada en un escritorio.
import { flushSync } from 'react-dom'

export function transicion(tipo: 'entrar' | 'salir', punto: { x: number; y: number }, cambiar: () => void) {
  const escena = document.querySelector<HTMLElement>('.escena-vecindario')
  if (!document.startViewTransition || !escena || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cambiar()
    return
  }

  const caja = escena.getBoundingClientRect()
  const raiz = document.documentElement
  raiz.style.setProperty('--vt-x', `${punto.x - caja.left}px`)
  raiz.style.setProperty('--vt-y', `${punto.y - caja.top}px`)
  raiz.dataset.transicion = tipo
  const paso = document.startViewTransition(() => flushSync(cambiar))
  // Una transición interrumpida no debe desmontar los estilos de la siguiente.
  enCurso = paso
  void paso.finished.finally(() => {
    if (enCurso !== paso) return
    enCurso = undefined
    delete raiz.dataset.transicion
    raiz.style.removeProperty('--vt-x')
    raiz.style.removeProperty('--vt-y')
  })
}

let enCurso: ViewTransition | undefined
