// Modo de prueba: al «volver a hoy», todo lo apuntado con el reloj adelantado se mueve los mismos días
// hacia atrás, para que la partida siga igual (vecinos nacidos, historias, fotos…) en la fecha real.
import type { Partida } from './partida'
import { lunes, sumarDias } from './fechas'

/** Mueve todas las fechas de la partida `dias` días (negativo: hacia atrás). Admite fracciones (horas):
 *  entonces los instantes se mueven exactos y los días sueltos (YYYY-MM-DD) se redondean. */
export function desplazarPartida(p: Partida, dias: number): Partida {
  if (!dias) return p
  const fecha = (v: string) => new Date(Date.parse(v) + dias * 86_400_000).toISOString()
  const dia = (v: string) => sumarDias(v, Math.round(dias))
  const fechado = <T extends { fecha: string }>(v: T): T => ({ ...v, fecha: fecha(v.fecha) })
  const diasDelRegistro = <T extends string>(v: Partial<Record<T, string>>) =>
    Object.fromEntries(Object.entries(v as Record<string, string>).map(([k, d]) => [k, dia(d)])) as Partial<Record<T, string>>
  return {
    ...p,
    inicio: fecha(p.inicio),
    ...(p.diaMalo && { diaMalo: dia(p.diaMalo) }),
    acciones: p.acciones.map((a) => a.soloEl ? { ...a, soloEl: dia(a.soloEl) } : a),
    ofrendas: p.ofrendas.map(fechado),
    hallazgos: p.hallazgos.map(fechado),
    ...(p.construcciones && { construcciones: p.construcciones.map(fechado) }),
    ...(p.noticias && { noticias: p.noticias.map(fechado) }),
    ...(p.momentos && { momentos: p.momentos.map(fechado) }),
    ...(p.lecturas && { lecturas: p.lecturas.map(fechado) }),
    ...(p.informes && { informes: p.informes.map((x) => lunes(dia(x))) }),
    ...(p.meses && { meses: p.meses.map((m) => ({
      ...m, inicio: fecha(m.inicio),
      ...(m.presentado && { presentado: fecha(m.presentado) }),
      ...(m.cerrado && { cerrado: fecha(m.cerrado) }),
    })) }),
    ...(p.situaciones && { situaciones: Object.fromEntries(Object.entries(p.situaciones).map(([id, s]) =>
      [id, { ...s, dia: dia(s.dia) }])) }),
    ...(p.vistos && { vistos: {
      ...p.vistos,
      ...(p.vistos.album && { album: fecha(p.vistos.album) }),
      ...(p.vistos.albumSec && { albumSec: Object.fromEntries(Object.entries(p.vistos.albumSec).map(([k, f]) => [k, f && fecha(f)])) }),
      ...(p.vistos.hazanas && { hazanas: dia(p.vistos.hazanas) }),
      ...(p.vistos.micros && { micros: diasDelRegistro(p.vistos.micros) }),
      ...(p.vistos.gags && { gags: diasDelRegistro(p.vistos.gags) }),
    } }),
  }
}
