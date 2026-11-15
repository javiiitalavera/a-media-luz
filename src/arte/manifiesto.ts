// Arte en uso (archivos de public/arte/). Cómo se encarga y se integra: docs/arte-encargos.md.
// No se dibujan sustitutos: si un recurso no está, la interfaz deja su hueco neutro.
//
// Estado a 15/11/2026: casa de Nox (fondo y 6 objetos) y Nox con 4 expresiones.

import type { CompaneroId as Id } from '../contenido/tipos'
export type Expresion = 'base' | 'contento' | 'enfurrunado' | 'dormido'

export type ClaveArte =
  | `casa/${Id}/fondo`
  | `casa/${Id}/objeto/${string}`
  | `companero/${Id}/${Expresion}`
  | `objeto/${string}`

const objetos = (c: Id, ids: string[]) => Object.fromEntries(ids.map((i) => [`casa/${c}/objeto/${i}`, `/arte/casa/${c}/objetos/${i}.webp`]))

export const ARTE: Partial<Record<ClaveArte, string>> = {
  'casa/nox/fondo': '/arte/casa/nox/fondo.webp',
  ...objetos('nox', ['hoguera', 'farolillo', 'banco', 'cojin', 'estanteria', 'seta']),
  'companero/nox/base': '/arte/personajes/nox/base.webp',
  'companero/nox/contento': '/arte/personajes/nox/contento.webp',
  'companero/nox/enfurrunado': '/arte/personajes/nox/enfurrunado.webp',
  'companero/nox/dormido': '/arte/personajes/nox/dormido.webp',
}

export const rutaArte = (clave: ClaveArte): string | undefined => ARTE[clave]
