// Preferencias del móvil que no son de la partida (música y sonidos). Se guardan aparte.
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface Preferencias {
  musica: boolean
  sonidos: boolean
  ponerMusica: (v: boolean) => void
  ponerSonidos: (v: boolean) => void
}

export const usePreferencias = create<Preferencias>()(
  persist(
    (set) => ({
      musica: true,
      sonidos: true,
      ponerMusica: (musica) => set({ musica }),
      ponerSonidos: (sonidos) => set({ sonidos }),
    }),
    { name: 'a-media-luz-preferencias', storage: createJSONStorage(() => localStorage) },
  ),
)
