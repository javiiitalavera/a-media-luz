// Botón redondo para construir (casa) o ver los proyectos (barrio). Los materiales y lo que se puede
// construir se ven al tocarlo, en su hoja; así la escena queda libre. Lleva un número cuando hay algo listo.
import { ESTILO_FLOTANTE } from './BotonFlotante'

export function BotonConstruir({ etiqueta, listos, onToque, compacto = false }: { etiqueta: string; listos: number; onToque: () => void; compacto?: boolean }) {
  return (
    <button type="button" onClick={onToque} aria-label={listos ? `${etiqueta} (${listos})` : etiqueta}
      className={`relative flex shrink-0 items-center justify-center rounded-full ${compacto ? 'size-12' : 'size-14'} ${
        listos ? `bg-ambar text-tinta shadow-lg ring-2 ring-tarjeta active:scale-95` : ESTILO_FLOTANTE}`}>
      {/* Martillo (trazo del juego de iconos Lucide, licencia ISC). */}
      <svg aria-hidden viewBox="0 0 24 24" className={compacto ? 'size-6' : 'size-7'} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9" />
        <path d="m18 15 4-4" />
        <path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5" />
      </svg>
      {listos > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#a8424c] px-1 text-[12px] leading-none font-bold text-white">{listos}</span>
      )}
    </button>
  )
}
