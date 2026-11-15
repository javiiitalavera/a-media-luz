// Tipos del contenido del juego.

export type AreaId = 'cuerpo' | 'mente' | 'calma' | 'vinculos' | 'orden'
export type CompaneroId = 'nox' | 'tofu' | 'bruma' | 'madeja' | 'tuerca'
export type Ritmo = 'diario' | 'varias' | 'par' | 'semanal'
export type Momento = 'amanecer' | 'mediodia' | 'atardecer' | 'noche'

export interface Area {
  id: AreaId
  nombre: string
  rincon: string
  companero: CompaneroId
  ritmo: Ritmo
  descripcion: string
}

export interface Companero {
  id: CompaneroId
  nombre: string
  area: AreaId
  /** Etiqueta corta de su humor. */
  humor: string
  /** Una línea para presentarlo al elegir. */
  presentacion: string
}

export interface Accion {
  id: string
  area: AreaId
  nombre: string
  /** Versión mínima para el modo día malo. Cuenta igual. */
  minima: string
}

export interface ObjetoColeccion {
  id: string
  area: AreaId
  nombre: string
  /** Especial: se gana cumpliendo la meta semanal de su compañero, no por sorpresa. */
  especial?: boolean
}
