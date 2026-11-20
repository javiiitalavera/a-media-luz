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
import { hechaHoy, migrarHazanas, seleccionarHabituales } from '../logica/hazanas'
import { anadirSugerencia, type Sugerencia } from '../logica/sugerencias'
import type { Perfil } from '../contenido/cuestionario'
import { avanzar, decidir as decidirSituacion, empiezaHoyDeTuDiario } from '../logica/situaciones'
import { leerElDiario } from '../logica/lector'
import { incubar as incubarHuevo } from '../logica/etapas'
import { marcarNivelVisto, nacido, nivelSinVer, nivelVisto, progreso, type Nivel } from '../logica/etapas'
import { estadoDelMes, marcarPresentado, mesActual } from '../logica/meses'
import { curiosidadesDeHistorias } from '../logica/curiosidades'
import { fijarFotosDeCasa, momentoSubirNivel, momentoNacimiento, momentosDeHistorias } from '../logica/momentos'
import { elegirFrase } from '../logica/ofrendas'

const nuevoId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
const FRASE_DE_NIVEL = { 2: 'crecer1', 3: 'crecer2', 4: 'crecer3', 5: 'crecer4' } as const

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
  /** Celebra el nivel alcanzado y devuelve la frase del compañero. */
  verNivel: (c: CompaneroId, nivel: Nivel) => Frase | null
  /** Avanza el barrio (como mucho una fase de historia al día). */
  avanzarBarrio: () => void
  /** Decide en una situación. Devuelve la respuesta que se cuenta en pantalla. */
  decidir: (situacion: string, opcion: string, respuesta: string) => void
  /** Recoge el huevo que espera en la puerta. */
  incubar: (c: CompaneroId) => boolean
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
        const elegidos = habituales && seleccionarHabituales(habituales)
        let p = crearPartida(c, ahora(), elegidos, true)
        for (const s of sugeridos) if (elegidos?.includes(s.id)) p = anadirSugerencia(p, s)
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
      verNivel: (c, nivel) => {
        const p = get().partida
        const momento = ahora()
        if (!p || nivel === 1 || !nacido(p, c, momento) || !nivelSinVer(p, c, nivel) || progreso(p, c, momento).nivel < nivel) return null
        const vista = marcarNivelVisto(p, c, nivel)
        const r = elegirFrase(vista, c, FRASE_DE_NIVEL[nivel], azarReal)
        let conFotos = { ...vista, frasesRecientes: r.recientes }
        // Si ha subido varios niveles entre visitas, se celebra el último y se guardan todos los momentos.
        const anterior = nivelVisto(p, c)
        for (const alcanzado of [2, 3, 4, 5] as const) {
          if (alcanzado > anterior && alcanzado <= nivel) {
            conFotos = momentoSubirNivel(conFotos, c, alcanzado, momento, alcanzado === nivel ? r.frase?.texto : undefined)
          }
        }
        set({ partida: conFotos })
        return r.frase
      },
      avanzarBarrio: () => {
        const p = get().partida
        if (!p) return
        const momento = ahora()
        const r = avanzar(p, momento)
        // También las fases sin noticia (los remates que se descubren paseando) avanzan y se guardan.
        let q = r.partida !== p ? curiosidadesDeHistorias(p, momentosDeHistorias(p, r.partida, momento), momento) : p
        // Y el barrio lee tu diario: el informe de Tuerca y, si hoy no ha empezado una historia tuya, una lectura suelta.
        q = leerElDiario(q, momento, empiezaHoyDeTuDiario(p, r.partida, momento)).partida
        if (q !== p) set({ partida: q })
      },
      decidir: (situacion, opcion) => {
        const p = get().partida
        const hecha = p && decidirSituacion(p, situacion, opcion)
        if (hecha) set({ partida: hecha })
      },
      incubar: (c) => {
        const p = get().partida
        if (!p) return false
        const nueva = incubarHuevo(p, c, ahora())
        if (nueva === p) return false
        set({ partida: nueva, porContar: null })
        return true
      },
      construirBarrio: (id) => {
        const p = get().partida
        const hecha = p && construirEnCasa(p, id, ahora(), true)
        if (hecha) set({ partida: hecha })
        return Boolean(hecha)
      },
      presentar: () => {
        const p = get().partida
        const momento = ahora()
        if (p && estadoDelMes(p, momento) === 'naciendo') {
          set({ partida: momentoNacimiento(marcarPresentado(p, momento), mesActual(p).companero, momento) })
        }
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
      name: 'a-media-luz', version: 5, storage: createJSONStorage(() => localStorage), partialize: (s) => ({ partida: s.partida }),
      // Actualiza los retos y conserva el encuadre de las fotos antiguas.
      migrate: (guardado) => {
        const g = guardado as { partida: Partida | null }
        return { ...g, partida: g.partida ? fijarFotosDeCasa(migrarHazanas(g.partida)) : null } as Juego
      },
    },
  ),
)

// Si la partida se guarda en otra pestaña o ventana, esta la vuelve a leer en vez de pisarla después con su copia vieja.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => { if (e.key === 'a-media-luz') void useJuego.persist.rehydrate() })
}
