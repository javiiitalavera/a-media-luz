// Lecturas sueltas (Dirección A, 20/11/2026): frases cortas en las que un vecino comenta tu temporada.
// Solo leen lo que haces (nunca lo que no haces). Cada vecino lee una cosa: Nox cuándo te mueves,
// Tuerca las cuentas (es la única que dice cifras), Tofu tus retos propios, Bruma la calma y los días malos,
// Madeja cruza datos de todos. Textos: propuestas de Claude, pendientes de revisión de Javi.
import type { AreaId, CompaneroId } from './tipos'

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
  hito: (n: number, area: string) => `Página ${n} de tu archivo de ${area}. La he encuadernado. No me lo agradezcas. Bueno, sí.`,
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

/** «Lo que sabe de ti», en la ficha de cada vecino. */
export const LO_QUE_SABE = {
  nada: 'Aún no sabe casi nada de ti. Lo está deseando.',
  privado: 'Le has pedido que no lea tu lista. Lo respeta. Con los dientes apretados.',
  nox: {
    franja: (f: Franja) => ({ manana: 'Te mueves sobre todo por la mañana.', tarde: 'Te mueves sobre todo por la tarde.', noche: 'Te mueves sobre todo de noche. Como él.' })[f],
    semana: (n: number) => n === 1 ? 'Esta semana te has movido un día. Dice que lo ha visto todo.' : `Esta semana te has movido ${n} días. Dice que los ha contado de dos en dos.`,
    favorito: (reto: string) => `Lo que más repites: «${reto}».`,
  },
  tuerca: {
    paginas: (n: number) => `Tu archivo tiene ${n} ${n === 1 ? 'página' : 'páginas'}.`,
    areas: (n: number) => `Áreas con algo esta semana: ${n} de 5.`,
    mes: (n: number) => `Días con algo en los últimos 30: ${n}.`,
  },
  tofu: {
    propios: (n: number) => n === 1 ? 'Te has inventado un reto. Lo guarda como un manuscrito.' : `Te has inventado ${n} retos. Los guarda como manuscritos.`,
    favorito: (reto: string) => `Lo que más aprendes: «${reto}».`,
    ultimo: (reto: string) => `Lo último que ha anotado de ti: «${reto}».`,
  },
  bruma: {
    semana: (n: number) => n === 1 ? 'Esta semana has parado un rato un día. Dice que se nota.' : `Esta semana has parado un rato ${n} días. Dice que se nota.`,
    diaMalo: (n: number) => n === 1 ? 'Has usado el modo día malo una vez. Contó igual.' : `Has usado el modo día malo ${n} veces. Contaron igual.`,
    favorito: (reto: string) => `Lo que más te calma: «${reto}».`,
  },
  madeja: {
    dupla: (a: string, b: string) => `Lo que más juntas: ${a} y ${b}.`,
    finde: (fin: number, total: number) => `De tus días con algo, ${fin} de cada ${total} caen en fin de semana. Lo sabe todo el barrio.`,
    favorito: (reto: string) => `A quien más te dedicas: «${reto}».`,
  },
}

/** Madeja, una vez, cuando pides que no lean tu lista. */
export const AL_CALLARLOS: Partial<Record<CompaneroId, string>> = {
  madeja: 'Sin datos no hay cotilleo. Qué barrio tan aburrido. Lo respetamos. Con los dientes apretados.',
  nox: 'Vale, no leemos tu lista. Yo tampoco sabía leer. Bueno, sí. Pero no la leemos.',
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
