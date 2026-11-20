// Cuestionario para sugerir retos (decidido por Javi, 19/11/2026): edad, qué quieres mejorar, cómo es
// tu día y cuánto te mueves. Se puede saltar y cambiar luego. Los datos se quedan en el móvil.
// Las reglas de sugerencia están en src/logica/sugerencias.ts (para revisar con criterio médico).

export type Edad = 'menor' | '18-29' | '30-49' | '50-64' | '65+'
export type Mejora = 'moverme' | 'dormir' | 'aprender' | 'calma' | 'gente' | 'orden'
export type Dia = 'sentado' | 'pie' | 'estudio' | 'jubilado' | 'cuido'
export type Actividad = 'poco' | 'algo' | 'bastante'

export interface Perfil {
  edad?: Edad
  /** De 1 a 3. */
  mejorar: Mejora[]
  dia?: Dia
  actividad?: Actividad
}

export const PREGUNTAS = {
  edad: { titulo: '¿Cuántos años tienes?', opciones: [['menor', 'Menos de 18'], ['18-29', '18–29'], ['30-49', '30–49'], ['50-64', '50–64'], ['65+', '65 o más']] as [Edad, string][] },
  mejorar: { titulo: '¿Qué te gustaría mejorar?', ayuda: 'Hasta tres.', opciones: [['moverme', 'Moverme más'], ['dormir', 'Dormir mejor'], ['aprender', 'Leer y aprender'], ['calma', 'Menos estrés'], ['gente', 'Ver más a mi gente'], ['orden', 'Orden y cuentas']] as [Mejora, string][] },
  dia: { titulo: '¿Cómo es tu día?', opciones: [['sentado', 'Trabajo sentado'], ['pie', 'Me muevo trabajando'], ['estudio', 'Estudio'], ['jubilado', 'Estoy jubilado'], ['cuido', 'Cuido de alguien']] as [Dia, string][] },
  actividad: { titulo: '¿Cuánto te mueves ahora?', opciones: [['poco', 'Poco'], ['algo', 'Algo'], ['bastante', 'Bastante']] as [Actividad, string][] },
} as const

export const TEXTOS_CUESTIONARIO = {
  titulo: 'Antes de nada, cuatro preguntas',
  explicacion: 'Para sugerirte retos a tu medida. Se quedan en tu móvil y las cambias cuando quieras.',
  saltar: 'Saltar',
  seguir: 'Ver mis retos',
  sugeridosTitulo: 'Tus retos para empezar',
  sugeridosExplicacion: 'Sugeridos por lo que has contado. Quita o añade los que quieras: las metas son orientativas.',
  menor: 'Como eres menor de edad, elige tus retos con tu madre, tu padre o un adulto de confianza. Os llevará cinco minutos y saldrán mejor.',
  hojaTitulo: 'Retos sugeridos para ti',
  hojaExplicacion: '¿Han cambiado las cosas, o te equivocaste? Cambia tus respuestas y mira qué te sugerimos ahora.',
  yaLoTienes: 'Ya lo tienes',
  anadir: 'Añadir',
  cambiarMeta: 'Cambiar meta',
  sinLista: 'Sin lista también vale: lo que hagas lo apuntas en Retos, con «Algo más».',
  ahora: (nombre: string) => `Ahora: «${nombre}»`,
  boton: 'Sugerencias',
  ajustes: 'Tus respuestas del cuestionario',
  ajustesExplicacion: 'Cámbialas para ver otros retos sugeridos.',
  ajustesBoton: 'Revisar y ver sugerencias',
}
