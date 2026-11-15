// Estado guardado en el móvil (localStorage) con Zustand.
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { CompaneroId } from '../contenido'
import { crearPartida, type Partida } from '../logica/partida'
import { cambiarDiaMalo, deshacerOfrenda, fraseAlTocar, hacerOfrenda, type Frase, type ResultadoOfrenda } from '../logica/ofrendas'
import { azarReal } from '../logica/azar'
import { construir as construirEnCasa } from '../logica/casa'
import { elegirFrase } from '../logica/ofrendas'

export const SEGUNDOS_DESHACER = 8

const nuevoId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

export interface Reciente {
  resultado: ResultadoOfrenda
  hasta: number
}

interface Juego {
  partida: Partida | null
  empezar: (c: CompaneroId, habituales?: string[]) => void
  /** Ofrendas recientes que aún se pueden deshacer (no se guarda). */
  recientes: Reciente[]
  ofrecer: (accionId: string) => ResultadoOfrenda | null
  deshacer: () => void
  olvidarRecientes: () => void
  ponerDiaMalo: (v: boolean) => void
  /** Tocar a un compañero en el bosque: devuelve lo que dice. */
  tocar: (c: CompaneroId) => Frase | null
  /** Construye un objeto en la casa; devuelve lo que dice el compañero (o null si no se pudo). */
  construir: (objetoId: string, c: CompaneroId) => { ok: boolean; frase: Frase | null }
  ajustar: (cambio: (p: Partida) => Partida) => void
  sustituir: (p: Partida) => void
  borrar: () => void
}

export const useJuego = create<Juego>()(
  persist(
    (set, get) => ({
      partida: null,
      empezar: (c, habituales) => set({ partida: crearPartida(c, new Date(), habituales), recientes: []}),
      recientes: [],
      ofrecer: (accionId) => {
        const p = get().partida
        if (!p) return null
        const ahora = new Date()
        const resultado = hacerOfrenda(p, accionId, ahora, azarReal, nuevoId())
        set({
          partida: resultado.partida,
          recientes: [...get().recientes, { resultado, hasta: ahora.getTime() + SEGUNDOS_DESHACER * 1000 }].slice(-20),
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
        set({ partida: deshacerOfrenda(partida, u.resultado.ofrenda.id), recientes: [...resto]})
      },
      olvidarRecientes: () => set({ recientes: [] }),
      ponerDiaMalo: (v) => {
        const p = get().partida
        if (p) set({ partida: cambiarDiaMalo(p, v, new Date()) })
      },
      tocar: (c) => {
        const p = get().partida
        if (!p) return null
        const r = fraseAlTocar(p, c, new Date(), azarReal)
        set({ partida: { ...p, frasesRecientes: r.recientes } })
        return r.frase
      },
      construir: (objetoId, c) => {
        const p = get().partida
        const hecha = p && construirEnCasa(p, objetoId, new Date())
        if (!hecha) return { ok: false, frase: null }
        const r = elegirFrase(hecha, c, 'construir', azarReal)
        set({ partida: { ...hecha, frasesRecientes: r.recientes } })
        return { ok: true, frase: r.frase }
      },
      ajustar: (cambio) => {
        const p = get().partida
        if (p) set({ partida: cambio(p) })
      },
      sustituir: (p) => set({ partida: p, recientes: []}),
      borrar: () => set({ partida: null, recientes: []}),
    }),
    { name: 'a-media-luz', version: 1, storage: createJSONStorage(() => localStorage), partialize: (s) => ({ partida: s.partida }) },
  ),
)
