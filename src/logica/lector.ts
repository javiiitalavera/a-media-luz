// El lector (Dirección A): cada día, como mucho, una lectura suelta de tu diario en boca de un vecino,
// y el informe semanal de Tuerca. Todo sale del historial.
// Reglas: una lectura al día y tres por semana; una lectura no se repite en 14 días (los hitos, nunca);
// solo habla un vecino que ya está en el barrio; con «Que no lean mi lista» activado, nadie lee nada.
import { AREAS, COMPANEROS, MATERIALES, ORDEN_AREAS, type AreaId, type CompaneroId } from '../contenido'
import { LECTURAS_SUELTAS as L, INFORME, AL_CALLARLOS, type Franja } from '../contenido/lecturas-sueltas'
import type { NoticiaBarrio, Ofrenda, Partida } from './partida'
import { dia, diasEntre, lunes, sumarDias } from './fechas'
import { nacido } from './etapas'
import { ganados } from './casa'
import { NOTICIAS_GUARDADAS } from './situaciones'

export interface Lectura { clave: string; vecino: CompaneroId; texto: string; fecha: string }

const POR_SEMANA = 3
const SIN_REPETIR = 14
const GUARDADAS = 200
const HITOS = [10, 25, 50, 100, 200]

const hasta = (p: Partida, ahora: Date) => p.ofrendas.filter((o) => new Date(o.fecha) <= ahora)
const enVentana = (os: Ofrenda[], ahora: Date, dias = 7) => { const hoy = dia(ahora); return os.filter((o) => { const d = diasEntre(dia(o.fecha), hoy); return d >= 0 && d < dias }) }
const diasDe = (os: Ofrenda[]) => new Set(os.map((o) => dia(o.fecha))).size
const franjaDe = (f: string): Franja => { const h = new Date(f).getHours(); return h < 12 ? 'manana' : h < 20 ? 'tarde' : 'noche' }
/** La franja en la que caen al menos 7 de cada 10 registros (con 8 o más). */
function franjaFija(os: Ofrenda[]): Franja | null {
  if (os.length < 8) return null
  const n = { manana: 0, tarde: 0, noche: 0 }
  for (const o of os) n[franjaDe(o.fecha)]++
  const [f, v] = (Object.entries(n) as [Franja, number][]).sort((a, b) => b[1] - a[1])[0]
  return v / os.length >= 0.7 ? f : null
}
/** La pareja de áreas que más coinciden el mismo día (días en común). */
function dupla(os: Ofrenda[]): { a: AreaId; b: AreaId; dias: number } | null {
  const porDia = new Map<string, Set<AreaId>>()
  for (const o of os) porDia.set(dia(o.fecha), (porDia.get(dia(o.fecha)) ?? new Set()).add(o.area))
  let mejor: { a: AreaId; b: AreaId; dias: number } | null = null
  for (const [i, a] of ORDEN_AREAS.entries()) for (const b of ORDEN_AREAS.slice(i + 1)) {
    const dias = [...porDia.values()].filter((s) => s.has(a) && s.has(b)).length
    if (dias && (!mejor || dias > mejor.dias)) mejor = { a, b, dias }
  }
  return mejor
}

/** Las lecturas posibles hoy, por orden de prioridad (los hitos primero). */
function candidatas(p: Partida, ahora: Date): Omit<Lectura, 'fecha'>[] {
  const todas = hasta(p, ahora)
  const semana = enVentana(todas, ahora)
  const hoy = dia(ahora)
  const r: Omit<Lectura, 'fecha'>[] = []
  for (const area of ORDEN_AREAS) {
    const suyas = todas.filter((o) => o.area === area)
    if (!suyas.length) continue
    const vecino = AREAS[area].companero
    // «Primera vez» solo si de verdad acaba de pasar (en una partida con historia, ya no lo es).
    const reciente = diasEntre(dia(suyas[0].fecha), hoy) <= 2
    if (reciente) r.push(nacido(p, vecino, ahora) ? { clave: `debut|${area}`, vecino, texto: L.debut[area] }
      : { clave: `debut|${area}`, vecino: 'nox', texto: L.debutSinVecino(AREAS[area].nombre) })
    const hito = [...HITOS].reverse().find((h) => suyas.length >= h)
    if (hito) r.push({ clave: `hito|${area}|${hito}`, vecino: 'tuerca', texto: L.hito(hito, AREAS[area].nombre) })
  }
  if (ORDEN_AREAS.every((a) => semana.some((o) => o.area === a))) r.push({ clave: 'equilibrio', vecino: 'tuerca', texto: L.equilibrio })
  for (const area of ORDEN_AREAS) if (diasDe(semana.filter((o) => o.area === area)) >= 5) r.push({ clave: `constancia|${area}`, vecino: AREAS[area].companero, texto: L.constancia[area] })
  const d = dupla(semana)
  if (d && d.dias >= 3) r.push({ clave: `dupla|${d.a}|${d.b}`, vecino: 'madeja', texto: L.dupla(AREAS[d.a].nombre, AREAS[d.b].nombre) })
  const propias = p.acciones.filter((a) => a.id.startsWith('propia-') && todas.some((o) => o.accionId === a.id))
  if (propias.length) r.push({ clave: `propios|${propias[0].id}`, vecino: 'tofu', texto: L.propios(propias.at(-1)!.nombre) })
  const f = franjaFija(todas.filter((o) => o.area === 'cuerpo').slice(-20))
  if (f) r.push({ clave: `hora|${f}`, vecino: 'nox', texto: L.hora[f] })
  if (todas.some((o) => o.diaMalo && dia(o.fecha) === hoy)) r.push({ clave: 'diamalo', vecino: 'bruma', texto: L.diaMalo })
  // Fin de semana: el lunes (o el domingo por la noche) se comenta si hubo algo el sábado y el domingo.
  const domingo = new Date(ahora).getDay() === 0 ? hoy : sumarDias(lunes(hoy), -1)
  if (diasEntre(domingo, hoy) <= 1 && [sumarDias(domingo, -1), domingo].every((x) => todas.some((o) => dia(o.fecha) === x)))
    r.push({ clave: `finde|${domingo}`, vecino: 'madeja', texto: L.finde })
  return r
}

const unaVez = (clave: string) => /^(debut|hito|propios|finde)\|/.test(clave)

/** La lectura de hoy, si toca (null si no). */
export function lecturaDeHoy(p: Partida, ahora: Date): Lectura | null {
  if (p.privado) return null
  const hechas = p.lecturas ?? []
  const hoy = dia(ahora)
  if (hechas.some((l) => dia(l.fecha) === hoy)) return null
  if (hechas.filter((l) => lunes(dia(l.fecha)) === lunes(hoy)).length >= POR_SEMANA) return null
  const libre = (c: Omit<Lectura, 'fecha'>) => {
    if (!nacido(p, c.vecino, ahora)) return false
    const antes = hechas.filter((l) => l.clave === c.clave)
    if (unaVez(c.clave)) return !antes.length && !(c.clave.startsWith('hito|') && hechas.some((l) => l.clave.startsWith(c.clave.split('|').slice(0, 2).join('|') + '|') && Number(l.clave.split('|')[2]) >= Number(c.clave.split('|')[2])))
    return antes.every((l) => diasEntre(dia(l.fecha), hoy) >= SIN_REPETIR)
  }
  const c = candidatas(p, ahora).find(libre)
  return c ? { ...c, fecha: ahora.toISOString() } : null
}

/** El informe de Tuerca de la semana que toca (la anterior; el domingo desde las 19 h, la que acaba). */
export function informeSemanal(p: Partida, ahora: Date): { semana: string; texto: string | null } | null {
  if (!nacido(p, 'tuerca', ahora)) return null
  const hoy = dia(ahora)
  const domingoNoche = ahora.getDay() === 0 && ahora.getHours() >= 19
  const semana = domingoNoche ? lunes(hoy) : sumarDias(lunes(hoy), -7)
  if ((p.informes ?? []).includes(semana) || diasEntre(lunes(dia(p.inicio)), semana) < 0) return null
  const fin = sumarDias(semana, 7)
  const suyas = p.ofrendas.filter((o) => { const d = dia(o.fecha); return diasEntre(semana, d) >= 0 && diasEntre(d, fin) > 0 && new Date(o.fecha) <= ahora })
  // Una semana sin nada no se informa (ni se reprocha): se da por cerrada en silencio.
  if (!suyas.length) return { semana, texto: null }
  const finSemana = new Date(`${fin}T00:00:00`) < ahora ? new Date(`${fin}T00:00:00`) : ahora
  const antes = ganados(p, new Date(`${semana}T00:00:00`)), despues = ganados(p, finSemana)
  const ingresado = ORDEN_AREAS.filter((a) => despues[a] > antes[a]).map((a) => {
    const n = despues[a] - antes[a]
    return `${n} ${n === 1 ? MATERIALES[a].singular : MATERIALES[a].plural}`
  }).join(', ')
  const areas = new Set(suyas.map((o) => o.area)).size
  const texto = `${INFORME.cuerpo(diasDe(suyas), suyas.length, areas, ingresado, hasta(p, ahora).length)} ${INFORME.coletilla(diasDe(suyas))}`
  return { semana, texto }
}

const conNombre = (c: CompaneroId, texto: string) => `${COMPANEROS[c].nombre}: «${texto}»`

/**
 * Lo que el barrio lee hoy de tu diario: el informe de la semana y una lectura suelta.
 * `conHistoriaDeTuDiario`: si hoy ya ha empezado una historia que nace de tu diario, no hay lectura suelta.
 */
export function leerElDiario(p: Partida, ahora: Date, conHistoriaDeTuDiario = false): { partida: Partida; nuevas: NoticiaBarrio[] } {
  let q = p
  const nuevas: NoticiaBarrio[] = []
  const inf = p.privado ? null : informeSemanal(p, ahora)
  if (inf) {
    q = { ...q, informes: [...(q.informes ?? []), inf.semana].slice(-60) }
    if (inf.texto) nuevas.push({ origen: 'diario', texto: conNombre('tuerca', inf.texto), lugar: 'tuerca', fecha: ahora.toISOString() })
  }
  const l = conHistoriaDeTuDiario ? null : lecturaDeHoy(q, ahora)
  if (l) {
    q = { ...q, lecturas: [...(q.lecturas ?? []), l].slice(-GUARDADAS) }
    nuevas.push({ origen: 'diario', texto: conNombre(l.vecino, l.texto), lugar: l.vecino, fecha: ahora.toISOString() })
  }
  if (!nuevas.length) return { partida: q, nuevas }
  return { partida: { ...q, noticias: [...(q.noticias ?? []), ...nuevas].slice(-NOTICIAS_GUARDADAS) }, nuevas }
}

/** «Que no lean mi lista»: al activarlo lo comentan una vez (y se respeta). */
export function ponerPrivado(p: Partida, activo: boolean, ahora: Date): Partida {
  if (Boolean(p.privado) === activo) return p
  if (!activo) return { ...p, privado: false }
  const quien: CompaneroId = nacido(p, 'madeja', ahora) ? 'madeja' : 'nox'
  const noticia: NoticiaBarrio = { origen: 'diario', texto: conNombre(quien, AL_CALLARLOS[quien]!), lugar: quien, fecha: ahora.toISOString() }
  return { ...p, privado: true, noticias: [...(p.noticias ?? []), noticia].slice(-NOTICIAS_GUARDADAS) }
}
