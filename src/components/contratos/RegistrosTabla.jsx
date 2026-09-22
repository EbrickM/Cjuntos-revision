import Badge from '../ui/Badge';

// Asunto → variante de Badge. Tres tipos posibles, cada uno con un color
// distinto ya usado en la app: 'contrato' (slate, neutro frío), 'facturas'
// (orange, CTA) e 'indicación' (red, alerta).
const ASUNTO_BADGE = { contrato: 'slate', facturas: 'orange', indicación: 'red' };

const asuntoBadge = (a) => ASUNTO_BADGE[a] ?? 'slate';

// Tabla compartida de la pestaña "Registros" de los detalles de contrato
// (Contratante / PYME / Proveedor): Referente · Fecha · Asunto · Registro,
// con el mismo patrón móvil (cards) + desktop (tabla) que el resto de la app.
export default function RegistrosTabla({ registros = [], titulo = 'Registros', sub = 'Todos los movimientos y actuaciones de las partes sobre este contrato' }) {
  return (
    <div className="card-enter bg-white rounded-[14px] border border-border p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <div className="text-[14px] font-bold text-text-1">{titulo} ({registros.length})</div>
          <div className="text-[11px] text-text-4">{sub}</div>
        </div>
      </div>

      {registros.length === 0 ? (
        <div className="py-10 flex flex-col items-center gap-2" style={{ color: '#A9A6A1' }}>
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M12 7v5l4 2" />
          </svg>
          <p className="text-[13px] font-semibold">Aún no hay registros para este contrato</p>
        </div>
      ) : (
        <>
          {/* Móvil: cards */}
          <div className="sm:hidden space-y-2">
            {registros.map((r, i) => (
              <div key={i} className="rounded-[12px] border border-border p-3.5 flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-text-1 truncate">{r.referente}</p>
                    <p className="text-[10px] font-mono" style={{ color: '#A9A6A1' }}>{r.fecha}</p>
                  </div>
                  <Badge variant={asuntoBadge(r.asunto)} className="capitalize shrink-0">{r.asunto}</Badge>
                </div>
                <p className="text-[12px] text-text-2 leading-relaxed pt-1.5 border-t border-border">{r.registro}</p>
              </div>
            ))}
          </div>

          {/* Desktop: tabla */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-page-bg">
                <tr className="border-b border-border">
                  {['Referente', 'Fecha', 'Asunto', 'Registro'].map(h => (
                    <th key={h} className="text-xs font-semibold text-text-4 uppercase tracking-wide px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {registros.map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-orange-tint/40 transition-colors align-top">
                    <td className="px-4 py-3 text-[12px] font-semibold text-text-1 whitespace-nowrap">{r.referente}</td>
                    <td className="px-4 py-3 text-[12px] font-mono whitespace-nowrap" style={{ color: '#A9A6A1' }}>{r.fecha}</td>
                    <td className="px-4 py-3"><Badge variant={asuntoBadge(r.asunto)} className="capitalize">{r.asunto}</Badge></td>
                    <td className="px-4 py-3 text-[12px] text-text-2 leading-relaxed">{r.registro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}