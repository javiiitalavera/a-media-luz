import { UI } from '../contenido'
import { sfx } from '../sonido'
import { Punto } from './Aviso'

export type Pestana = 'inicio' | 'ofrendas' | 'album' | 'ajustes'
const PESTANAS: Pestana[] = ['inicio', 'ofrendas', 'album', 'ajustes']

export function Navegacion({ actual, onCambiar, avisos = {} }: { actual: Pestana; onCambiar: (p: Pestana) => void; avisos?: Partial<Record<Pestana, boolean>> }) {
  return (
    <nav aria-label="Navegación principal" style={{ viewTransitionName: 'navegacion' }} className="fixed inset-x-0 bottom-0 z-20 mx-auto grid max-w-[430px] grid-cols-4 border-t border-borde bg-tarjeta/95 px-2 pt-2 pb-[max(16px,env(safe-area-inset-bottom))] backdrop-blur">
      {PESTANAS.map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === actual ? 'page' : undefined}
          onClick={() => { sfx.toque(); onCambiar(p) }}
          className={`relative min-h-11 rounded-2xl text-[14px] ${p === actual ? 'bg-hundido font-bold text-coral-texto' : 'font-medium text-texto-3'}`}
        >
          {UI.nav[p]}
          {avisos[p] && p !== actual && <Punto className="absolute top-1.5 right-[18%]" />}
        </button>
      ))}
    </nav>
  )
}
