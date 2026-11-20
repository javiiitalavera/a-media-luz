import type { EscenaMicro } from '../contenido/situaciones'
import { rutaArte } from '../arte/manifiesto'

/** Atrezzo de la escena del día. En el Álbum queda quieto en el momento del remate. */
export function EscenaBreve({ visual, quieta = false }: { visual: EscenaMicro; quieta?: boolean }) {
  if (visual === 'sombras') {
    return (
      <div aria-hidden data-escena-breve={visual} className="sombras-breves" data-quietud={quieta || undefined}>
        <i /><i /><i />
        <span />
      </div>
    )
  }

  return (
    <div aria-hidden data-escena-breve={visual} className="manual-breve" data-quietud={quieta || undefined}>
      <img className="manual-breve-papeles" src={rutaArte('huella/expediente')} alt="" draggable={false} />
      <img className="manual-breve-caja" src={rutaArte('casa/tuerca/objeto/cajas')} alt="" draggable={false} />
    </div>
  )
}
