// Estado guardado en el móvil (localStorage) con Zustand.
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { CompaneroId } from '../contenido'
import { crearPartida, type Partida } from '../logica/partida'
import { cambiarDiaMalo, deshacerOfrenda, fraseDelBosque, hacerOfrenda, type Frase, type ResultadoOfrenda } from '../logica/ofrendas'
import { azarReal } from '../logica/azar'

export const SEGUNDOS_DESHACER = 8

const nuevoId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

export interface Reciente {
  resultado: ResultadoOfrenda
  hasta: number
}

interface Juego {
  partida: Partida | null
  empezar: (c: CompaneroId) => void
  /** Ofrendas recientes que aún se pueden deshacer (no se guarda). */
  recientes: Reciente[]
  ofrecer: (accionId: string) => ResultadoOfrenda | null
  deshacer: () => void
  olvidarRecientes: () => void
  ponerDiaMalo: (v: boolean) => void
  /** Frase del bocadillo del bosque y para qué situación se eligió (no se guardan). */
  fraseBosque: Frase | null
  claveFrase: string | null
  nuevaFraseBosque: (clave: string) => void
  fijarClaveFrase: (clave: string) => void
  ajustar: (cambio: (p: Partida) => Partida) => void
  sustituir: (p: Partida) => void
  borrar: () => void
}

export const useJuego = create<Juego>()(
  persist(
    (set, get) => ({
      partida: null,
      empezar: (c) => set({ partida: crearPartida(c, new Date()), recientes: [], fraseBosque: null }),
      recientes: [],
      ofrecer: (accionId) => {
        const p = get().partida
        if (!p) return null
        const ahora = new Date()
        const resultado = hacerOfrenda(p, accionId, ahora, azarReal, nuevoId())
        set({
          partida: resultado.partida,
          recientes: [...get().recientes, { resultado, hasta: ahora.getTime() + SEGUNDOS_DESHACER * 1000 }].slice(-20),
          fraseBosque: resultado.frase ?? get().fraseBosque,
          claveFrase: null, // la reacción se queda hasta que cambie la situación (ver Bosque)
        })
        return resultado
      },
      deshacer: () => {
        const { partida, recientes } = get()
        const u = recientes.at(-1)
        if (!partida || !u || Date.now() > u.hasta) return
        const resto = recientes.slice(0, -1)
        const anterior = resto.at(-1)
        if (anterior) anterior.hasta = Date.now() + SEGUNDOS_DESHACER * 1000
        set({ partida: deshacerOfrenda(partida, u.resultado.ofrenda.id), recientes: [...resto], fraseBosque: null })
      },
      olvidarRecientes: () => set({ recientes: [] }),
      ponerDiaMalo: (v) => {
        const p = get().partida
        if (p) set({ partida: cambiarDiaMalo(p, v, new Date()) })
      },
      fraseBosque: null,
      claveFrase: null,
      fijarClaveFrase: (clave) => set({ claveFrase: clave }),
      nuevaFraseBosque: (clave) => {
        const p = get().partida
        if (!p) return
        const r = fraseDelBosque(p, new Date(), azarReal)
        set({ fraseBosque: r.frase, claveFrase: clave, partida: { ...p, frasesRecientes: r.recientes } })
      },
      ajustar: (cambio) => {
        const p = get().partida
        if (p) set({ partida: cambio(p) })
      },
      sustituir: (p) => set({ partida: p, recientes: [], fraseBosque: null }),
      borrar: () => set({ partida: null, recientes: [], fraseBosque: null }),
    }),
    { name: 'a-media-luz', version: 1, storage: createJSONStorage(() => localStorage), partialize: (s) => ({ partida: s.partida }) },
  ),
)
