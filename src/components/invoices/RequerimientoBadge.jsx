// ── Icono de requerimiento (idéntico al de EmpContratos) ──────────────────────
// Cuando la factura/contrato tiene un requerimiento aparece un MessageSquare
// saltando; al hacer clic abre el MISMO modal que se usa en /contratante/contratos:
// título "Requerimiento · <id>" + caja roja con el mensaje escrito por Bonafide.
// `cta` opcional replica el botón "Reconfigurar Contrato" de EmpContratos.
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { INV } from '../../lib/invoiceStates';

export default function RequerimientoBadge({ factura, variant = 'card', cta }) {
  const [open, setOpen] = useState(false);

  const req = factura?.requerimientos ?? factura?.requerimiento;
  // El icono solo aparece cuando el estado es realmente "Con Requerimientos"
  // (mismo criterio que en los contratos): si la factura ya avanzó
  // (orden_fondeador → pagada/billetera), ya no es un requerimiento activo.
  const esRequerimientoActivo =
    factura?.estado === INV.conRequerimientos || factura?.estado === 'Con Requerimientos';
  if (!req || !esRequerimientoActivo) return null;

  const btnCls = variant === 'inline'
    ? 'inline-flex items-center justify-center shrink-0 w-6 h-6 rounded-full bg-orange-dark text-white shadow-md animate-bounce cursor-pointer'
    : 'absolute -top-2.5 -right-2.5 w-8 h-8 rounded-full bg-orange-dark text-white flex items-center justify-center shadow-lg animate-bounce cursor-pointer z-10';

  return (
    <>
      <button
        onClick={e => { e.stopPropagation(); setOpen(true); }}
        title="Ver requerimiento"
        className={btnCls}
      >
        <MessageSquare className="w-4 h-4" />
      </button>

      {open && createPortal(
        <Modal title={`Requerimiento · ${factura.id}`} onClose={() => setOpen(false)}>
          <div className="space-y-5">
            <div className="flex items-start gap-3 p-4 rounded-[12px] bg-red-bg border border-red/20">
              <MessageSquare className="w-5 h-5 shrink-0 mt-0.5 text-red-text" />
              <div>
                <p className="text-[13px] text-text-1 leading-relaxed">{req.mensaje}</p>
                <p className="text-[11px] mt-2" style={{ color: '#A9A6A1' }}>Reportado el {req.fecha}</p>
              </div>
            </div>
            <Button
              variant="primary"
              full
              className="h-[46px] justify-center"
              onClick={() => { setOpen(false); cta?.onClick?.(); }}
            >
              {cta?.label ?? 'Cerrar'}
            </Button>
          </div>
        </Modal>,
        document.body
      )}
    </>
  );
}