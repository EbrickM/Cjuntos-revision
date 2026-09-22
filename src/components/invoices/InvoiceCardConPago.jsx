// ── Card de factura pagada parcialmente ───────────────────────────────────────
// Variante de InvoiceCard para las ÚNICAS facturas que llevan barra de
// progreso de pago (acumulado > 0 y aún no al 100%). Mantiene la misma
// estructura (encabezado, entidad/concepto, monto, "Ver detalle") con la barra
// como bloque de ancho completo —mismo diseño que la de los contratos del
// Contratante— pero con un espaciado más compacto (p-4 / gap-2) para que la
// card final mida exactamente lo mismo que las que no llevan barra.
import { ChevronRight } from 'lucide-react';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import PagoProgressBar from './PagoProgressBar';

const fmtXaf = (v) => new Intl.NumberFormat('de-DE').format(Number(v) || 0);

export default function InvoiceCardConPago({
  factura, onClick, entidad, concepto, badge, extra, className = '', style,
}) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={`bg-white rounded-[16px] p-4 cursor-pointer flex flex-col gap-2 transition-all duration-200 hover:scale-[1.015] shadow-[0_3px_10px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_32px_rgba(224,32,28,0.18),0_4px_14px_rgba(239,122,44,0.12)] card-enter ${className}`}
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

      {/* Barra de progreso de pago parcial — bloque de ancho completo en su
          versión compacta (una sola línea + barra) para no sumar alto.
          El resto de la card usa p-4/gap-2 (vs p-5/gap-4) que compensa esa
          altura y deja la card con exactamente el mismo tamaño que las demás. */}
      <PagoProgressBar factura={factura} />

      <div className="mt-auto pt-1 flex items-center justify-end">
        <span className="text-[11px] font-semibold flex items-center gap-0.5 text-orange">
          Ver detalle <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}