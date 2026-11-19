// Botones que flotan sobre la escena (casa y barrio): todos con el mismo estilo (fondo crema translúcido,
// aro claro y sombra) y el mismo tamaño, 48 px. El de construir es el principal y mide 56.
import type { ReactNode } from 'react'

export const ESTILO_FLOTANTE = 'bg-tarjeta/92 text-texto-2 shadow-lg ring-2 ring-tarjeta backdrop-blur-sm active:scale-95'

/** Botón redondo de 48 px con un icono. */
export function BotonRedondo({ etiqueta, onToque, children, className = '' }: { etiqueta: string; onToque: () => void; children: ReactNode; className?: string }) {
  return (
    <button type="button" aria-label={etiqueta} onClick={(e) => { e.stopPropagation(); onToque() }}
      className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${ESTILO_FLOTANTE} ${className}`}>
      {children}
    </button>
  )
}

/** Botón alargado de 48 px de alto (icono y texto), por ejemplo «Barrio». */
export function BotonPastilla({ etiqueta, onToque, children }: { etiqueta?: string; onToque: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-label={etiqueta} onClick={(e) => { e.stopPropagation(); onToque() }}
      className={`flex h-12 shrink-0 items-center gap-1.5 rounded-full pr-4 pl-3 text-[15px] font-semibold whitespace-nowrap ${ESTILO_FLOTANTE}`}>
      {children}
    </button>
  )
}

/** Iconos de trazo (juego Lucide, licencia ISC), a 24 px. */
export const ICONOS = {
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 16v-4.5 M12 8h.01" /></>,
  mapa: <><path d="M14.1 5.9 9.9 4 3.6 6.7a1 1 0 0 0-.6.9v11.8a.5.5 0 0 0 .7.5L9.9 17l4.2 2 6.3-2.7a1 1 0 0 0 .6-.9V4.6a.5.5 0 0 0-.7-.5Z" /><path d="M9.9 4v13 M14.1 5.9V19" /></>,
  atras: <path d="m15 18-6-6 6-6" />,
  sobre: <path d="M4.5 7.5h15v10h-15z M4.8 7.8 12 13l7.2-5.2" />,
}

export function Icono({ d, tam = 24 }: { d: ReactNode; tam?: number }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" width={tam} height={tam} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
  )
}
