import { describe, expect, it } from 'vitest'
import { fondoDeEclosion, TIEMPOS_ECLOSION } from './fondoDeEclosion'

describe('transición de eclosión', () => {
  it('enseña solo el exterior mientras espera el huevo y mientras se rompe', () => {
    for (const [estado, paso] of [['huevo', null], ['naciendo', null], ['naciendo', 'rompiendo'], ['naciendo', 'niebla']] as const) {
      expect(fondoDeEclosion(estado, paso)).toEqual({
        conHuevo: true, mostrarNido: true, revelandoCasa: false,
        niebla: paso === 'niebla' ? 'cubriendo' : null,
      })
    }
  })

  it('mantiene el exterior durante el fundido hacia la casa y durante la presentación', () => {
    for (const paso of ['salio', 'ficha'] as const) {
      expect(fondoDeEclosion('naciendo', paso)).toEqual({
        conHuevo: false, mostrarNido: true, revelandoCasa: true,
        niebla: paso === 'salio' ? 'revelando' : null,
      })
    }
  })

  it('cubre el paisaje antes de sustituirlo y retira la niebla antes de la ficha', () => {
    expect(TIEMPOS_ECLOSION.niebla).toBeGreaterThan(TIEMPOS_ECLOSION.rompiendo)
    expect(TIEMPOS_ECLOSION.salio - TIEMPOS_ECLOSION.niebla).toBeGreaterThanOrEqual(350)
    expect(TIEMPOS_ECLOSION.ficha - TIEMPOS_ECLOSION.salio).toBeGreaterThan(1450)
  })

  it('si la presentación ya se guardó, entra en la casa sin repetir la transición', () => {
    expect(fondoDeEclosion('vivo', null)).toEqual({
      conHuevo: false, mostrarNido: false, revelandoCasa: false, niebla: null,
    })
    expect(fondoDeEclosion('vivo', 'ficha').revelandoCasa).toBe(false)
  })
})
