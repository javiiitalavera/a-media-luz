// Lecturas sueltas (Dirección A, 20/11/2026): frases cortas en las que un vecino comenta tu temporada.
// Solo leen lo que haces (nunca lo que no haces). Cada vecino lee una cosa: Nox cuándo te mueves,
// Tuerca las cuentas (es la única que dice cifras), Tofu tus retos propios, Bruma la calma y los días malos,
// Madeja cruza datos de todos. Textos: propuestas de Claude, pendientes de revisión de Javi.
import type { AreaId } from './tipos'

export type Franja = 'manana' | 'tarde' | 'noche'

export const LECTURAS_SUELTAS = {
  /** La primera vez que registras algo de un área (lo dice su vecino; si aún no ha llegado, Nox). */
  debut: {
    cuerpo: 'Primera vez que te mueves desde que estoy aquí. Lo he apuntado en la pared. Con hollín.',
    mente: 'Primera vez que registras algo de Mente. El brote ha hecho un ruido raro. No preguntes.',
    calma: 'Primera vez que paras un rato. La niebla se ha quedado quieta para mirarte. Qué vergüenza.',
    vinculos: 'Primera vez que apuntas a alguien. Ya sé su nombre. No me lo has dicho. Da igual.',
    orden: 'Primera entrada de Orden. Abro carpeta. La carpeta se llama «Por fin».',
  } as Record<AreaId, string>,
  /** Debut de un área cuyo vecino aún no ha llegado: lo cuenta Nox, a su manera. */
  debutSinVecino: (area: string) => `Has hecho algo de ${area}. Aquí aún no vive nadie de ${area}. Lo he apuntado yo. Mal.`,
  /** Cinco días o más de los últimos siete con algo de un área (lo dice su vecino). */
  constancia: {
    cuerpo: 'Te has movido casi todos los días de esta semana. No he sido yo. Solo quedas tú.',
    mente: 'Casi todos los días has aprendido algo. El brote ha echado una hoja nueva. Por pura presión social.',
    calma: 'Casi todos los días has parado un rato. Ya decía yo que se podía. Lo decía bajito.',
    vinculos: 'Casi todos los días has hablado con alguien. Tengo material para un mes. Gracias.',
    orden: 'Orden casi a diario. El archivo se ha ordenado solo por imitación.',
  } as Record<AreaId, string>,
  /** Las cinco áreas con algo en siete días (Tuerca). */
  equilibrio: 'Informe: las cinco áreas activas esta semana. Esto es anormalmente sano. Lo investigaré.',
  /** Registros acumulados de un área (Tuerca, con cifras). */
  hito: {
    cuerpo: [(n: number) => `Página ${n} de tu archivo de Energía. Huele a hoguera. Nox dice que es «pátina».`,
      (n: number) => `${n} entradas de Energía. He tenido que cambiar de carpeta. La anterior sudaba.`],
    mente: [(n: number) => `${n} páginas de Mente. Tofu me ha pedido una copia. La está leyendo al revés.`,
      (n: number) => `Archivo de Mente: ${n} entradas. Lo había ordenado. Tofu lo ha reordenado por cariño.`],
    calma: [(n: number) => `${n} entradas de Calma. Bruma ha empañado la portada. Archivado como «húmedo».`,
      (n: number) => `Calma: ${n} páginas. Es la carpeta más tranquila del archivo. Sospechoso.`],
    vinculos: [(n: number) => `${n} entradas de Vínculos. Madeja ha pedido acceso. Se lo he denegado. Ya lo ha leído.`,
      (n: number) => `Vínculos: ${n} páginas. Salen más nombres que en el censo del barrio.`],
    orden: [(n: number) => `${n} entradas de Orden. Es mi carpeta favorita. No se lo digas a las otras.`,
      (n: number) => `Orden: ${n} páginas. Las he grapado dos veces. Por si acaso.`],
  } as Record<AreaId, ((n: number) => string)[]>,
  /** A qué hora te mueves, casi siempre (Nox). */
  hora: {
    manana: 'Siempre te mueves por la mañana. Yo también. Bueno, yo me muevo cuando huele a desayuno.',
    tarde: 'Te mueves por la tarde. La hora de las sombras largas. Muy de zorro. Te lo permito.',
    noche: 'Te mueves de noche. Como yo. Los nocturnos tenemos que cuidarnos. Y las salchichas.',
  } as Record<Franja, string>,
  /** Dos áreas el mismo día, varios días (Madeja). */
  dupla: (a: string, b: string) => `Te he visto: ${a} y ${b} el mismo día, y no una vez. Eso en mi pueblo es una pareja.`,
  /** Retos que te has inventado tú (Tofu). */
  propios: (reto: string) => `«${reto}». Lo he leído tres veces. Sigue gustándome. No se lo digas a nadie.`,
  /** El modo día malo (Bruma). */
  diaMalo: 'Hoy en mínimo, y cuenta igual. Ya decía yo que estaba bien así.',
  /** Algo el sábado y el domingo (Madeja). */
  finde: 'Este fin de semana también has hecho cosas. He preguntado por ahí. Nadie te ha visto descansar. Yo tampoco.',
}

/** El informe del domingo de Tuerca (cierra la semana; los materiales siguen llegando al tachar). */
export const INFORME = {
  titulo: 'Cierre de semana',
  cuerpo: (dias: number, retos: number, areas: number, ingresado: string, paginas: number) =>
    `Cierre de semana. Días con algo: ${dias}. Retos: ${retos}. Áreas activas: ${areas} de 5.${ingresado ? ` Ingresado: ${ingresado}.` : ''} Tu archivo va por ${paginas} páginas.`,
  coletilla: (dias: number) => dias >= 6 ? 'Esto es anormalmente sano. Lo investigaré.'
    : dias >= 3 ? 'Archivado. No sé si felicitarte. Te felicito, por si acaso.'
    : 'Semana breve. Las mejores novelas también tienen capítulos cortos.',
}
