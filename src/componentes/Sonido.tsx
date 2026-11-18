// Controla la música y los efectos según las preferencias, la hora del día y la casa.
// No pinta nada.
import { useEffect } from 'react'
import type { Momento } from '../contenido'
import { usePreferencias } from '../estado/preferencias'
import { desbloquear, pausar, ponerEfectos, ponerEstilo, ponerMusica } from '../sonido/motor'

export function Sonido({ momento, apagada }: { momento: Momento; apagada: boolean }) {
  const musica = usePreferencias((s) => s.musica)
  const sonidos = usePreferencias((s) => s.sonidos)

  // El audio del móvil solo puede arrancar tras un toque: lo despertamos en el primero.
  useEffect(() => {
    const despertar = () => desbloquear()
    const opciones = { capture: true, passive: true } as const
    for (const ev of ['pointerdown', 'touchend', 'keydown'] as const) window.addEventListener(ev, despertar, opciones)
    const visibilidad = () => pausar(document.hidden)
    document.addEventListener('visibilitychange', visibilidad)
    return () => {
      for (const ev of ['pointerdown', 'touchend', 'keydown'] as const) window.removeEventListener(ev, despertar, opciones)
      document.removeEventListener('visibilitychange', visibilidad)
    }
  }, [])

  useEffect(() => ponerEfectos(sonidos), [sonidos])
  useEffect(() => ponerMusica(musica), [musica])
  useEffect(() => ponerEstilo(momento, apagada), [momento, apagada])
  return null
}
