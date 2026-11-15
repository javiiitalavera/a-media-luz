// Piezas de interfaz comunes.
import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { rutaArte, type ClaveArte } from '../arte/manifiesto'

export function useAhora(): Date {
  const [, setTic] = useState(0)
  useEffect(() => {
    const tic = () => setTic((n) => n + 1)
    const id = setInterval(tic, 30_000)
    document.addEventListener('visibilitychange', tic)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', tic) }
  }, [])
  return new Date()
}

export function Pantalla({ children, titulo }: { children: ReactNode; titulo?: string }) {
  return (
    <main className="mx-auto min-h-dvh max-w-[430px] px-4 pt-[max(20px,calc(env(safe-area-inset-top)+24px))] pb-28">
      {titulo && <h1 className="mb-4 px-1 text-[28px] leading-tight font-bold">{titulo}</h1>}
      {children}
    </main>
  )
}

export function BotonPrincipal(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`h-14 w-full rounded-full bg-ambar text-lg font-bold text-tinta shadow-[0_4px_18px_rgba(255,193,69,0.45)] transition active:scale-[0.98] disabled:opacity-40 ${props.className ?? ''}`}
    />
  )
}

export function BotonSecundario(props: ButtonHTMLAttributes<HTMLButtonElement> & { peligro?: boolean }) {
  const { peligro, className, ...resto } = props
  return (
    <button
      type="button"
      {...resto}
      className={`min-h-11 rounded-full border-2 px-4 text-sm font-semibold ${peligro ? 'border-peligro text-peligro' : 'border-borde text-texto-2'} ${className ?? ''}`}
    />
  )
}

export function Tarjeta({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl bg-tarjeta p-4 shadow-[0_2px_10px_rgba(63,42,58,0.06)] ${className}`}>{children}</div>
}

export function Interruptor({ titulo, explicacion, activo, onCambiar }: { titulo: string; explicacion: string; activo: boolean; onCambiar: (v: boolean) => void }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-3xl bg-tarjeta px-4 py-3">
      <span>
        <span className="block font-semibold">{titulo}</span>
        <span className="mt-0.5 block text-[13px] text-texto-3">{explicacion}</span>
      </span>
      <input type="checkbox" checked={activo} onChange={(e) => onCambiar(e.target.checked)} className="h-6 w-6 shrink-0 accent-[#FFC145]" />
    </label>
  )
}

/** Bocadillo con lo que dice un compañero. */
export function Bocadillo({ quien, texto }: { quien: string; texto: string }) {
  return (
    <div className="animate-entrar rounded-3xl bg-tarjeta px-4 py-3 shadow-[0_2px_10px_rgba(63,42,58,0.08)]" aria-live="polite">
      <div className="text-[13px] font-semibold text-coral-texto">{quien}</div>
      <div className="mt-0.5 text-[17px] leading-snug">{texto}</div>
    </div>
  )
}

/**
 * Hueco para una ilustración aprobada. Si el recurso existe en el manifiesto, se pinta;
 * si no, el hueco se queda neutro (no se dibujan sustitutos).
 */
export function HuecoArte({ clave, alt, className = '' }: { clave: ClaveArte; alt: string; className?: string }) {
  const ruta = rutaArte(clave)
  if (ruta) return <img src={ruta} alt={alt} className={`object-contain ${className}`} draggable={false} />
  return <div role="img" aria-label={alt} className={`rounded-full bg-hundido ${className}`} />
}
