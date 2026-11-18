// Instrumentos sintetizados con Web Audio. Reciben el contexto y el destino,
// así se pueden usar en vivo o para grabar un fragmento (OfflineAudioContext).
import { frecuencia } from './partitura'

type Ctx = BaseAudioContext

/** Reverberación suave generada (ruido que se apaga poco a poco). */
export function crearReverb(ctx: Ctx, segundos = 2.8): ConvolverNode {
  const conv = ctx.createConvolver()
  const largo = Math.floor(ctx.sampleRate * segundos)
  const impulso = ctx.createBuffer(2, largo, ctx.sampleRate)
  for (let canal = 0; canal < 2; canal++) {
    const d = impulso.getChannelData(canal)
    for (let i = 0; i < largo; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / largo) ** 3
  }
  conv.buffer = impulso
  return conv
}

function envolvente(ctx: Ctx, destino: AudioNode, t: number, ataque: number, mantener: number, caida: number, pico: number) {
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(pico, t + ataque)
  g.gain.setValueAtTime(pico, t + ataque + mantener)
  g.gain.exponentialRampToValueAtTime(0.0001, t + ataque + mantener + caida)
  g.connect(destino)
  return g
}

/** Colchón cálido: dos osciladores triangulares un poco desafinados por nota, con filtro. */
export function colchon(ctx: Ctx, destino: AudioNode, notas: number[], t: number, dur: number, brillo: number) {
  const filtro = ctx.createBiquadFilter()
  filtro.type = 'lowpass'
  filtro.frequency.setValueAtTime(brillo * 0.7, t)
  filtro.frequency.linearRampToValueAtTime(brillo, t + dur / 2)
  filtro.frequency.linearRampToValueAtTime(brillo * 0.7, t + dur)
  filtro.Q.value = 0.4
  const g = envolvente(ctx, destino, t, 1.4, Math.max(0, dur - 1.4), 1.8, 0.05)
  filtro.connect(g)
  for (const n of notas) {
    for (const desafine of [-7, 7]) {
      const o = ctx.createOscillator()
      o.type = 'triangle'
      o.frequency.value = frecuencia(n)
      o.detune.value = desafine
      o.connect(filtro)
      o.start(t)
      o.stop(t + dur + 2)
    }
  }
}

/** Bajo redondo y suave. */
export function bajo(ctx: Ctx, destino: AudioNode, midi: number, t: number, dur: number) {
  const o = ctx.createOscillator()
  o.type = 'sine'
  o.frequency.value = frecuencia(midi)
  o.connect(envolvente(ctx, destino, t, 0.08, dur * 0.4, dur * 0.6, 0.09))
  o.start(t)
  o.stop(t + dur + 0.1)
}

/** Caja de música / campanita: seno con un parcial metálico que se apaga antes. */
export function campana(ctx: Ctx, destino: AudioNode, midi: number, t: number, volumen = 0.06, caida = 1.8) {
  const f = frecuencia(midi)
  const parciales: [number, number, number][] = [[1, 1, caida], [2.76, 0.25, caida * 0.35], [5.4, 0.08, caida * 0.15]]
  for (const [mult, amp, c] of parciales) {
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.value = f * mult
    o.connect(envolvente(ctx, destino, t, 0.006, 0, c, volumen * amp))
    o.start(t)
    o.stop(t + c + 0.05)
  }
}

/** Golpe de madera («toc»): seno grave muy corto + un chasquido de ruido filtrado. */
export function madera(ctx: Ctx, destino: AudioNode, t: number, tono = 320, volumen = 0.18) {
  const o = ctx.createOscillator()
  o.type = 'sine'
  o.frequency.setValueAtTime(tono * 1.6, t)
  o.frequency.exponentialRampToValueAtTime(tono, t + 0.03)
  o.connect(envolvente(ctx, destino, t, 0.002, 0, 0.12, volumen))
  o.start(t)
  o.stop(t + 0.2)
  ruido(ctx, destino, t, 0.03, 2500, volumen * 0.5, 'bandpass')
}

/** Ruido filtrado (soplo, pasar página, chasquido). */
export function ruido(
  ctx: Ctx, destino: AudioNode, t: number, dur: number, frec: number, volumen: number,
  tipo: BiquadFilterType = 'bandpass', frecFinal?: number,
) {
  const largo = Math.max(1, Math.floor(ctx.sampleRate * dur))
  const buffer = ctx.createBuffer(1, largo, ctx.sampleRate)
  const d = buffer.getChannelData(0)
  for (let i = 0; i < largo; i++) d[i] = Math.random() * 2 - 1
  const fuente = ctx.createBufferSource()
  fuente.buffer = buffer
  const filtro = ctx.createBiquadFilter()
  filtro.type = tipo
  filtro.frequency.setValueAtTime(frec, t)
  if (frecFinal) filtro.frequency.exponentialRampToValueAtTime(frecFinal, t + dur)
  filtro.Q.value = 1.2
  fuente.connect(filtro)
  filtro.connect(envolvente(ctx, destino, t, dur * 0.35, 0, dur * 0.65, volumen))
  fuente.start(t)
  fuente.stop(t + dur + 0.05)
}

/** Gorjeo corto que sube (la «voz» de Nox). */
export function gorjeo(ctx: Ctx, destino: AudioNode, t: number, desde: number, hasta: number, dur = 0.12, volumen = 0.07) {
  const o = ctx.createOscillator()
  o.type = 'sine'
  o.frequency.setValueAtTime(desde, t)
  o.frequency.exponentialRampToValueAtTime(hasta, t + dur)
  o.connect(envolvente(ctx, destino, t, 0.01, dur * 0.3, dur * 0.7, volumen))
  o.start(t)
  o.stop(t + dur + 0.05)
}
