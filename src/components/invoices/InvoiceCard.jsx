// ── Card de factura (unificado) ──────────────────────────────────────────────
// Mismo diseño que las cards de "Mis Facturas" del sidebar (PYME, Contratante
// y Proveedor), reutilizado en el apartado de facturas del detalle de contrato.
import { ChevronRight } from 'lucide-react';
import InvoiceStatusBadge from './InvoiceStatusBadge';

const fmtXaf = (v) => new Intl.NumberFormat('de-DE').format(Number(v) || 0);

export default function InvoiceCard({
  factura,
  onClick,
  entidad,
  concepto,
  badge,
  extra,
  className = '',
  style,
}) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={`bg-white rounded-[16px] p-5 cursor-pointer flex flex-col gap-4 transition-all duration-200 hover:scale-[1.015] shadow-[0_3px_10px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_32px_rgba(224,32,28,0.18),0_4px_14px_rgba(239,122,44,0.12)] card-enter ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[13px] font-mono font-bold text-text-1 truncate">{factura.id}</p>
          <p className="text-[11px] mt-0.5" style={{ color: '#A9A6A1' }}>{factura.fecha}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {badge ?? <InvoiceStatusBadge estado={factura.estado} />}
          {extra}
        </div>
      </div>

      {(entidad || concepto) && (
        <div className="min-w-0">
          {entidad && <p className="text-[12px] font-semibold text-text-1 leading-snug truncate">{entidad}</p>}
          {concepto && <p className="text-[11px] leading-snug line-clamp-2 mt-0.5" style={{ color: '#A9A6A1' }}>{concepto}</p>}
        </div>
      )}

      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wide text-text-4 mb-0.5">Monto</div>
        <div className="text-[17px] font-extrabold text-text-1 leading-tight">{fmtXaf(factura.monto)} XAF</div>
      </div>

      <div className="mt-auto pt-1 flex items-center justify-end">
        <span className="text-[11px] font-semibold flex items-center gap-0.5 text-orange">
          Ver detalle <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}
