import { useState } from 'react';
import { Search, Wallet, ListFilter } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';
import InvoiceStatusBadge from '../../components/invoices/InvoiceStatusBadge';
import InvoiceDetailModal from '../../components/invoices/InvoiceDetailModal';
import { facturaService } from '../../services/factura.service';
import { INV, MODALIDAD } from '../../lib/invoiceStates';
import { fmt } from '../empresa-pequena/epData';
import { BANCO, BANCO_CORTO, netoFactura } from './fondeadorShared';

// ── CARTERA (portal Banco Fondeador) ──────────────────────────────────────────
// Historial de las operaciones ya fondeadas por el banco (Fondeo Recibido en
// adelante): en proceso de OTP, pagadas o con saldo en billetera virtual.
const FILTROS = {
  'Todas':      null,
  'En proceso': [INV.fondeado, INV.otpEnviada, INV.otpVerificada],
  'Pagadas':    [INV.pagada],
  'Billetera':  [INV.billetera],
};

export default function FondCartera() {
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('Todas');
  const [detalle, setDetalle] = useState(null);

  const cartera = facturaService.carteraFondeador(BANCO);
  const q = busqueda.trim().toLowerCase();

  const porEstado = FILTROS[filtro] ? cartera.filter(f => FILTROS[filtro].includes(f.estado)) : cartera;
  const filtradas = !q ? porEstado : porEstado.filter(f =>
    [f.id, f.ipi?.numero, f.pyme, f.contratante, f.transferencia?.referencia].some(v => (v ?? '').toLowerCase().includes(q))
  );

  const totalFondeado = filtradas.reduce((a, f) => a + netoFactura(f), 0);

  return (
    <AppShell
      active="fondCartera"
      role="fondeador"
      title="Cartera"
      sub={`Operaciones fondeadas por ${BANCO}`}
    >
      <div className="fade-in space-y-5">

        <div className="bg-white rounded-[14px] border border-border p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="bona-gradient-bg w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-[14px] font-bold text-text-1">Historial de fondeo</div>
                <div className="text-[11px] text-text-4">Seguimiento de las operaciones liquidadas y su estado de pago.</div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-orange-dark whitespace-nowrap">{filtradas.length} operaciones</span>
          </div>

          {/* Buscador + filtro */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-4">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4" />
              <input
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar por Nº, IPI, Emp. Contratada, contratante o referencia…"
                className="w-full pl-8 pr-3 py-2 text-[12px] rounded-[8px] border border-border bg-white placeholder-text-4 focus:outline-none focus:border-orange"
              />
            </div>
            <div className="relative flex items-center shrink-0">
              <ListFilter className="absolute left-2.5 w-3.5 h-3.5 pointer-events-none shrink-0 text-orange" />
              <select
                value={filtro}
                onChange={e => setFiltro(e.target.value)}
                className="h-9 pl-8 pr-7 text-[12px] font-medium rounded-[8px] border-2 border-orange bg-white text-text-1 focus:outline-none transition cursor-pointer appearance-none w-full sm:w-auto"
              >
                {Object.keys(FILTROS).map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-page-bg">
                <tr className="border-b border-border">
                  {['Operación', 'Emp. Contratada', 'Contratante', 'Modalidad', 'Estado', 'Monto fondeado', 'Referencia', 'Fecha'].map((h, i) => (
                    <th key={h} className={`text-xs font-semibold text-text-4 uppercase tracking-wide px-4 py-3
                      ${i === 0 ? 'text-left' : i === 5 ? 'text-right' : 'text-center'}
                    `}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtradas.map(f => {
                  const billetera = f.modalidadPago === MODALIDAD.billeteraVirtual;
                  return (
                    <tr key={f.id} onClick={() => setDetalle(f)}
                      className="border-b border-border last:border-0 transition-colors hover:bg-orange-tint/40 cursor-pointer">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-[12px] font-bold text-text-1">{f.id}</div>
                        <div className="text-[10px] font-mono text-text-4">{f.ipi?.numero ?? '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-[12px] font-semibold text-text-1 whitespace-nowrap">{f.pyme}</td>
                      <td className="px-4 py-3 text-[12px] text-text-4 max-w-[200px]">
                        <span className="block truncate">{f.contratante}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={billetera ? 'blue' : 'orange'}>{billetera ? 'Billetera Virtual' : 'Retiro Total'}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center"><InvoiceStatusBadge estado={f.estado} /></td>
                      <td className="px-4 py-3 text-right text-[12px] font-extrabold text-text-1 whitespace-nowrap">{fmt(netoFactura(f))} XAF</td>
                      <td className="px-4 py-3 text-center text-[11px] font-mono text-text-5 whitespace-nowrap">{f.transferencia?.referencia || '—'}</td>
                      <td className="px-4 py-3 text-center text-[11px] text-text-5 whitespace-nowrap">{f.fecha ?? '—'}</td>
                    </tr>
                  );
                })}
                {filtradas.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-[12px] text-text-4">
                      {cartera.length === 0 ? `Aún no hay operaciones fondeadas por ${BANCO_CORTO}.` : 'No se encontraron operaciones con los filtros aplicados.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filtradas.length > 0 && (
            <div className="flex justify-end mt-4 text-[12px] text-text-4">
              Capital fondeado:&nbsp;<span className="font-extrabold text-text-1">{fmt(totalFondeado)} XAF</span>
            </div>
          )}
        </div>

      </div>

      {detalle && (
        <InvoiceDetailModal
          factura={facturaService.obtener(detalle.id) ?? detalle}
          onClose={() => setDetalle(null)}
        />
      )}
    </AppShell>
  );
}
