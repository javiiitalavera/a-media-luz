// Iconito de aviso (dibujado por código): un círculo ámbar con un símbolo dentro. Solo late el de una decisión
// («?»); los demás aparecen con un pequeño salto y se quedan quietos.
// Sobre (novedades), «!» (ha pasado algo aquí), «…» (una cosa pequeña), «?» (decisión) o punto.
import type { CSSProperties } from 'react'

export type TipoAviso = 'sobre' | 'exclamacion' | 'puntos' | 'pregunta'

const SIMBOLO: Record<TipoAviso, string> = {
  sobre: 'M4.5 7.5h15v10h-15z M4.8 7.8 12 13l7.2-5.2',
  exclamacion: 'M12 6v7.5 M12 17.2v.3',
  puntos: 'M7.5 12h.1 M12 12h.1 M16.5 12h.1',
  pregunta: 'M9.4 9.2a2.7 2.7 0 1 1 3.6 2.5c-.7.3-1 .8-1 1.5v.6 M12 17.2v.3',
}

/** Círculo de aviso. `tam` en px. Si se pasa `numero`, lo lleva en una esquina. */
export function Aviso({ tipo, tam = 30, numero, estilo, className = '' }: { tipo: TipoAviso; tam?: number; numero?: number; estilo?: CSSProperties; className?: string }) {
  return (
    <span aria-hidden className={`${tipo === 'pregunta' ? 'anim-latido' : 'anim-aviso'} relative flex items-center justify-center rounded-full bg-ambar text-tinta shadow-[0_2px_6px_rgba(46,32,48,0.35)] ring-2 ring-tarjeta ${className}`}
      style={{ width: tam, height: tam, ...estilo }}>
      <svg viewBox="0 0 24 24" style={{ width: tam * 0.68, height: tam * 0.68 }} fill="none" stroke="currentColor" strokeWidth={tipo === 'puntos' ? 3.6 : 2.4} strokeLinecap="round" strokeLinejoin="round">
        <path d={SIMBOLO[tipo]} />
      </svg>
      {numero !== undefined && numero > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#a8424c] px-1 text-[11px] leading-none font-bold text-white">{numero}</span>
      )}
    </span>
  )
}

/** Puntito para las pestañas. */
export function Punto({ className = '' }: { className?: string }) {
  return <span aria-hidden className={`anim-aviso block h-2.5 w-2.5 rounded-full bg-coral ring-2 ring-tarjeta ${className}`} />
}
