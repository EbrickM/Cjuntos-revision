// ── Pipeline de estados de factura (BPMN Facturación y Pago) ─────────────────
// Visualiza la cadena lineal de estados completados / activos / futuros,
// reemplazando los CTPipeline inline y timeline manuales duplicados en todos
// los portales. Cuando la factura terminó en billetera, el paso final se
// renombra automáticamente a "Saldo en Billetera".
import { pasosFactura } from '../../lib/invoiceStates';

export default function InvoicePipeline({ factura, className = '' }) {
  const pasos = pasosFactura(factura);
  const currentIdx = pasos.findIndex(p => p.id === factura.estado);
  const completed = currentIdx === pasos.length - 1;

  return (
    <div className={`flex items-center gap-0.5 flex-wrap ${className}`}>
      {pasos.map((p, idx) => {
        const done = completed || idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={p.id} className="flex items-center gap-0.5">
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap"
              style={
                done
                  ? { background: '#E3F4EA', color: '#2E7D5B' }
                  : active
                  ? { background: '#EF7A2C', color: '#ffffff', boxShadow: '0 0 0 2px rgba(239,122,44,0.25)' }
                  : { background: '#F6F5F3', color: '#A9A6A1' }
              }
            >
              {p.label}
            </span>
            {idx < pasos.length - 1 && (
              <div
                className="w-3 h-px shrink-0"
                style={{ background: done ? '#A8D5BE' : '#ECEAE7' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}