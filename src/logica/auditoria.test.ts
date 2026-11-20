// Arreglos de la auditoría del 20/11/2026: decisiones que se tapan, remates que se pierden, materiales ya gastados
// y fechas al cambiar la hora de inicio del día.
import { describe, expect, it } from 'vitest'
import { SITUACIONES, type Lugar } from '../contenido/situaciones'
import { OBJETOS_CASA } from '../contenido'
import { avanzar, huellasEn, toqueHeredado } from './situaciones'
import { momentosDeHistorias } from './momentos'
import { materialYaGastado } from './casa'
import { exportarCopia, importarCopia } from './copia'
import { desplazarPartida } from './desplazar'
import { crearPartida, type Partida } from './partida'
import { con, en, nueva } from './test-utils'

const conVecinos = (p: Partida): Partida => ({ ...p, meses: (['nox', 'tuerca', 'tofu', 'bruma', 'madeja'] as const).map((c, i) => ({
  companero: c, inicio: en('2026-01-01', 8 + i).toISOString(), presentado: en('2026-01-01', 9 + i).toISOString() })) })

describe('auditoría', () => {
  it('dos preguntas no esperan a la vez en la misma casa: la segunda aguarda a que contestes la primera', () => {
    // Busca dos historias con una decisión en el mismo sitio.
    const conDecision = SITUACIONES.flatMap((s) => s.fases.map((f, i) => ({ s, i, lugar: f.lugar as Lugar, d: f.decision })).filter((x) => x.d))
    const par = conDecision.flatMap((a) => conDecision.filter((b) => b.s !== a.s && b.lugar === a.lugar && b.i > 0).map((b) => [a, b] as const))[0]
    expect(par).toBeTruthy()
    const [a, b] = par
    const p = { ...conVecinos(nueva()), situaciones: { [a.s.id]: { fase: a.i, dia: '2026-01-02' }, [b.s.id]: { fase: b.i - 1, dia: '2026-01-02' } } }
    const r = avanzar(p, en('2026-01-03', 10)).partida
    expect(r.situaciones![b.s.id].fase).toBe(b.i - 1)
    // Contestada la primera, la segunda ya puede llegar.
    const contestada = { ...p, situaciones: { ...p.situaciones, [a.s.id]: { ...p.situaciones[a.s.id], decision: a.d!.opciones[0].id } } }
    const libres = { ...contestada, situaciones: { [b.s.id]: contestada.situaciones[b.s.id] } }
    expect(avanzar(libres, en('2026-01-03', 10)).partida.situaciones![b.s.id].fase).toBe(b.i)
  })

  it('si el gramófono ya está fuera, el remate pasa al objeto; si está en el baúl, vuelve la huella', () => {
    const p = { ...conVecinos(nueva()), situaciones: { bis: { fase: 3, dia: '2026-01-04', fin: true, decision: 'bis' } } }
    expect(huellasEn(p, 'tofu').map((h) => h.id)).toContain('disco-firmado')
    expect(toqueHeredado(p, 'gramofono')).toBeUndefined()
    const fuera = { ...p, construcciones: [{ objetoId: 'gramofono', fecha: en('2026-01-02').toISOString() }] }
    expect(huellasEn(fuera, 'tofu').map((h) => h.id)).not.toContain('disco-firmado')
    expect(toqueHeredado(fuera, 'gramofono')).toMatch(/firmas/)
    const enElBaul = { ...fuera, guardados: ['gramofono'] }
    expect(huellasEn(enElBaul, 'tofu').map((h) => h.id)).toContain('disco-firmado')
    expect(toqueHeredado(enElBaul, 'gramofono')).toBeUndefined()
  })

  it('la foto de una historia que acaba en silencio lleva su recuerdo', () => {
    const antes = { ...conVecinos(nueva()), situaciones: { bis: { fase: 2, dia: '2026-01-03', decision: 'bis' } } }
    const despues = { ...antes, situaciones: { bis: { fase: 3, dia: '2026-01-04', decision: 'bis', fin: true } } }
    const foto = momentosDeHistorias(antes, despues, en('2026-01-04')).momentos!.find((m) => m.id === 'historia-bis')!
    expect(foto.texto).toMatch(/dedicatoria/)
  })

  it('desmarcar un reto cuyo material ya está construido se avisa (y si sobra material, no)', () => {
    const hoguera = OBJETOS_CASA.find((o) => o.coste.cuerpo === 3 && Object.keys(o.coste).length === 1)!
    // Cada reto da material una vez al día: tres días, tres ascuas, y la hoguera las gasta.
    let p = con(con(con(nueva(), 'cuerpo', '2026-01-07'), 'cuerpo', '2026-01-08'), 'cuerpo', '2026-01-09')
    p = { ...p, construcciones: [{ objetoId: hoguera.id, fecha: en('2026-01-09', 11).toISOString() }] }
    const id = p.ofrendas.at(-1)!.accionId
    expect(materialYaGastado(p, id, en('2026-01-09', 12))).toBe('cuerpo')
    const sobra = con(p, 'cuerpo', '2026-01-06')
    expect(materialYaGastado(sobra, id, en('2026-01-09', 12))).toBeNull()
  })

  it('una copia de un móvil con otra hora de inicio del día pasa sus fechas a la de este', () => {
    const p = con(crearPartida('nox', en('2026-01-05', 9)), 'cuerpo', '2026-01-06', 1, 2)
    const texto = exportarCopia(p, en('2026-01-06'), 0)
    expect(importarCopia(texto, 0)).toEqual(p)
    const aqui = importarCopia(texto, 5)!
    expect(Date.parse(aqui.ofrendas[0].fecha)).toBe(Date.parse(p.ofrendas[0].fecha) - 5 * 3_600_000)
    // Los días sueltos no se mueven por unas horas.
    const conDia = { ...p, diaMalo: '2026-01-06' }
    expect(desplazarPartida(conDia, -5 / 24).diaMalo).toBe('2026-01-06')
  })
})
