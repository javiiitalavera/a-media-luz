// Catálogo de la colección (nombres; el arte lo entrega ChatGPT). Propuesta de Claude.
import type { ObjetoColeccion } from './tipos'

export const COLECCION: ObjetoColeccion[] = [
  // Cuerpo · Claro del fuego
  { id: 'pina-chamuscada', area: 'cuerpo', nombre: 'Piña chamuscada' },
  { id: 'zapatilla-huerfana', area: 'cuerpo', nombre: 'Zapatilla huérfana' },
  { id: 'cerilla-eterna', area: 'cuerpo', nombre: 'Cerilla que no se apaga' },
  { id: 'piedra-caliente', area: 'cuerpo', nombre: 'Piedra siempre caliente' },
  { id: 'farol-de-nox', area: 'cuerpo', nombre: 'Farol de Nox', especial: true },
  { id: 'mapa-de-paseos', area: 'cuerpo', nombre: 'Mapa de tus paseos', especial: true },
  // Mente · Huerto de musgo
  { id: 'libro-con-musgo', area: 'mente', nombre: 'Libro con musgo' },
  { id: 'seta-pensativa', area: 'mente', nombre: 'Seta pensativa' },
  { id: 'lupa-rayada', area: 'mente', nombre: 'Lupa rayada' },
  { id: 'nota-indescifrable', area: 'mente', nombre: 'Nota indescifrable' },
  { id: 'brote-de-tofu', area: 'mente', nombre: 'Esqueje del brote de Tofu', especial: true },
  { id: 'pizarra-del-huerto', area: 'mente', nombre: 'Pizarra del huerto', especial: true },
  // Calma · Estanque de niebla
  { id: 'frasco-de-niebla', area: 'calma', nombre: 'Frasco de niebla' },
  { id: 'piedra-plana', area: 'calma', nombre: 'Piedra para hacer saltar' },
  { id: 'pluma-de-garza', area: 'calma', nombre: 'Pluma de garza' },
  { id: 'nenufar-dormido', area: 'calma', nombre: 'Nenúfar dormido' },
  { id: 'manta-de-bruma', area: 'calma', nombre: 'Manta de Bruma', especial: true },
  { id: 'farol-de-agua', area: 'calma', nombre: 'Farolillo flotante', especial: true },
  // Vínculos · Porche de las visitas
  { id: 'taza-desparejada', area: 'vinculos', nombre: 'Taza desparejada' },
  { id: 'carta-sin-sello', area: 'vinculos', nombre: 'Carta sin sello' },
  { id: 'foto-borrosa', area: 'vinculos', nombre: 'Foto borrosa' },
  { id: 'ovillo-perdido', area: 'vinculos', nombre: 'Ovillo perdido' },
  { id: 'bufanda-a-medias', area: 'vinculos', nombre: 'Bufanda a medias', especial: true },
  { id: 'tetera-de-madeja', area: 'vinculos', nombre: 'Tetera de Madeja', especial: true },
  // Orden · Taller
  { id: 'tornillo-sobrante', area: 'orden', nombre: 'Tornillo sobrante' },
  { id: 'etiqueta-varios', area: 'orden', nombre: 'Etiqueta «VARIOS»' },
  { id: 'llave-misteriosa', area: 'orden', nombre: 'Llave de nada' },
  { id: 'caja-vacia', area: 'orden', nombre: 'Caja vacía (clasificada)' },
  { id: 'etiquetadora', area: 'orden', nombre: 'Etiquetadora de Tuerca', especial: true },
  { id: 'engranaje-dorado', area: 'orden', nombre: 'Engranaje dorado', especial: true },
]
