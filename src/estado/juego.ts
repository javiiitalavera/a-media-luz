// Estado guardado en el móvil (localStorage) con Zustand.
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { ORDEN_COMPANEROS, type CompaneroId } from '../contenido'
import { crearPartida, type Partida } from '../logica/partida'
import { cambiarDiaMalo, deshacerOfrenda, fraseAlTocar, hacerOfrenda, type Frase, type ResultadoOfrenda } from '../logica/ofrendas'
import { azarReal } from '../logica/azar'
import { dia } from '../logica/fechas'
import { construir as construirEnCasa } from '../logica/casa'
import { marcarEtapaVista, type Etapa } from '../logica/etapas'
import { empezarMesSiguiente, marcarPresentado, mesActual, type Reto } from '../logica/meses'
import { elegirRetos, premioDeReto, progresoRetos, usarComodin } from '../logica/retos'
import { tieneMes } from '../arte/manifiesto'
import { elegirFrase } from '../logica/ofrendas'

export const SEGUNDOS_DESHACER = 8

const nuevoId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

/** Lo que hay que contar al volver a casa: la frase del compañero y lo que se ha encontrado. */
export interface Noticia { frase: Frase | null; hallazgos: string[] }

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
  /** Lo que el compañero quiere contar de lo último que hiciste: lo dice en casa (no se guarda). */
  porContar: Noticia | null
  contar: () => Noticia | null
  deshacer: () => void
  olvidarRecientes: () => void
  /** Quita la última vez de hoy de una acción (para cuando se toca sin querer). */
  quitarUna: (accionId: string) => void
  ponerDiaMalo: (v: boolean) => void
  /** Tocar a un compañero en el bosque: devuelve lo que dice. */
  tocar: (c: CompaneroId, soloSaludo?: boolean) => Frase | null
  /** Construye un objeto en la casa; devuelve lo que dice el compañero (o null si no se pudo). */
  construir: (objetoId: string, c: CompaneroId) => { ok: boolean; frase: Frase | null }
  /** Celebra (una vez) que un compañero ha crecido: marca la etapa como vista y devuelve su frase. */
  verEtapa: (c: CompaneroId, etapa: Etapa) => Frase | null
  /** Lo que suelta el compañero del mes al elegir un reto (para picarte). */
  picar: (tipo: 'retoSuave' | 'retoNormal' | 'retoValiente') => Frase | null
  /** Fija los retos del mes; devuelve si se pudo (y deja su frase para casa). */
  fijarRetos: (retos: Reto[]) => boolean
  /** Cambia un reto con el comodín; devuelve su frase (o null si no se pudo). */
  gastarComodin: (i: number, reto: Reto) => Frase | null
  /** Tras el informe: cierra el mes y llega el huevo siguiente (de los que tienen su arte). */
  pasarMes: () => boolean
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
      empezar: (c, habituales) => set({ partida: crearPartida(c, new Date(), habituales, true), recientes: []}),
      recientes: [],
      ofrecer: (accionId) => {
        const p = get().partida
        if (!p) return null
        const ahora = new Date()
        const resultado = hacerOfrenda(p, accionId, ahora, azarReal, nuevoId())
        // ¿Ha cumplido un reto con esta hazaña? Lo celebra en casa, con su premio.
        const mes = mesActual(p)
        const antes = progresoRetos(p, mes, ahora)
        const despues = progresoRetos(resultado.partida, mesActual(resultado.partida), ahora)
        const cumplido = despues.findIndex((r, i) => r.cumplido && !antes[i]?.cumplido)
        let partida = resultado.partida
        let frase = resultado.frase
        const premios = [resultado.sorpresa, resultado.premio].filter((x) => x !== null).map((x) => x!.nombre)
        if (cumplido >= 0) {
          const r = elegirFrase(partida, mes.companero, 'retoCumplido', azarReal)
          if (r.frase) { frase = r.frase; partida = { ...partida, frasesRecientes: r.recientes } }
          const premio = premioDeReto(mes.companero, cumplido)
          if (premio) premios.push(premio.nombre)
        }
        set({
          partida,
          recientes: [...get().recientes, { resultado, hasta: ahora.getTime() + SEGUNDOS_DESHACER * 1000 }].slice(-20),
          porContar: {
            frase: frase ?? get().porContar?.frase ?? null,
            hallazgos: [...(get().porContar?.hallazgos ?? []), ...premios],
          },
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
        set({ partida: deshacerOfrenda(partida, u.resultado.ofrenda.id), recientes: [...resto], porContar: anterior ? { frase: anterior.resultado.frase, hallazgos: [] } : null })
      },
      olvidarRecientes: () => set({ recientes: [] }),
      quitarUna: (accionId) => {
        const p = get().partida
        if (!p) return
        const hoy = dia(new Date().toISOString())
        const ultima = [...p.ofrendas].reverse().find((o) => o.accionId === accionId && dia(o.fecha) === hoy)
        if (ultima) set({ partida: deshacerOfrenda(p, ultima.id), recientes: get().recientes.filter((r) => r.resultado.ofrenda.id !== ultima.id), porContar: null })
      },
      porContar: null,
      contar: () => {
        const f = get().porContar
        if (f) set({ porContar: null })
        return f
      },
      ponerDiaMalo: (v) => {
        const p = get().partida
        if (p) set({ partida: cambiarDiaMalo(p, v, new Date()) })
      },
      tocar: (c, soloSaludo) => {
        const p = get().partida
        if (!p) return null
        const r = fraseAlTocar(p, c, new Date(), azarReal, soloSaludo)
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
      verEtapa: (c, etapa) => {
        const p = get().partida
        if (!p) return null
        const vista = marcarEtapaVista(p, c, etapa)
        const r = etapa > 0 ? elegirFrase(vista, c, `crecer${etapa}` as 'crecer1' | 'crecer2', azarReal) : null
        set({ partida: r ? { ...vista, frasesRecientes: r.recientes } : vista })
        return r?.frase ?? null
      },
      picar: (tipo) => {
        const p = get().partida
        if (!p) return null
        const r = elegirFrase(p, mesActual(p).companero, tipo, azarReal)
        set({ partida: { ...p, frasesRecientes: r.recientes } })
        return r.frase
      },
      fijarRetos: (retos) => {
        const p = get().partida
        const hecha = p && elegirRetos(p, retos)
        if (!hecha) return false
        const r = elegirFrase(hecha, mesActual(hecha).companero, 'retosListos', azarReal)
        set({ partida: { ...hecha, frasesRecientes: r.recientes }, porContar: { frase: r.frase, hallazgos: [] } })
        return true
      },
      gastarComodin: (i, reto) => {
        const p = get().partida
        const hecha = p && usarComodin(p, i, reto)
        if (!hecha) return null
        const r = elegirFrase(hecha, mesActual(hecha).companero, 'comodin', azarReal)
        set({ partida: { ...hecha, frasesRecientes: r.recientes } })
        return r.frase
      },
      pasarMes: () => {
        const p = get().partida
        const siguiente = p && empezarMesSiguiente(p, new Date(), azarReal, ORDEN_COMPANEROS.filter(tieneMes))
        if (!siguiente) return false
        set({ partida: siguiente, porContar: null, recientes: [] })
        return true
      },
      presentar: () => {
        const p = get().partida
        if (p) set({ partida: marcarPresentado(p, new Date()) })
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
