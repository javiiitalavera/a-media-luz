// Foley e indicaciones musicales originales. Las señales breves quedan por delante del acompañamiento.
import type { AreaId, CompaneroId } from '../contenido'
import { cristal, cuerda, flauta, madera, panorama, piano, ruido, voz } from './instrumentos'

export type Receta = (ctx: BaseAudioContext, salida: AudioNode, t: number) => void
type Objeto = 'fuego' | 'metal' | 'hoja' | 'madera'

const MARCA: Record<AreaId, readonly [number, number]> = {
  cuerpo: [60, 67], mente: [64, 72], vinculos: [65, 72], calma: [62, 69], orden: [67, 74],
}

export const RECETAS = {
  toque: (): Receta => (c, d, t) => {
    madera(c, d, t, 335, .066, .09)
    ruido(c, d, t + .009, .05, 1200, .038, 1.3, 2250)
  },
  puerta: (): Receta => (c, d, t) => {
    madera(c, d, t, 154, .15, .18)
    ruido(c, d, t + .042, .24, 1680, .12, .7, 710)
    cuerda(c, d, 67, t + .17, .064, .62)
  },
  tachar: (area: AreaId): Receta => (c, d, t) => {
    const [a, b] = MARCA[area]
    ruido(c, d, t, .104, 1870, .19, 1.6, 4800)
    ruido(c, d, t + .065, .083, 3150, .11, 1.0, 850)
    cuerda(c, d, a, t + .08, .115, .57)
    piano(c, d, b, t + .17, .10, .73)
  },
  deshacer: (): Receta => (c, d, t) => {
    ruido(c, d, t, .137, 2950, .14, 1.1, 970)
    cuerda(c, d, 67, t + .03, .076, .36)
    cuerda(c, d, 62, t + .108, .085, .53)
  },
  sorpresa: (): Receta => (c, d, t) => {
    ruido(c, d, t, .25, 690, .12, 1, 2950)
    piano(c, d, 67, t + .06, .15, .96)
    cuerda(c, panorama(c, d, -.32), 76, t + .15, .13, .96)
    cristal(c, panorama(c, d, .33), 84, t + .29, .14, 1.38)
    cristal(c, d, 79, t + .32, .075, 1.22)
  },
  cumplido: (): Receta => (c, d, t) => {
    piano(c, d, 48, t, .19, 1.55)
    ;[64, 67, 69, 72].forEach((n, i) => cuerda(c, panorama(c, d, i % 2 ? .23 : -.23), n, t + .10 + i * .127, .135, 1.2))
    flauta(c, d, 76, t + .55, .10, .75)
    cristal(c, d, 84, t + .67, .078, 1.27)
  },
  elegir: (): Receta => (c, d, t) => {
    madera(c, d, t, 455, .09, .1)
    cuerda(c, d, 64, t + .031, .092, .42)
    cuerda(c, d, 72, t + .119, .105, .64)
  },
  pagina: (): Receta => (c, d, t) => {
    ruido(c, panorama(c, d, -.22), t, .215, 2100, .19, .95, 4100)
    ruido(c, panorama(c, d, .14), t + .112, .146, 1350, .14, .65, 2900)
    madera(c, d, t + .166, 341, .065, .1)
  },
  construir: (): Receta => (c, d, t) => {
    for (const [i, instante] of [0, .135, .285].entries()) {
      const martillo = panorama(c, d, (i - 1) * .20)
      madera(c, martillo, t + instante, 176 + i * 25, .20 - i * .015, .153)
      cristal(c, martillo, 97 - i * 2, t + instante + .009, .037, .19)
    }
    ruido(c, d, t + .48, .19, 1520, .12, .9, 635)
    madera(c, d, t + .55, 112, .23, .25)
    piano(c, d, 60, t + .59, .15, .98)
    cuerda(c, d, 67, t + .684, .15, 1)
    cristal(c, d, 76, t + .782, .10, 1.18)
  },
  eclosion: (breve = false): Receta => (c, d, t) => {
    const k = breve ? .32 : 1
    ;[0, .34, .58, .66].forEach((x, i) => {
      ruido(c, panorama(c, d, (i - 1.5) * .12), t + x * k, .085, 4900 - i * 410, .26, .75, 1560)
      madera(c, d, t + x * k, 620 - i * 65, .089, .11)
    })
    ruido(c, d, t + .92 * k, .38 * k, 680, .24, .8, 5700)
    piano(c, d, 48, t + 1.39 * k, .14, 1.65)
    ;[67, 72, 76, 84].forEach((n, i) => cristal(c, panorama(c, d, (i - 1.5) * .17), n, t + (1.42 + .09 * i) * k, .14 - .02 * i, 1.52))
  },
  objeto: (tipo: Objeto): Receta => OBJETOS[tipo],
  personaje: (id: CompaneroId): Receta => VECINOS[id],
}

const OBJETOS: Record<Objeto, Receta> = {
  fuego: (c, d, t) => {
    ruido(c, d, t, .55, 450, .175, .7, 950)
    ;[0, .057, .134, .22, .267, .42].forEach((x, i) => {
      ruido(c, panorama(c, d, i % 2 ? .2 : -.27), t + x, .026 + i % 3 * .012, 2300 + i * 260, .16 - i * .012, .95, 1410)
    })
  },
  metal: (c, d, t) => {
    madera(c, d, t, 610, .15, .095)
    cristal(c, d, 86, t + .009, .18, .46)
    cristal(c, d, 91, t + .086, .089, .36)
  },
  hoja: (c, d, t) => {
    ruido(c, d, t, .233, 1500, .21, .8, 4180)
    ruido(c, panorama(c, d, .27), t + .076, .18, 3750, .16, 1.4, 1620)
    ruido(c, d, t + .16, .105, 2750, .095)
  },
  madera: (c, d, t) => {
    madera(c, d, t, 235, .20)
    madera(c, d, t + .058, 296, .058, .12)
    ruido(c, d, t + .05, .11, 810, .10, 2, 1190)
  },
}

const VECINOS: Record<CompaneroId, Receta> = {
  nox: (c, d, t) => {
    voz(c, d, t, 430, 615, .123, 'calido', .163)
    voz(c, d, t + .144, 541, 391, .154, 'calido', .129)
    ruido(c, d, t + .13, .09, 2200, .096, 1.25, 4300)
  },
  tofu: (c, d, t) => {
    ruido(c, d, t, .19, 1250, .128, .85, 2600)
    voz(c, d, t + .044, 250, 290, .15, 'madera', .17)
    cuerda(c, d, 55, t + .142, .077, .51)
  },
  tuerca: (c, d, t) => {
    madera(c, d, t, 730, .11, .085)
    voz(c, d, t + .044, 425, 428, .091, 'metal', .137)
    voz(c, d, t + .15, 625, 519, .096, 'metal', .112)
    cristal(c, d, 84, t + .192, .06, .32)
  },
  bruma: (c, d, t) => {
    ruido(c, d, t, .48, 560, .16, .72, 1910)
    voz(c, d, t + .11, 343, 409, .23, 'aire', .137)
    cristal(c, panorama(c, d, .23), 76, t + .228, .062, .98)
  },
  madeja: (c, d, t) => {
    cuerda(c, d, 62, t, .138, .45)
    voz(c, d, t + .071, 370, 467, .17, 'madera', .15)
    cuerda(c, d, 69, t + .16, .092, .56)
  },
}
