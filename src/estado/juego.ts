// Estado guardado en el móvil (localStorage) con Zustand.
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { CompaneroId } from '../contenido'
import { crearPartida, type Partida } from '../logica/partida'
import { cambiarDiaMalo, deshacerOfrenda, fraseAlTocar, hacerOfrenda, type Frase, type ResultadoOfrenda } from '../logica/ofrendas'
import { azarReal } from '../logica/azar'
import { dia } from '../logica/fechas'
import { construir as construirEnCasa } from '../logica/casa'
import { ahora } from '../logica/reloj'
import { hechaHoy, migrarHazanas } from '../logica/hazanas'
import { anadirSugerencia, type Sugerencia } from '../logica/sugerencias'
import type { Perfil } from '../contenido/cuestionario'
import { avanzar, decidir as decidirSituacion } from '../logica/situaciones'
import { incubar as incubarHuevo } from '../logica/etapas'
import { marcarEtapaVista, type Etapa } from '../logica/etapas'
import { marcarPresentado, mesActual } from '../logica/meses'
import { curiosidadesDeHistorias } from '../logica/curiosidades'
import { momentoCrecer, momentoNacimiento, momentosDeHistorias } from '../logica/momentos'
import { elegirFrase } from '../logica/ofrendas'

const nuevoId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

interface Juego {
  partida: Partida | null
  empezar: (c: CompaneroId, habituales?: string[], perfil?: Perfil, sugeridos?: Sugerencia[]) => void
  ofrecer: (accionId: string) => ResultadoOfrenda | null
  /** Reacción visual pendiente del vecino al volver a casa. No se guarda. */
  porContar: Frase | null
  contar: () => Frase | null
  /** Quita la última vez de hoy de una acción (para cuando se toca sin querer). */
  quitarUna: (accionId: string) => void
  ponerDiaMalo: (v: boolean) => void
  /** Tocar a un compañero en el bosque: devuelve lo que dice. */
  tocar: (c: CompaneroId, sinQuejas?: boolean) => Frase | null
  /** Construye un objeto en la casa; devuelve lo que dice el compañero (o null si no se pudo). */
  construir: (objetoId: string, c: CompaneroId) => { ok: boolean; frase: Frase | null }
  /** Celebra (una vez) que un compañero ha crecido: marca la etapa como vista y devuelve su frase. */
  verEtapa: (c: CompaneroId, etapa: Etapa) => Frase | null
  /** Avanza el barrio (como mucho una fase de historia al día). */
  avanzarBarrio: () => void
  /** Decide en una situación. Devuelve la respuesta que se cuenta en pantalla. */
  decidir: (situacion: string, opcion: string, respuesta: string) => void
  /** Incuba el huevo que espera en la puerta. */
  incubar: (c: CompaneroId) => void
  /** Construye un proyecto del barrio. */
  construirBarrio: (id: string) => boolean
  /** Ya se ha visto nacer y presentarse al compañero del mes. */
  presentar: () => void
  ajustar: (cambio: (p: Partida) => Partida) => void
  sustituir: (p: Partida) => void
  borrar: () => void
}

export const useJuego = create<Juego>()(
  persist(
    (set, get) => ({
      partida: null,
      empezar: (c, habituales, perfil, sugeridos = []) => {
        // Los retos sugeridos se guardan con su meta ajustada; el resto, con la del catálogo.
        let p = crearPartida(c, ahora(), habituales, true)
        for (const s of sugeridos) if (habituales?.includes(s.id)) p = anadirSugerencia(p, s)
        set({ partida: perfil ? { ...p, perfil } : p, porContar: null })
      },
      ofrecer: (accionId) => {
        const p = get().partida
        if (!p) return null
        const momento = ahora()
        const puntual = p.acciones.find((a) => a.id === accionId)?.soloEl
        if (puntual && (puntual !== dia(momento) || hechaHoy(p, accionId, momento))) return null
        const resultado = hacerOfrenda(p, accionId, momento, azarReal, nuevoId())
        set({
          partida: resultado.partida,
          porContar: resultado.frase ?? get().porContar,
        })
        return resultado
      },
      quitarUna: (accionId) => {
        const p = get().partida
        if (!p) return
        const hoy = p.acciones.find((a) => a.id === accionId)?.soloEl ?? dia(ahora())
        const ultima = [...p.ofrendas].reverse().find((o) => o.accionId === accionId && dia(o.fecha) === hoy)
        if (ultima) set({ partida: deshacerOfrenda(p, ultima.id), porContar: null })
      },
      porContar: null,
      contar: () => {
        const f = get().porContar
        if (f) set({ porContar: null })
        return f
      },
      ponerDiaMalo: (v) => {
        const p = get().partida
        if (p) set({ partida: cambiarDiaMalo(p, v, ahora()) })
      },
      tocar: (c, sinQuejas) => {
        const p = get().partida
        if (!p) return null
        const r = fraseAlTocar(p, c, ahora(), azarReal, sinQuejas)
        set({ partida: { ...p, frasesRecientes: r.recientes } })
        return r.frase
      },
      construir: (objetoId, c) => {
        const p = get().partida
        const hecha = p && construirEnCasa(p, objetoId, ahora())
        if (!hecha) return { ok: false, frase: null }
        const r = elegirFrase(hecha, c, 'construir', azarReal)
        set({ partida: { ...hecha, frasesRecientes: r.recientes } })
        return { ok: true, frase: r.frase }
      },
      verEtapa: (c, etapa) => {
        const p = get().partida
        if (!p) return null
        const vista = marcarEtapaVista(p, c, etapa)
        const r = etapa > 0 ? elegirFrase(vista, c, `crecer${etapa}` as 'crecer1' | 'crecer2', azarReal) : null
        let nueva = r ? { ...vista, frasesRecientes: r.recientes } : vista
        if (etapa > 0) nueva = momentoCrecer(nueva, c, etapa as 1 | 2, ahora(), r?.frase?.texto)
        set({ partida: nueva })
        return r?.frase ?? null
      },
      avanzarBarrio: () => {
        const p = get().partida
        if (!p) return
        const momento = ahora()
        const r = avanzar(p, momento)
        if (r.nuevas.length) set({ partida: curiosidadesDeHistorias(p, momentosDeHistorias(p, r.partida, momento), momento) })
      },
      decidir: (situacion, opcion) => {
        const p = get().partida
        const hecha = p && decidirSituacion(p, situacion, opcion)
        if (hecha) set({ partida: hecha })
      },
      incubar: (c) => {
        const p = get().partida
        if (p) set({ partida: incubarHuevo(p, c, ahora()), porContar: null })
      },
      construirBarrio: (id) => {
        const p = get().partida
        const hecha = p && construirEnCasa(p, id, ahora(), true)
        if (hecha) set({ partida: hecha })
        return Boolean(hecha)
      },
      presentar: () => {
        const p = get().partida
        if (p) set({ partida: momentoNacimiento(marcarPresentado(p, ahora()), mesActual(p).companero, ahora()) })
      },
      ajustar: (cambio) => {
        const p = get().partida
        if (!p) return
        const nueva = cambio(p)
        if (nueva !== p) set({ partida: nueva })
      },
      sustituir: (p) => set({ partida: p, porContar: null }),
      borrar: () => set({ partida: null, porContar: null}),
    }),
    {
      name: 'a-media-luz', version: 3, storage: createJSONStorage(() => localStorage), partialize: (s) => ({ partida: s.partida }),
      // v2: hazañas concretas (las acciones genéricas pasan a sus equivalentes).
      migrate: (guardado) => {
        const g = guardado as { partida: Partida | null }
        return { ...g, partida: g.partida ? migrarHazanas(g.partida) : null } as Juego
      },
    },
  ),
)
