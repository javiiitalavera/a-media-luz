// Instrumentos y capas de efectos originales. Todos funcionan también en OfflineAudioContext.
import { frecuencia } from './partitura'

type Ctx = BaseAudioContext

const SILENCIO = 0.00001
const blancos = new WeakMap<Ctx, AudioBuffer>()

export function crearReverb(ctx: Ctx): ConvolverNode {
  const sala = ctx.createConvolver()
  const largo = Math.round(ctx.sampleRate * 1.65)
  const impulso = ctx.createBuffer(2, largo, ctx.sampleRate)
  for (let canal = 0; canal < 2; canal++) {
    const datos = impulso.getChannelData(canal)
    let suavizado = 0
    for (let i = 0; i < largo; i++) {
      suavizado = suavizado * .56 + (Math.random() * 2 - 1) * .44
      datos[i] = i < ctx.sampleRate * .023 ? 0 : suavizado * .18 * (1 - i / largo) ** 4
    }
    for (const [ms, nivel] of [[27, .17], [43, .12], [61, .10], [87, .06]]) {
      datos[Math.round(ctx.sampleRate * (ms + canal * 9) / 1000)] += nivel
    }
  }
  sala.buffer = impulso
  return sala
}

function envolvente(ctx: Ctx, destino: AudioNode, t: number, ataque: number, cuerpo: number, cola: number, pico: number) {
  const g = ctx.createGain()
  g.gain.setValueAtTime(SILENCIO, t)
  g.gain.linearRampToValueAtTime(pico, t + ataque)
  if (cuerpo > 0) g.gain.exponentialRampToValueAtTime(Math.max(pico * .62, SILENCIO), t + ataque + cuerpo)
  g.gain.exponentialRampToValueAtTime(SILENCIO, t + ataque + cuerpo + cola)
  g.connect(destino)
  return g
}

type Parcial = readonly [multiplo: number, peso: number, cola: number]
const MARTILLO: Parcial[] = [[1, 1, 1], [2.002, .59, .83], [3.012, .33, .54], [4.035, .14, .36], [5.06, .07, .23]]
const CUERDA: Parcial[] = [[1, 1, 1], [2.003, .47, .78], [3.01, .29, .51], [4.03, .16, .34], [5.07, .09, .25]]
const VIDRIO: Parcial[] = [[1, 1, 1], [2.006, .18, .55], [2.79, .20, .34], [4.13, .10, .18]]

function resonar(ctx: Ctx, destino: AudioNode, hz: number, t: number, ataque: number, cola: number, volumen: number, parciales: Parcial[]) {
  for (const [mult, peso, caida] of parciales) {
    const o = ctx.createOscillator()
    o.frequency.value = hz * mult
    o.connect(envolvente(ctx, destino, t, ataque, 0, cola * caida, volumen * peso))
    o.start(t)
    o.stop(t + ataque + cola * caida + .01)
  }
}

export function panorama(ctx: Ctx, destino: AudioNode, posicion: number): AudioNode {
  if (!ctx.createStereoPanner) return destino
  const p = ctx.createStereoPanner()
  p.pan.value = posicion
  p.connect(destino)
  return p
}

export function piano(ctx: Ctx, destino: AudioNode, midi: number, t: number, dinamica = .11, duracion = 1.9) {
  const hz = frecuencia(midi)
  resonar(ctx, destino, hz, t, .004, duracion, dinamica, MARTILLO)
  // La segunda cuerda y el fieltro dan cuerpo al ataque sin convertirlo en un clic.
  resonar(ctx, destino, hz * 1.0018, t + .007, .011, duracion * .86, dinamica * .26, MARTILLO.slice(0, 2))
  ruido(ctx, destino, t, .032, 960 + hz, dinamica * .27, 1)
}

export function cuerda(ctx: Ctx, destino: AudioNode, midi: number, t: number, dinamica = .1, duracion = 1.4) {
  resonar(ctx, destino, frecuencia(midi), t, .009, duracion, dinamica, CUERDA)
  ruido(ctx, destino, t, .06, 1450, dinamica * .33, 1.6, 3800)
}

export function flauta(ctx: Ctx, destino: AudioNode, midi: number, t: number, dinamica = .085, duracion = .8) {
  const hz = frecuencia(midi)
  const g = envolvente(ctx, destino, t, .065, duracion * .58, duracion * .42, dinamica)
  const vibrato = ctx.createOscillator()
  vibrato.frequency.value = 4.6
  const oscilacion = ctx.createGain()
  oscilacion.gain.setValueAtTime(0, t)
  oscilacion.gain.linearRampToValueAtTime(9, t + .25)
  vibrato.connect(oscilacion)
  for (const [mult, peso] of [[1, 1], [2, .16], [3, .065]]) {
    const o = ctx.createOscillator()
    o.frequency.value = hz * mult
    const parcial = ctx.createGain()
    parcial.gain.value = peso
    oscilacion.connect(o.detune)
    o.connect(parcial).connect(g)
    o.start(t)
    o.stop(t + duracion + .08)
  }
  vibrato.start(t)
  vibrato.stop(t + duracion + .08)
  ruido(ctx, destino, t, duracion * .65, 2050, dinamica * .36, .9)
}

export function bajo(ctx: Ctx, destino: AudioNode, midi: number, t: number, duracion: number, nivel: number) {
  const hz = frecuencia(midi)
  resonar(ctx, destino, hz, t, .032, duracion, nivel, [[1, 1, 1], [2, .43, .75], [3, .12, .45]])
}

export function cuerdasDeFondo(ctx: Ctx, destino: AudioNode, notas: number[], t: number, duracion: number, brillo: number) {
  const filtro = ctx.createBiquadFilter()
  filtro.type = 'lowpass'
  filtro.frequency.value = brillo
  filtro.Q.value = .3
  filtro.connect(envolvente(ctx, destino, t, .65, duracion * .58, 1.26, .038))
  notas.forEach((n, i) => {
    const voz = panorama(ctx, filtro, i % 2 ? .38 : -.38)
    for (const copia of [-1, 1]) {
      const o = ctx.createOscillator()
      o.type = 'triangle'
      o.frequency.value = frecuencia(n)
      o.detune.value = copia * (3 + i)
      o.connect(voz)
      o.start(t)
      o.stop(t + .67 + duracion * .58 + 1.26)
    }
  })
}

export function cristal(ctx: Ctx, destino: AudioNode, midi: number, t: number, nivel = .08, cola = .9) {
  resonar(ctx, destino, frecuencia(midi), t, .004, cola, nivel, VIDRIO)
}

export function madera(ctx: Ctx, destino: AudioNode, t: number, hz: number, nivel: number, cola = .22) {
  resonar(ctx, destino, hz, t, .003, cola, nivel, [[1, 1, 1], [1.64, .53, .55], [2.48, .24, .30]])
  ruido(ctx, destino, t, .038, 2350, nivel * .6, 1.2, 1120)
}

export function ruido(ctx: Ctx, destino: AudioNode, t: number, duracion: number, hz: number, nivel: number, q = 1.2, fin?: number) {
  let blanco = blancos.get(ctx)
  if (!blanco) {
    blanco = ctx.createBuffer(1, Math.round(ctx.sampleRate * 2), ctx.sampleRate)
    const datos = blanco.getChannelData(0)
    for (let i = 0; i < datos.length; i++) datos[i] = Math.random() * 2 - 1
    blancos.set(ctx, blanco)
  }
  const fuente = ctx.createBufferSource()
  fuente.buffer = blanco
  const filtro = ctx.createBiquadFilter()
  filtro.type = 'bandpass'
  filtro.Q.value = q
  filtro.frequency.setValueAtTime(hz, t)
  if (fin) filtro.frequency.exponentialRampToValueAtTime(fin, t + duracion)
  fuente.connect(filtro).connect(envolvente(ctx, destino, t, duracion * .18, duracion * .15, duracion * .67, nivel))
  fuente.start(t, Math.random() * Math.max(0, blanco.duration - duracion), duracion)
}

export function voz(ctx: Ctx, destino: AudioNode, t: number, desde: number, hasta: number, duracion: number, timbre: 'aire' | 'madera' | 'metal' | 'calido', nivel: number) {
  const color: Record<typeof timbre, [number, number, number]> = {
    aire: [640, .24, .09], madera: [390, .37, .14], metal: [1750, .49, .25], calido: [950, .58, .26],
  }
  const [formante, segundo, tercero] = color[timbre]
  const g = envolvente(ctx, destino, t, .019, duracion * .56, .05, nivel)
  for (const [mult, peso] of [[1, 1], [2, segundo], [3, tercero]]) {
    const o = ctx.createOscillator()
    o.frequency.setValueAtTime(desde * mult, t)
    o.frequency.exponentialRampToValueAtTime(hasta * mult, t + duracion * .72)
    o.frequency.exponentialRampToValueAtTime(hasta * mult * .86, t + duracion)
    const parcial = ctx.createGain()
    parcial.gain.value = peso
    o.connect(parcial).connect(g)
    o.start(t)
    o.stop(t + duracion + .06)
  }
  ruido(ctx, destino, t, duracion * .93, formante, nivel * .58, 2, formante * 1.39)
}
