// Un único globo de texto que sale donde tocas (objetos, huellas, materiales). Se cierra solo o al tocar.
import { create } from 'zustand'

interface Globo { texto: string; x: number; y: number; n: number }
interface EstadoGlobo {
  globo: Globo | null
  mostrar: (texto: string, x: number, y: number) => void
  cerrar: () => void
}

export const useGlobo = create<EstadoGlobo>((set) => ({
  globo: null,
  mostrar: (texto, x, y) => set({ globo: { texto, x, y, n: Date.now() } }),
  cerrar: () => set({ globo: null }),
}))

/** Muestra el globo en el centro de lo que se ha tocado. */
export function globoEn(e: { currentTarget: Element }, texto: string) {
  const r = e.currentTarget.getBoundingClientRect()
  useGlobo.getState().mostrar(texto, r.left + r.width / 2, r.top + Math.min(r.height / 2, 40))
}
