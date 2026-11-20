// Arte en uso (archivos de public/arte/). Cómo se encarga y se integra: docs/arte-encargos.md.
// No se dibujan sustitutos: si un recurso no está, la interfaz deja su hueco neutro.
//
// Estado a 20/11/2026: los cinco vecinos completos.

import type { CompaneroId as Id } from '../contenido/tipos'
import type { ArteHuella } from '../contenido/situaciones'
export type Expresion = 'base' | 'contento' | 'enfurrunado' | 'dormido'

export type ClaveArte =
  | `casa/${Id}/fondo`
  | `casa/${Id}/objeto/${string}`
  | `companero/${Id}/${Expresion}`
  | `companero/${Id}/${'joven' | 'adulto'}/${Expresion}`
  | `objeto/${string}`
  | `huevo/${Id}/${'cerrado' | 'agrietado'}`
  | `casita/${Id}`
  | 'barrio/mapa'
  | 'barrio/puente'
  | `barrio/proyecto/${string}`
  | `huella/${ArteHuella}`

const EXPRESIONES: Expresion[] = ['base', 'contento', 'enfurrunado', 'dormido']
/** Las 3 etapas × 4 expresiones de un compañero, recortadas con la herramienta (mismo encuadre). */
const personaje = (c: Id) => Object.fromEntries(
  (['', 'joven/', 'adulto/'] as const).flatMap((e) => EXPRESIONES.map((x) => [`companero/${c}/${e}${x}`, `/arte/personajes/${c}/${e}${x}.webp`])),
)

const objetos = (c: Id, ids: string[]) => Object.fromEntries(ids.map((i) => [`casa/${c}/objeto/${i}`, `/arte/casa/${c}/objetos/${i}.webp`]))

export const ARTE: Partial<Record<ClaveArte, string>> = {
  'casa/nox/fondo': '/arte/casa/nox/fondo.webp',
  ...objetos('nox', ['hoguera', 'farolillo', 'banco', 'cojin', 'estanteria', 'seta', 'zapatillas', 'bufanda', 'farol-luna', 'horno', 'saco', 'mancuernas', 'comba', 'parrilla', 'colchoneta', 'bici']),
  'huevo/nox/cerrado': '/arte/huevos/nox/cerrado.webp',
  'huevo/nox/agrietado': '/arte/huevos/nox/agrietado.webp',
  'casa/tuerca/fondo': '/arte/casa/tuerca/fondo.webp',
  ...objetos('tuerca', ['caja', 'aspiradora', 'flexo', 'cajonera', 'estanteria-tarros', 'reloj', 'medalla', 'tablon', 'tuerquita', 'archivador', 'maquina', 'corcho', 'balanza', 'lampara', 'cajas']),
  'huevo/tuerca/cerrado': '/arte/huevos/tuerca/cerrado.webp',
  'huevo/tuerca/agrietado': '/arte/huevos/tuerca/agrietado.webp',
  'barrio/mapa': '/arte/barrio/mapa.webp',
  'barrio/puente': '/arte/barrio/puente.webp',
  ...Object.fromEntries(['fuente', 'tablon', 'columpio', 'pergola', 'horno', 'buzon'].map((b) => [`barrio/proyecto/${b}`, `/arte/barrio/proyectos/${b}.webp`])),
  ...Object.fromEntries(['cartel', 'cartel-quemado', 'extintor', 'expediente', 'puente', 'libro-quemado', 'archivador', 'lupa'].map((h) => [`huella/${h}`, `/arte/huellas/${h}.webp`])),
  // Huellas que reutilizan otros dibujos.
  'huella/salchicha': '/arte/curiosidades/salchicha.webp',
  'huella/libros': '/arte/casa/tofu/objetos/libros.webp',
  'casita/nox': '/arte/casitas/nox.webp',
  'casita/tuerca': '/arte/casitas/tuerca.webp',
  'casa/tofu/fondo': '/arte/casa/tofu/fondo.webp',
  ...personaje('tofu'),
  ...objetos('tofu', ['libros', 'pizarra', 'maceta', 'telescopio', 'globo', 'atril', 'caballete', 'ajedrez', 'gramofono']),
  'huevo/tofu/cerrado': '/arte/huevos/tofu/cerrado.webp',
  'huevo/tofu/agrietado': '/arte/huevos/tofu/agrietado.webp',
  'casita/tofu': '/arte/casitas/tofu.webp',
  'casa/bruma/fondo': '/arte/casa/bruma/fondo.webp',
  'casita/bruma': '/arte/casitas/bruma.webp',
  'casa/madeja/fondo': '/arte/casa/madeja/fondo.webp',
  ...personaje('madeja'),
  ...objetos('madeja', ['cesto', 'telefono', 'mecedora', 'album', 'guirnalda', 'buzon']),
  'casita/madeja': '/arte/casitas/madeja.webp',
  'huevo/madeja/cerrado': '/arte/huevos/madeja/cerrado.webp',
  'huevo/madeja/agrietado': '/arte/huevos/madeja/agrietado.webp',
  ...personaje('bruma'),
  ...objetos('bruma', ['tetera', 'campanillas', 'hamaca', 'frasco', 'paraguas', 'barquito', 'tarro', 'columpio', 'cometa', 'loto', 'manta', 'farol-papel']),
  'huevo/bruma/cerrado': '/arte/huevos/bruma/cerrado.webp',
  'huevo/bruma/agrietado': '/arte/huevos/bruma/agrietado.webp',
  // Huellas de las historias de Bruma (sus propios objetos).
  ...Object.fromEntries(['frasco', 'paraguas', 'barquito'].map((h) => [`huella/${h}`, `/arte/casa/bruma/objetos/${h}.webp`])),
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

/** ¿Tiene ya todo lo necesario para vivir su mes? (huevo, casa y casita; sus etapas se completan solas). */
export const tieneMes = (c: Id) =>
  Boolean(ARTE[`huevo/${c}/cerrado`] && ARTE[`casa/${c}/fondo`] && ARTE[`casita/${c}`] && ARTE[`companero/${c}/base`])

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
