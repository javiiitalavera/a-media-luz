// Arte en uso (archivos de public/arte/). Cómo se encarga y se integra: docs/arte-encargos.md.
// No se dibujan sustitutos: si un recurso no está, la interfaz deja su hueco neutro.
//
// Estado a 15/11/2026: casa de Nox (fondo y 6 objetos); Nox y Tuerca: cachorro, joven y adulto con 4 expresiones cada uno; huevo de Nox.

import type { CompaneroId as Id } from '../contenido/tipos'
export type Expresion = 'base' | 'contento' | 'enfurrunado' | 'dormido'

export type ClaveArte =
  | `casa/${Id}/fondo`
  | `casa/${Id}/objeto/${string}`
  | `companero/${Id}/${Expresion}`
  | `companero/${Id}/${'joven' | 'adulto'}/${Expresion}`
  | `objeto/${string}`
  | `huevo/${Id}/${'cerrado' | 'agrietado'}`

const EXPRESIONES: Expresion[] = ['base', 'contento', 'enfurrunado', 'dormido']
/** Las 3 etapas × 4 expresiones de un compañero, recortadas con la herramienta (mismo encuadre). */
const personaje = (c: Id) => Object.fromEntries(
  (['', 'joven/', 'adulto/'] as const).flatMap((e) => EXPRESIONES.map((x) => [`companero/${c}/${e}${x}`, `/arte/personajes/${c}/${e}${x}.webp`])),
)

const objetos = (c: Id, ids: string[]) => Object.fromEntries(ids.map((i) => [`casa/${c}/objeto/${i}`, `/arte/casa/${c}/objetos/${i}.webp`]))

export const ARTE: Partial<Record<ClaveArte, string>> = {
  'casa/nox/fondo': '/arte/casa/nox/fondo.webp',
  ...objetos('nox', ['hoguera', 'farolillo', 'banco', 'cojin', 'estanteria', 'seta']),
  'huevo/nox/cerrado': '/arte/huevos/nox/cerrado.webp',
  'huevo/nox/agrietado': '/arte/huevos/nox/agrietado.webp',
  ...personaje('tuerca'),
  'companero/nox/base': '/arte/personajes/nox/base.webp',
  'companero/nox/contento': '/arte/personajes/nox/contento.webp',
  'companero/nox/enfurrunado': '/arte/personajes/nox/enfurrunado.webp',
  'companero/nox/dormido': '/arte/personajes/nox/dormido.webp',
  'companero/nox/joven/base': '/arte/personajes/nox/joven/base.webp',
  'companero/nox/joven/contento': '/arte/personajes/nox/joven/contento.webp',
  'companero/nox/joven/enfurrunado': '/arte/personajes/nox/joven/enfurrunado.webp',
  'companero/nox/joven/dormido': '/arte/personajes/nox/joven/dormido.webp',
  'companero/nox/adulto/base': '/arte/personajes/nox/adulto/base.webp',
  'companero/nox/adulto/contento': '/arte/personajes/nox/adulto/contento.webp',
  'companero/nox/adulto/enfurrunado': '/arte/personajes/nox/adulto/enfurrunado.webp',
  'companero/nox/adulto/dormido': '/arte/personajes/nox/adulto/dormido.webp',
}

export const rutaArte = (clave: ClaveArte): string | undefined => ARTE[clave]

const NOMBRE_ETAPA = ['', 'joven/', 'adulto/'] as const
/**
 * Imagen de un compañero en una etapa y expresión. Si falta, prueba su expresión base de esa etapa
 * y, si tampoco está, la etapa anterior (nunca se queda sin imagen si existe la del cachorro).
 */
export function rutaCompanero(c: Id, etapa: 0 | 1 | 2, expresion: Expresion): string | undefined {
  for (let e = etapa; e >= 0; e--) {
    const base = `companero/${c}/${NOMBRE_ETAPA[e]}` as const
    const r = ARTE[`${base}${expresion}` as ClaveArte] ?? ARTE[`${base}base` as ClaveArte]
    if (r) return r
  }
  return undefined
}
