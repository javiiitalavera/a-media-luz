// El globo de texto que sale donde has tocado: pequeño, con un pico que señala el sitio.
// Si el toque está muy arriba (o el globo se metería bajo los botones de arriba), sale por debajo. Se cierra a los 4 s, o al tocar fuera.
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useGlobo } from '../estado/globo'

const ANCHO = 250

export function GloboFlotante() {
  const globo = useGlobo((s) => s.globo)
  const cerrar = useGlobo((s) => s.cerrar)
  const caja = useRef<HTMLDivElement>(null)
  const [alto, setAlto] = useState(60)
  useLayoutEffect(() => { if (caja.current) setAlto(caja.current.offsetHeight) }, [globo])
  useEffect(() => {
    if (!globo) return
    const t = setTimeout(cerrar, 4200)
    // Cualquier otro toque lo cierra (después del que lo ha abierto).
    const fuera = () => cerrar()
    const a = setTimeout(() => window.addEventListener('pointerdown', fuera, { once: true }), 50)
    return () => { clearTimeout(t); clearTimeout(a); window.removeEventListener('pointerdown', fuera) }
  }, [globo, cerrar])
  if (!globo) return null
  const ancho = Math.min(ANCHO, innerWidth - 24)
  const izquierda = Math.min(Math.max(globo.x - ancho / 2, 12), innerWidth - ancho - 12)
  // Lo que hay arriba (botón «Barrio», avisos…) no se tapa: el globo sale por debajo de esa franja.
  const techo = Math.max(70, ...[...document.querySelectorAll('[data-tapa-globo]')].map((e) => e.getBoundingClientRect().bottom + 8))
  const debajo = globo.y - alto - 16 < techo
  const arriba = debajo ? Math.max(globo.y + 18, techo) : globo.y - alto - 14
  const pico = Math.min(Math.max(globo.x - izquierda, 18), ancho - 18)
  return createPortal(
    <div key={globo.n} ref={caja} role="status" className="anim-globo pointer-events-none fixed z-[70]"
      style={{ left: izquierda, top: arriba, width: ancho, transformOrigin: `${pico}px ${debajo ? 0 : '100%'}` }}>
      <div className="relative rounded-2xl bg-[#2e2030]/88 px-3.5 py-2 text-[14px] leading-snug text-[#fbefe4] shadow-lg backdrop-blur-sm">
        {globo.texto}
        <span aria-hidden className={`absolute h-3 w-3 -translate-x-1/2 rotate-45 bg-[#2e2030]/88 ${debajo ? '-top-1.5' : '-bottom-1.5'}`} style={{ left: pico }} />
      </div>
    </div>,
    document.body,
  )
}
