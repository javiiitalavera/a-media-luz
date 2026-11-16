import { UI } from '../contenido'

export type Pestana = 'casa' | 'ofrendas' | 'semana' | 'album' | 'ajustes'
const PESTANAS: Pestana[] = ['casa', 'ofrendas', 'semana', 'album', 'ajustes']

export function Navegacion({ actual, onCambiar }: { actual: Pestana; onCambiar: (p: Pestana) => void }) {
  return (
    <nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-20 mx-auto grid max-w-[430px] grid-cols-5 border-t border-borde bg-tarjeta/95 px-2 pt-2 pb-[max(16px,env(safe-area-inset-bottom))] backdrop-blur">
      {PESTANAS.map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === actual ? 'page' : undefined}
          onClick={() => onCambiar(p)}
          className={`min-h-11 rounded-2xl text-[13.5px] ${p === actual ? 'bg-hundido font-bold text-coral-texto' : 'font-medium text-texto-3'}`}
        >
          {UI.nav[p]}
        </button>
      ))}
    </nav>
  )
}
