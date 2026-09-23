// ── Barra de progreso de pago parcial (bloque compacto de ancho completo) ─────
// Mismo diseño que la barra de distribución de los contratos del Contratante
// (degradado #E0201C → #EF7A2C sobre #ECEAE7), en versión compacta de una sola
// línea + barra para no sumar alto a las cards. Se muestra únicamente cuando la
// factura está pagada parcialmente (acumulado > 0 y aún no al 100%).
const fmtXaf = (v) => new Intl.NumberFormat('de-DE').format(Number(v) || 0);

export default function PagoProgressBar({ factura, className = '' }) {
  const total  = Number(factura?.monto) || 0;
  const pagado = Number(factura?.pagosAcumulados) || 0;
  if (!(pagado > 0 && pagado < total)) return null;
  const pct      = Math.min(100, Math.round((pagado / total) * 100));
  const faltante = Math.max(total - pagado, 0);
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-0.5">
        <span className="text-[10px] text-text-4 truncate">Pagado · Falta {fmtXaf(faltante)} XAF</span>
        <span className="text-[11px] font-bold shrink-0" style={{ color: '#EF7A2C' }}>{pct}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#ECEAE7' }}>
        <div className="h-full rounded-full"
             style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #E0201C, #EF7A2C)' }} />
      </div>
    </div>
  );
}