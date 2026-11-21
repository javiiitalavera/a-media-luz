// Las luminarias decorativas siguen brillando por la noche; el fuego y las luces de trabajo descansan.
import type { ObjetoCasa } from '../contenido/casa'

const APAGADOS_DE_NOCHE = new Set(['hoguera', 'horno', 'parrilla', 'flexo', 'lampara'])

export const objetoApagadoDeNoche = (id: string, noche: boolean): boolean => noche && APAGADOS_DE_NOCHE.has(id)

/** Nunca se dibuja un halo para un objeto apagado, aunque el catálogo marque su punto de luz. */
export const objetoAlumbra = (o: Pick<ObjetoCasa, 'id' | 'luz'>, noche: boolean): boolean =>
  Boolean(o.luz) && !objetoApagadoDeNoche(o.id, noche)
