// Copia de seguridad: exportar e importar la partida (JSON).
import { AREAS, COMPANEROS, ESCENAS, RITMOS } from '../contenido'
import { PREGUNTAS } from '../contenido/cuestionario'
import { SITUACIONES } from '../contenido/situaciones'
import type { Partida } from './partida'
import { migrarHazanas } from './hazanas'

const objeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const texto = (v: unknown): v is string => typeof v === 'string'
const booleano = (v: unknown): v is boolean => typeof v === 'boolean'
const fecha = (v: unknown) => texto(v) && Number.isFinite(Date.parse(v))
const dia = (v: unknown) => texto(v) && /^\d{4}-\d{2}-\d{2}$/.test(v) && fecha(v)
const etapa = (v: unknown) => v === 0 || v === 1 || v === 2
const clave = (v: unknown, tabla: object) => texto(v) && Object.hasOwn(tabla, v)
const vecino = (v: unknown) => clave(v, COMPANEROS)
const lugar = (v: unknown) => v === 'barrio' || clave(v, ESCENAS)
const lista = (v: unknown, validar: (item: unknown) => boolean) => Array.isArray(v) && v.every(validar)
const opcional = (v: unknown, validar: (valor: unknown) => boolean) => v === undefined || validar(v)

function escena(v: unknown) {
  return objeto(v) && lugar(v.lugar) && etapa(v.etapa) &&
    ['base', 'contento', 'enfurrunado', 'dormido'].some((c) => c === v.cara) &&
    ['amanecer', 'mediodia', 'atardecer', 'noche'].some((m) => m === v.momentoDia) &&
    lista(v.objetos, texto) && lista(v.huellas, texto) && booleano(v.gregorio) &&
    opcional(v.visita, vecino) && opcional(v.vecinos, (l) => lista(l, vecino)) && opcional(v.colocados, posiciones)
}

function situaciones(v: unknown) {
  return objeto(v) && Object.entries(v).every(([id, e]) => {
    const definicion = SITUACIONES.find((s) => s.id === id)
    if (!objeto(e) || typeof e.fase !== 'number' || !Number.isInteger(e.fase) || e.fase < 0) return false
    if (definicion && (e.fase >= definicion.fases.length || Boolean(e.fin) !== (e.fase === definicion.fases.length - 1))) return false
    return dia(e.dia) && opcional(e.fin, booleano) && opcional(e.decision, texto)
  })
}

const numero = (v: unknown) => typeof v === 'number' && Number.isFinite(v)
const posiciones = (v: unknown) => objeto(v) && Object.values(v).every((x) => objeto(x) && numero(x.x) && numero(x.y))

function perfil(v: unknown) {
  return objeto(v) &&
    lista(v.mejorar, (m) => PREGUNTAS.mejorar.opciones.some(([id]) => id === m)) &&
    opcional(v.edad, (e) => PREGUNTAS.edad.opciones.some(([id]) => id === e)) &&
    opcional(v.dia, (d) => PREGUNTAS.dia.opciones.some(([id]) => id === d)) &&
    opcional(v.actividad, (a) => PREGUNTAS.actividad.opciones.some(([id]) => id === a))
}

function vistos(v: unknown) {
  const dias = (d: unknown) => objeto(d) && Object.values(d).every(dia)
  const fechas = (d: unknown) => objeto(d) && Object.values(d).every(fecha)
  return objeto(v) && opcional(v.album, fecha) && opcional(v.albumSec, fechas) && opcional(v.hazanas, dia) &&
    opcional(v.micros, dias) && opcional(v.gags, dias) &&
    opcional(v.huellas, (h) => lista(h, texto)) &&
    opcional(v.pina, (p) => p === 'guardada' || p === 'aqui')
}

export function exportarCopia(p: Partida, ahora: Date): string {
  return JSON.stringify({ app: 'a-media-luz', version: 1, exportado: ahora.toISOString(), partida: p }, null, 2)
}

export function importarCopia(contenido: string): Partida | null {
  try {
    const d: unknown = JSON.parse(contenido)
    if (!objeto(d) || d.app !== 'a-media-luz' || d.version !== 1 || !objeto(d.partida)) return null
    const p = d.partida
    const ritmos = p.ritmos
    const ok =
      clave(p.principal, ESCENAS) && fecha(p.inicio) &&
      lista(p.acciones, (a) => objeto(a) && texto(a.id) && clave(a.area, AREAS) && texto(a.nombre) &&
        opcional(a.minima, texto) && opcional(a.habitual, booleano)) &&
      objeto(ritmos) && Object.keys(AREAS).every((a) => clave(ritmos[a], RITMOS)) &&
      lista(p.ofrendas, (o) => objeto(o) && texto(o.id) && texto(o.accionId) &&
        clave(o.area, AREAS) && fecha(o.fecha) && opcional(o.diaMalo, booleano)) &&
      lista(p.hallazgos, (h) => objeto(h) && texto(h.objetoId) && fecha(h.fecha)) &&
      opcional(p.construcciones, (l) => lista(l, (c) => objeto(c) && texto(c.objetoId) && fecha(c.fecha))) &&
      opcional(p.meses, (l) => Array.isArray(l) && l.length > 0 && l.every((m) =>
        objeto(m) && clave(m.companero, ESCENAS) && fecha(m.inicio) && opcional(m.presentado, fecha) && opcional(m.cerrado, fecha))) &&
      opcional(p.situaciones, situaciones) && opcional(p.perfil, perfil) && opcional(p.vistos, vistos) &&
      opcional(p.etapasVistas, (e) => objeto(e) && Object.values(e).every(etapa)) &&
      opcional(p.diaMalo, dia) &&
      opcional(p.colocados, posiciones) &&
      opcional(p.noticias, (l) => lista(l, (n) => objeto(n) && texto(n.texto) && lugar(n.lugar) && fecha(n.fecha) &&
        opcional(n.leida, booleano) && opcional(n.visitada, booleano))) &&
      opcional(p.momentos, (l) => lista(l, (m) => objeto(m) && texto(m.id) && texto(m.titulo) &&
        texto(m.texto) && fecha(m.fecha) && escena(m.escena)))
    if (!ok) return null
    const partida = p as unknown as Partida
    return migrarHazanas({
      ...partida, version: 1,
      frasesRecientes: Array.isArray(p.frasesRecientes) ? p.frasesRecientes.filter(texto) : [],
      construcciones: partida.construcciones ?? [],
    })
  } catch {
    return null
  }
}
