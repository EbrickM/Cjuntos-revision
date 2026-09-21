// ── Botón de aprobar (icono de check verde, solo icono) ───────────────────────
// Acompaña al RequerirButton en cada tarjeta/modal de factura: verde siempre,
// con un check simple (lucide `Check`), sin texto ni iconos compuestos.
import { Check } from 'lucide-react';

export default function AprobarButton({ onClick, title = 'Aprobar factura', className = '' }) {
  return (
    <button
      type="button"
      title={title}
      onClick={e => { e.stopPropagation(); onClick?.(e); }}
      className={`p-1.5 rounded-[8px] hover:bg-green-bg transition cursor-pointer flex items-center justify-center shrink-0 ${className}`}
      style={{ color: '#2E7D5B' }}
    >
      <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
    </button>
  );
}