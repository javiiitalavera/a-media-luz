// Motor de sonido: un único AudioContext para música y efectos.
// En el móvil el audio solo puede arrancar tras un toque del usuario, así que se crea al primer toque.
import type { AreaId, CompaneroId, Momento } from '../contenido'
import { azarConSemilla, type Azar } from '../logica/azar'
import { ESTILOS, generarCompas, segundosPorPulso, type Estilo } from './partitura'
import { bajo, campana, colchon, crearReverb, gorjeo, madera, ruido } from './instrumentos'

const VOLUMEN_MUSICA = 0.55
const VOLUMEN_EFECTOS = 0.8

interface Buses {
  ctx: AudioContext
  musica: GainNode
  efectos: GainNode
  reverb: ConvolverNode
  envioReverbMusica: GainNode
  envioReverbEfectos: GainNode
}

let buses: Buses | null = null
let musicaActiva = false
let efectosActivos = true
let estiloActual: keyof typeof ESTILOS = 'noche'

// ---------- Arranque ----------

function crear(): Buses | null {
  if (buses) return buses
  const Clase = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Clase) return null
  // En iPhone: que respete el interruptor de silencio, como los juegos «ambientales».
  const sesion = (navigator as unknown as { audioSession?: { type: string } }).audioSession
  if (sesion) sesion.type = 'ambient'
  const ctx = new Clase()
  const maestro = ctx.createDynamicsCompressor()
  maestro.threshold.value = -18
  maestro.ratio.value = 3
  maestro.connect(ctx.destination)
  const reverb = crearReverb(ctx)
  const salidaReverb = ctx.createGain()
  salidaReverb.gain.value = 0.9
  reverb.connect(salidaReverb).connect(maestro)
  const musica = ctx.createGain()
  musica.gain.value = 0
  musica.connect(maestro)
  const efectos = ctx.createGain()
  efectos.gain.value = efectosActivos ? VOLUMEN_EFECTOS : 0
  efectos.connect(maestro)
  const envioReverbMusica = ctx.createGain()
  envioReverbMusica.gain.value = 0.55
  envioReverbMusica.connect(reverb)
  musica.connect(envioReverbMusica)
  const envioReverbEfectos = ctx.createGain()
  envioReverbEfectos.gain.value = 0.35
  envioReverbEfectos.connect(reverb)
  efectos.connect(envioReverbEfectos)
  buses = { ctx, musica, efectos, reverb, envioReverbMusica, envioReverbEfectos }
  return buses
}

/** Llamar en el primer toque: crea el audio y lo despierta. */
export function desbloquear() {
  const b = crear()
  if (!b) return
  if (b.ctx.state !== 'running') void b.ctx.resume()
  // Si la música estaba activada antes de poder sonar, se sube ahora (antes se quedaba en silencio).
  if (musicaActiva && b.musica.gain.value < 0.01 && temporizador === null) ponerMusica(true)
}

/** Al salir de la app se pausa todo; al volver, sigue. */
export function pausar(pausado: boolean) {
  if (!buses) return
  if (pausado) void buses.ctx.suspend()
  else if (musicaActiva || efectosActivos) void buses.ctx.resume()
}

// ---------- Música ----------

let siguienteCompas = 0
let indiceCompas = 0
let ultimaNota: number | undefined
let temporizador: number | null = null
const azarMusica: Azar = azarConSemilla(`musica-${Date.now()}`)

/** Programa un compás entero en el contexto y el destino dados (también sirve para grabarlo). */
export function tocarCompas(ctx: BaseAudioContext, destino: AudioNode, estilo: Estilo, t: number, indice: number, azar: Azar, previa?: number) {
  const pulso = segundosPorPulso(estilo)
  const c = generarCompas(estilo, indice, azar, previa)
  const volumen = ctx.createGain()
  volumen.gain.value = estilo.volumen
  volumen.connect(destino)
  destino = volumen
  colchon(ctx, destino, c.acorde, t, pulso * 4, estilo.brillo)
  bajo(ctx, destino, c.bajo, t, pulso * 2)
  if (indice % 2 === 1) bajo(ctx, destino, c.bajo + 7, t + pulso * 2, pulso * 2)
  for (const n of c.melodia) campana(ctx, destino, n.midi, t + n.pulso * pulso, 0.05, 2.2)
  return { duracion: pulso * 4, ultima: c.melodia.at(-1)?.midi ?? previa }
}

function planificar() {
  if (!buses || !musicaActiva) return
  const { ctx } = buses
  // Programa con medio segundo de margen para que no haya cortes.
  while (siguienteCompas < ctx.currentTime + 0.6) {
    if (siguienteCompas < ctx.currentTime) siguienteCompas = ctx.currentTime + 0.05
    const r = tocarCompas(ctx, buses.musica, ESTILOS[estiloActual], siguienteCompas, indiceCompas++, azarMusica, ultimaNota)
    ultimaNota = r.ultima
    siguienteCompas += r.duracion
  }
}

function arrancarPlanificador() {
  if (!buses || temporizador !== null) return
  siguienteCompas = buses.ctx.currentTime + 0.1
  temporizador = window.setInterval(planificar, 200)
  planificar()
}

function pararPlanificador() {
  if (temporizador !== null) window.clearInterval(temporizador)
  temporizador = null
}

/** Enciende o apaga la música (con fundido). */
export function ponerMusica(activa: boolean) {
  musicaActiva = activa
  const b = buses
  if (!b) return
  const ahora = b.ctx.currentTime
  b.musica.gain.cancelScheduledValues(ahora)
  b.musica.gain.setValueAtTime(b.musica.gain.value, ahora)
  if (activa) {
    if (b.ctx.state !== 'running') void b.ctx.resume()
    b.musica.gain.linearRampToValueAtTime(VOLUMEN_MUSICA, ahora + 3)
    arrancarPlanificador()
  } else {
    b.musica.gain.linearRampToValueAtTime(0, ahora + 1.2)
    window.setTimeout(() => !musicaActiva && pararPlanificador(), 1300)
  }
}

/** Cambia el estilo de la música (momento del día o casa apagada). Se nota desde el siguiente compás. */
export function ponerEstilo(momento: Momento, apagada: boolean) {
  estiloActual = apagada ? 'apagada' : momento
}

export function ponerEfectos(activos: boolean) {
  efectosActivos = activos
  if (buses) buses.efectos.gain.value = activos ? VOLUMEN_EFECTOS : 0
}

// ---------- Efectos ----------

function efecto(tocar: (ctx: BaseAudioContext, destino: AudioNode, t: number) => void) {
  if (!efectosActivos) return
  const b = crear()
  if (!b) return
  if (b.ctx.state !== 'running') void b.ctx.resume()
  tocar(b.ctx, b.efectos, b.ctx.currentTime + 0.01)
}

// Dos notas por área, para que cada una «suene» distinta.
const NOTAS_AREA: Record<AreaId, [number, number]> = {
  cuerpo: [72, 79], mente: [74, 81], vinculos: [76, 83], calma: [77, 84], orden: [79, 86],
}

type Receta = (c: BaseAudioContext, d: AudioNode, t: number) => void

/** Recetas de cada efecto (se pueden tocar en vivo o grabar). */
export const RECETAS = {
  /** Toque suave en botones y pestañas. */
  toque: () => ((c: BaseAudioContext, d: AudioNode, t: number) => madera(c, d, t, 520, 0.05)),
  /** Registrar un acto: campanita en dos notas, con el color de su área. */
  registrar: (area: AreaId, sinLuz = false) =>
    ((c: BaseAudioContext, d: AudioNode, t: number) => {
      const [a, b] = NOTAS_AREA[area]
      if (sinLuz) return campana(c, d, a - 12, t, 0.07, 1.2)
      campana(c, d, a, t, 0.09)
      campana(c, d, b, t + 0.11, 0.08)
    }),
  deshacer: () => ((c: BaseAudioContext, d: AudioNode, t: number) => { campana(c, d, 76, t, 0.06, 0.6); campana(c, d, 69, t + 0.09, 0.06, 0.8) }),
  /** Sorpresa: arpegio que sube y brilla. */
  sorpresa: () => ((c: BaseAudioContext, d: AudioNode, t: number) => [84, 88, 91, 96, 100].forEach((n, i) => campana(c, d, n, t + 0.25 + i * 0.07, 0.05, 1.4))),
  /** Encargo cumplido: pequeña fanfarria. */
  cumplido: () =>
    ((c: BaseAudioContext, d: AudioNode, t: number) => {
      ;[72, 76, 79, 84].forEach((n, i) => campana(c, d, n, t + 0.3 + i * 0.12, 0.08, 2))
      ;[60, 67, 76].forEach((n) => campana(c, d, n, t + 0.8, 0.05, 3))
    }),
  /** La casa vuelve a encenderse. */
  rescate: () => ((c: BaseAudioContext, d: AudioNode, t: number) => { gorjeo(c, d, t, 220, 660, 0.6, 0.05); [69, 76, 81].forEach((n, i) => campana(c, d, n, t + 0.4 + i * 0.1, 0.07, 2.4)) }),
  /** Elegir un encargo o empezar. */
  elegir: () => ((c: BaseAudioContext, d: AudioNode, t: number) => { campana(c, d, 79, t, 0.07); campana(c, d, 84, t + 0.12, 0.07) }),
  /** Tocar un objeto: crepitar de fuego, clic metálico, roce de hoja o golpecito de madera. */
  objeto: (tipo: 'fuego' | 'metal' | 'hoja' | 'madera') => ((c: BaseAudioContext, d: AudioNode, t: number) => {
    if (tipo === 'fuego') [0, 0.07, 0.12, 0.21, 0.29, 0.34].forEach((x, i) => ruido(c, d, t + x, 0.05 + (i % 2) * 0.03, 900 + i * 350, 0.07, 'bandpass', 2400))
    else if (tipo === 'metal') { campana(c, d, 98, t, 0.05, 0.25); madera(c, d, t + 0.01, 1500, 0.05); campana(c, d, 103, t + 0.09, 0.03, 0.2) }
    else if (tipo === 'hoja') ruido(c, d, t, 0.32, 3200, 0.06, 'bandpass', 6000)
    else madera(c, d, t, 420, 0.12)
  }),
  /** Tachar una hazaña: rayita de lápiz y una campanita limpia. */
  tachar: () => ((c: BaseAudioContext, d: AudioNode, t: number) => {
    ruido(c, d, t, 0.16, 2600, 0.07, 'bandpass', 5200)
    campana(c, d, 84, t + 0.14, 0.08, 1.2)
    campana(c, d, 91, t + 0.24, 0.06, 1.4)
  }),
  /** Construir algo: golpes de martillo y campanita. */
  construir: () => ((c: BaseAudioContext, d: AudioNode, t: number) => {
    ;[0, 0.16, 0.32].forEach((x, i) => madera(c, d, t + x, 340 + i * 40, 0.14))
    ;[72, 79, 84].forEach((n, i) => campana(c, d, n, t + 0.55 + i * 0.1, 0.07, 1.8))
  }),
  /** El huevo se rompe. */
  eclosion: () => ((c: BaseAudioContext, d: AudioNode, t: number) => {
    ;[0, 0.35, 0.6].forEach((x) => madera(c, d, t + x, 1100, 0.08))
    ;[79, 84, 88, 91, 96].forEach((n, i) => campana(c, d, n, t + 0.9 + i * 0.08, 0.06, 1.6))
  }),
  /** Pasar página (noticias del barrio). */
  pagina: () => ((c: BaseAudioContext, d: AudioNode, t: number) => ruido(c, d, t, 0.35, 1800, 0.08, 'bandpass', 4500)),
  /** Tocar al personaje: cada uno con su voz. */
  personaje: (id: CompaneroId) =>
    ((c: BaseAudioContext, d: AudioNode, t: number) => {
      if (id === 'nox') { gorjeo(c, d, t, 620, 1150, 0.09); gorjeo(c, d, t + 0.12, 700, 1300, 0.1) }
      else if (id === 'tofu') { madera(c, d, t, 260, 0.2); madera(c, d, t + 0.16, 300, 0.12) }
      else if (id === 'tuerca') { campana(c, d, 91, t, 0.05, 0.3); campana(c, d, 96, t + 0.08, 0.05, 0.3); madera(c, d, t + 0.18, 900, 0.06) }
      else { ruido(c, d, t, 0.7, 700, 0.06, 'bandpass', 1600); campana(c, d, 88, t + 0.2, 0.035, 1.6) }
    }),
}

type Recetas = typeof RECETAS
/** Efectos listos para usar: suenan solo si los sonidos están activados. */
export const sfx = Object.fromEntries(
  Object.entries(RECETAS).map(([nombre, receta]) => [
    nombre,
    (...args: unknown[]) => efecto((receta as (...a: unknown[]) => Receta)(...args)),
  ]),
) as { [K in keyof Recetas]: (...args: Parameters<Recetas[K]>) => void }
