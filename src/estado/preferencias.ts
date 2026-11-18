// Preferencias del móvil que no son de la partida (música y sonidos). Se guardan aparte.
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface Preferencias {
  musica: boolean
  sonidos: boolean
  /** Colores de la interfaz: según la hora, o siempre de día / de noche (las escenas siguen la hora real). */
  aspecto: 'auto' | 'dia' | 'noche'
  /** Fecha ISO de la última copia exportada. */
  ultimaCopia?: string
  /** Se ha desbloqueado el modo de prueba (tocando la versión). */
  pruebas: boolean
  ponerMusica: (v: boolean) => void
  ponerSonidos: (v: boolean) => void
  ponerAspecto: (v: 'auto' | 'dia' | 'noche') => void
  copiaHecha: (fecha: string) => void
  ponerPruebas: (v: boolean) => void
}

export const usePreferencias = create<Preferencias>()(
  persist(
    (set) => ({
      musica: true,
      sonidos: true,
      aspecto: 'auto',
      pruebas: false,
      ponerMusica: (musica) => set({ musica }),
      ponerAspecto: (aspecto) => set({ aspecto }),
      copiaHecha: (ultimaCopia) => set({ ultimaCopia }),
      ponerPruebas: (pruebas) => set({ pruebas }),
      ponerSonidos: (sonidos) => set({ sonidos }),
    }),
    { name: 'a-media-luz-preferencias', storage: createJSONStorage(() => localStorage) },
  ),
)
