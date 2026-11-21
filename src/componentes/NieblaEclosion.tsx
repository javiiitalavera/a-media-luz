/** Cortina breve de niebla en la eclosión. No es una pantalla nueva ni necesita arte externo.
 *  Se monta antes del cambio de fondo y permanece hasta que el interior ha aparecido. */
export function NieblaEclosion({ fase }: { fase: 'cubriendo' | 'revelando' }) {
  return (
    <div className="niebla-eclosion" data-fase={fase} aria-hidden="true">
      <span className="niebla-eclosion__voluta niebla-eclosion__voluta--izq" />
      <span className="niebla-eclosion__voluta niebla-eclosion__voluta--centro" />
      <span className="niebla-eclosion__voluta niebla-eclosion__voluta--der" />
    </div>
  )
}
