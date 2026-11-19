import { bajo, crearReverb, cristal, cuerda, cuerdasDeFondo, flauta, madera, panorama, piano } from './instrumentos'
import { compas, segundosPorPulso, type Estilo } from './partitura'

export const NIVEL_MUSICA = .72
export const NIVEL_EFECTOS = .83

export function crearMezcla(ctx: BaseAudioContext) {
  const maestro = ctx.createDynamicsCompressor()
  maestro.threshold.value = -13
  maestro.knee.value = 12
  maestro.ratio.value = 3.5
  maestro.attack.value = .012
  maestro.release.value = .22
  maestro.connect(ctx.destination)

  const sala = crearReverb(ctx)
  const retorno = ctx.createBiquadFilter()
  retorno.type = 'lowpass'
  retorno.frequency.value = 3800
  sala.connect(retorno).connect(maestro)

  function canal(profundidad: number) {
    const entrada = ctx.createGain()
    const envio = ctx.createGain()
    envio.gain.value = profundidad
    entrada.connect(maestro)
    entrada.connect(envio).connect(sala)
    return entrada
  }

  return { musica: canal(.35), efectos: canal(.18) }
}

const SOLISTA = { piano, flauta, cuerda }
const INTENCION = [1, .79, .89, .72]

/** Un compás completo, con una entrada y salida armónicas incluso al cambiar de luz. */
export function tocarCompas(ctx: BaseAudioContext, destino: AudioNode, estilo: Estilo, t: number, indice: number) {
  const pulso = segundosPorPulso(estilo)
  const duracion = pulso * estilo.pulsos
  const notas = compas(estilo, indice)
  const volumen = ctx.createGain()
  volumen.gain.value = estilo.volumen
  volumen.connect(destino)

  const izquierda = panorama(ctx, volumen, -.26)
  const derecha = panorama(ctx, volumen, .25)
  const centro = panorama(ctx, volumen, -.04)
  const { acompanamiento } = estilo
  const pleno = indice % 16 >= 8 && indice % 16 < 12
  const espacioso = acompanamiento === 'espaciado'
  bajo(ctx, centro, notas.bajo, t, pulso * (espacioso ? 1.9 : 2.8), espacioso ? .055 : .092)
  if (acompanamiento === 'pulso') {
    bajo(ctx, centro, notas.bajo + 12, t + pulso * 2.5, pulso * 1.25, .063)
    madera(ctx, derecha, t + pulso * 1.5, 190, .016, .12)
    madera(ctx, izquierda, t + pulso * 3.5, 228, .017, .10)
  }

  if (espacioso || pleno || indice % 4 === 0) {
    cuerdasDeFondo(ctx, volumen, notas.acorde.slice(-3), t, duracion, estilo.brillo)
  }
  const ritmo = acompanamiento === 'arpegio'
    ? [0, .5, 1, 1.75, 2.5, 3.25].filter((p) => p < estilo.pulsos)
    : espacioso ? [.25, 1.5] : [.5, 1, 1.75, 2.5, 3, 3.5]
  const acompana = acompanamiento === 'pulso' ? cuerda : piano
  ritmo.forEach((p, i) => {
    const n = notas.acorde[i % notas.acorde.length]
    acompana(ctx, i % 2 ? derecha : izquierda, n, t + pulso * p + (i % 2 ? .018 : 0), (i % 2 ? .045 : .062) * (espacioso ? .72 : 1), 1.45)
  })

  const tema = SOLISTA[estilo.voz]
  notas.melodia.forEach(([p, n], i) => {
    const tiempo = t + pulso * p + (i % 2 ? .014 : 0)
    const siguiente = notas.melodia[i + 1]?.[0] ?? estilo.pulsos + .3
    const dur = estilo.voz === 'flauta' ? Math.min((siguiente - p) * pulso * .88, 1.15) : espacioso ? 2.65 : 1.95
    tema(ctx, centro, n, tiempo, (estilo.voz === 'flauta' ? .084 : .128) * INTENCION[i % INTENCION.length], dur)
    if (pleno && i === 0 && !espacioso) cristal(ctx, derecha, n + 12, tiempo + .027, .026, 1.38)
  })

  const fin = ctx.createConstantSource()
  fin.offset.value = 0
  fin.connect(volumen)
  fin.onended = () => volumen.disconnect()
  fin.start(t)
  fin.stop(t + duracion + 3.2)
  return duracion
}
