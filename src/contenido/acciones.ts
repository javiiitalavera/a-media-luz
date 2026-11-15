// Acciones de ejemplo por área (el jugador puede crear las suyas). Propuesta de Claude.
import type { Accion } from './tipos'

export const ACCIONES: Accion[] = [
  { id: 'andar', area: 'cuerpo', nombre: 'Salir a andar', minima: 'Cinco minutos fuera' },
  { id: 'dormir', area: 'cuerpo', nombre: 'Dormir siete horas', minima: 'Acostarme sin pantalla' },
  { id: 'comer', area: 'cuerpo', nombre: 'Comer de verdad', minima: 'Comer sentado, sin prisa' },
  { id: 'agua', area: 'cuerpo', nombre: 'Beber agua', minima: 'Un vaso al levantarme' },
  { id: 'ejercicio', area: 'cuerpo', nombre: 'Hacer ejercicio', minima: 'Estirar cinco minutos' },
  { id: 'leer', area: 'mente', nombre: 'Leer un rato', minima: 'Leer una página' },
  { id: 'aprender', area: 'mente', nombre: 'Aprender algo', minima: 'Un vídeo o artículo que me enseñe algo' },
  { id: 'concentrarme', area: 'mente', nombre: 'Una hora concentrado', minima: 'Quince minutos sin interrupciones' },
  { id: 'crear', area: 'mente', nombre: 'Crear algo', minima: 'Diez minutos creando' },
  { id: 'sinmovil', area: 'calma', nombre: 'Una hora sin móvil', minima: 'Quince minutos sin móvil' },
  { id: 'naturaleza', area: 'calma', nombre: 'Salir a la naturaleza', minima: 'Mirar el cielo cinco minutos' },
  { id: 'respirar', area: 'calma', nombre: 'Respirar con calma', minima: 'Tres respiraciones lentas' },
  { id: 'nadahacer', area: 'calma', nombre: 'No hacer nada a propósito', minima: 'Cinco minutos en el sofá sin pantalla' },
  { id: 'llamar', area: 'vinculos', nombre: 'Llamar a alguien', minima: 'Un audio a alguien que quiero' },
  { id: 'quedar', area: 'vinculos', nombre: 'Quedar con alguien', minima: 'Proponer un plan' },
  { id: 'pareja', area: 'vinculos', nombre: 'Tiempo con mi pareja', minima: 'Quince minutos de charla sin móvil' },
  { id: 'mensaje', area: 'vinculos', nombre: 'Escribir a alguien olvidado', minima: 'Un mensaje corto' },
  { id: 'pendiente', area: 'orden', nombre: 'Cerrar un pendiente', minima: 'Cerrar uno pequeño' },
  { id: 'papeleo', area: 'orden', nombre: 'Hacer papeleo', minima: 'Abrir el sobre que llevo días evitando' },
  { id: 'ordenar', area: 'orden', nombre: 'Ordenar algo', minima: 'Ordenar una balda' },
  { id: 'cuentas', area: 'orden', nombre: 'Revisar las cuentas', minima: 'Mirar el saldo sin miedo' },
  { id: 'planificar', area: 'orden', nombre: 'Planificar la semana', minima: 'Apuntar tres cosas para mañana' },
]
