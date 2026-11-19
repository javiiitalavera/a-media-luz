// Web Audio se inicia al primer gesto y comparte una sola mezcla para música y efectos.
import type { Momento } from '../contenido'
import { RECETAS, type Receta } from './efectos'
import { crearMezcla, NIVEL_EFECTOS, NIVEL_MUSICA, tocarCompas } from './mezcla'
import { ESTILOS } from './partitura'

type Ambiente = keyof typeof ESTILOS
interface Buses {
  ctx: AudioContext
  musica: GainNode
  efectos: GainNode
  ducking: GainNode
}

let buses: Buses | undefined
let musicaActiva = false
let efectosActivos = true
let ambientePedido: Ambiente = 'noche'
let ambienteProgramado: Ambiente | undefined
let siguienteCompas = 0
let indiceCompas = 0
let temporizador: number | undefined
const ultimoSonido = new Map<keyof typeof RECETAS, number>()

function crear(): Buses | undefined {
  const Clase = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Clase) return
  const sesion = (navigator as Navigator & { audioSession?: { type: string } }).audioSession
  try { if (sesion) sesion.type = 'ambient' } catch { /* La API aún no es uniforme. */ }
  const ctx = new Clase()
  const { musica, efectos } = crearMezcla(ctx)
  const ducking = ctx.createGain()
  ducking.connect(musica)
  musica.gain.value = 0
  efectos.gain.value = efectosActivos ? NIVEL_EFECTOS : 0
  return { ctx, musica, efectos, ducking }
}

function planificar() {
  if (!buses || !musicaActiva || document.hidden || buses.ctx.state !== 'running') return
  const { ctx, ducking } = buses
  siguienteCompas = Math.max(siguienteCompas, ctx.currentTime + .035)
  while (siguienteCompas < ctx.currentTime + .4) {
    if (ambienteProgramado !== ambientePedido) {
      ambienteProgramado = ambientePedido
      indiceCompas = 0
    }
    siguienteCompas += tocarCompas(ctx, ducking, ESTILOS[ambienteProgramado], siguienteCompas, indiceCompas++)
  }
}

function arrancar() {
  if (temporizador !== undefined) return
  temporizador = window.setInterval(planificar, 160)
  planificar()
}

function parar() {
  window.clearInterval(temporizador)
  temporizador = undefined
}

function despertar(b: Buses) {
  if (document.hidden) return
  if (b.ctx.state === 'running') {
    if (musicaActiva) arrancar()
    return
  }
  void b.ctx.resume().then(() => {
    if (musicaActiva && !document.hidden && b.ctx.state === 'running') arrancar()
  }).catch(() => { /* Otro gesto puede volver a activar el contexto. */ })
}

export function desbloquear() {
  if (!buses) {
    try { buses = crear() } catch { return }
    if (buses && musicaActiva) ponerMusica(true)
  }
  if (buses) despertar(buses)
}

export function pausar(pausado: boolean) {
  if (!buses) return
  if (pausado) {
    parar()
    void buses.ctx.suspend().catch(() => {})
  } else if (musicaActiva || efectosActivos) {
    despertar(buses)
  }
}

export function ponerMusica(activa: boolean) {
  musicaActiva = activa
  if (!buses) return
  const { ctx, musica } = buses
  musica.gain.cancelScheduledValues(ctx.currentTime)
  musica.gain.setTargetAtTime(activa ? NIVEL_MUSICA : 0, ctx.currentTime, activa ? .38 : .23)
  if (activa) despertar(buses)
  else parar()
}

export function ponerEfectos(activos: boolean) {
  efectosActivos = activos
  if (buses) buses.efectos.gain.setTargetAtTime(activos ? NIVEL_EFECTOS : 0, buses.ctx.currentTime, .025)
}

export function ponerEstilo(momento: Momento, apagada: boolean) {
  ambientePedido = apagada ? 'apagada' : momento
}

const PRIMER_PLANO: Partial<Record<keyof typeof RECETAS, number>> = {
  cumplido: 1, eclosion: 1.8, construir: .95, sorpresa: .5,
}

function efecto(nombre: keyof typeof RECETAS, tocar: Receta) {
  if (!efectosActivos || !buses || document.hidden) return
  const { ctx, efectos, ducking } = buses
  if (ctx.state !== 'running') despertar(buses)
  const t = ctx.currentTime + .009
  if (t - (ultimoSonido.get(nombre) ?? -1) < .065) return
  ultimoSonido.set(nombre, t)
  const primerPlano = PRIMER_PLANO[nombre]
  if (musicaActiva && primerPlano) {
    ducking.gain.cancelScheduledValues(t)
    ducking.gain.setTargetAtTime(.66, t, .045)
    ducking.gain.setTargetAtTime(1, t + primerPlano, .24)
  }
  tocar(ctx, efectos, t)
}

type Recetas = typeof RECETAS
export const sfx = Object.fromEntries(
  Object.entries(RECETAS).map(([nombre, receta]) => [
    nombre,
    (...args: unknown[]) => efecto(nombre as keyof Recetas, (receta as (...a: unknown[]) => Receta)(...args)),
  ]),
) as { [K in keyof Recetas]: (...args: Parameters<Recetas[K]>) => void }
