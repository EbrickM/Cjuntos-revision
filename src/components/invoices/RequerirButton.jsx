// ── Botón de icono de mensaje para enviar requerimiento a una factura ────────
// Se coloca en cada tarjeta/modal de factura (PYME, Contratante, Proveedor).
// Al hacer clic abre el modal para escribir el requerimiento y enviarlo.
import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import RequerimientoEnviarModal from './RequerimientoEnviarModal';

export default function RequerirButton({ factura, emisor = 'Contratante', onEnviar, label, className = '' }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        title="Enviar requerimiento"
        onClick={e => { e.stopPropagation(); setOpen(true); }}
        className={label
          ? `inline-flex items-center gap-1.5 text-[12px] font-semibold text-orange hover:bg-orange/10 rounded-[8px] px-2.5 h-8 transition cursor-pointer shrink-0 ${className}`
          : `p-1.5 rounded-[8px] transition text-text-4 hover:text-orange cursor-pointer shrink-0 ${className}`}
      >
        <MessageSquare className="w-3.5 h-3.5" />
        {label && <span>{label}</span>}
      </button>
      {open && (
        <RequerimientoEnviarModal
          factura={factura}
          emisor={emisor}
          onClose={() => setOpen(false)}
          onSend={(mensaje) => { onEnviar?.(mensaje); setOpen(false); }}
        />
      )}
    </>
  );
}