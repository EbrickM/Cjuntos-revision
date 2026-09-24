import { useState } from 'react';
import { Search, Eye, Receipt, ListFilter } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import InvoiceStatusBadge from '../../components/invoices/InvoiceStatusBadge';
import InvoiceDetailModal from '../../components/invoices/InvoiceDetailModal';
import FiltroClienteSelect from './FiltroClienteSelect';
import { facturaService } from '../../services/factura.service';
import { INV } from '../../lib/invoiceStates';
import { fmt } from '../empresa-pequena/epData';
import { BANCO, porFechaDesc } from './fondeadorShared';

// ── FACTURAS (portal Banco Fondeador) ──────────────────────────────────────────
// Historial completo de la cadena de facturación (como en /admin/facturas) +
// % de pago completado de las facturas Aprobadas.
const FILTROS_ESTADO = ['Todos', 'Enviada', 'En Evaluación', 'Emitida', 'Con Requerimientos', 'OTP Enviada', 'Pagada', 'Saldo en Billetera'];
const FILTROS_ESTADO_KEY = { 'Enviada': INV.enviada, 'En Evaluación': INV.enEvaluacion, 'Emitida': INV.emitida, 'Con Requerimientos': INV.conRequerimientos, 'OTP Enviada': INV.otpEnviada, 'Pagada': INV.pagada, 'Saldo en Billetera': INV.billetera };

const Header = ({ title, sub, Icon, right }) => (
  <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
    <div className="flex items-center gap-3">
      <div className="bona-gradient-bg w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-[14px] font-bold text-text-1">{title}</div>
        {sub && <div className="text-[11px] text-text-4">{sub}</div>}
      </div>
    </div>
    {right}
  </div>
);

export default function FondFacturas() {
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [detalle, setDetalle] = useState(null);

  const todasLasFacturas = facturaService.listar();
  const facturas = filtroCliente ? todasLasFacturas.filter(f => f.contratante === filtroCliente) : todasLasFacturas;

  const q = busqueda.trim().toLowerCase();
  const matchesQ = (f, fields) => !q || fields.some(v => (v ?? '').toLowerCase().includes(q));

  const facturasFiltradas = (filtroEstado === 'Todos' ? facturas : facturas.filter(f => f.estado === FILTROS_ESTADO_KEY[filtroEstado]))
    .filter(f => matchesQ(f, [f.id, f.pyme, f.contratante, f.concepto, f.contrato]))
    .sort(porFechaDesc);

  return (
    <AppShell active="fondFacturas" role="fondeador" title="Facturas" sub={`Historial de facturación visto por ${BANCO}`}>
      <div className="fade-in space-y-4">
        <div className="flex justify-end">
          <FiltroClienteSelect value={filtroCliente} onChange={setFiltroCliente} />
        </div>
        <div className="bg-white rounded-[14px] border border-border p-5">
        <Header
          title="Todas las facturas"
          sub={filtroCliente ? `Facturas de ${filtroCliente}; las aprobadas muestran el % de pago completado.` : 'Historial completo de la cadena de facturación; las aprobadas muestran el % de pago completado.'}
          Icon={Receipt}
          right={<span className="text-[11px] font-bold text-orange-dark whitespace-nowrap">{facturas.length} registradas</span>}
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-4">
          <div className="relative w-full max-w-[300px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4" />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por Nº, PYME, contratante, contrato o concepto…"
              className="w-full pl-8 pr-3 py-1.5 text-[12px] rounded-[8px] border border-border bg-white placeholder-text-4 focus:outline-none focus:border-orange"
            />
          </div>
          <div className="relative flex items-center shrink-0">
            <ListFilter className="absolute left-2.5 w-3.5 h-3.5 pointer-events-none shrink-0 text-orange" />
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              className="h-9 pl-8 pr-7 text-[12px] font-medium rounded-[8px] border-2 border-orange bg-white text-text-1 focus:outline-none transition cursor-pointer appearance-none w-full sm:w-auto"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23EF7A2C' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
            >
              {FILTROS_ESTADO.map(e => <option key={e}>{e}</option>)}
            </select>
          </div>
        </div>

        {/* Móvil: cards sin scroll lateral */}
        <div className="sm:hidden space-y-2">
          {facturasFiltradas.map(f => {
            const aprobada = f.estado === INV.aprobada;
            const pagado   = aprobada ? Number(f.pagosAcumulados || 0) : 0;
            const pctAvance = aprobada ? Math.min(100, Math.round((pagado / (Number(f.monto) || 1)) * 100)) : 0;
            return (
              <div key={f.id} onClick={() => setDetalle(f)}
                className="rounded-[12px] border border-border px-3 py-2.5 cursor-pointer hover:bg-orange-tint/40 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-text-1 whitespace-nowrap">{f.id}</span>
                  <InvoiceStatusBadge estado={f.estado} />
                  <span className="text-[12px] font-bold text-text-1 ml-auto whitespace-nowrap">{fmt(f.monto)} XAF</span>
                </div>
                <div className="text-[12px] font-semibold text-text-3 truncate mt-1">{f.pyme ?? '—'}</div>
                <div className="text-[11px] text-text-5 truncate">{f.contratante ?? '—'} · {f.contrato}</div>
                {aprobada && pagado > 0 && (
                  <div className="mt-1.5 flex items-center gap-2" title={`Pagado ${fmt(pagado)} XAF de ${fmt(f.monto)} XAF`}>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#ECEAE7' }}>
                      <div className="h-full rounded-full" style={{ width: `${pctAvance}%`, background: 'linear-gradient(90deg, #E0201C, #EF7A2C)' }} />
                    </div>
                    <span className="text-[10px] font-bold text-orange-dark shrink-0">{pctAvance}%</span>
                  </div>
                )}
              </div>
            );
          })}
          {facturasFiltradas.length === 0 && (
            <div className="text-[12px] text-text-4 text-center py-8">No se encontraron facturas con los filtros aplicados.</div>
          )}
        </div>

        {/* Desktop: tabla compacta (sin min-width forzado) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-page-bg">
              <tr className="border-b border-border">
                {['Nº Factura', 'PYME', 'Contratante', 'Estado', 'Avance', 'Monto', 'Fecha', 'Detalle'].map((h, i) => (
                  <th key={h} className={`text-xs font-semibold text-text-4 uppercase tracking-wide px-2.5 py-3 whitespace-nowrap
                    ${i === 0 ? 'text-left' : i === 5 ? 'text-right' : 'text-center'}
                  `}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {facturasFiltradas.map(f => {
                const aprobada = f.estado === INV.aprobada;
                const pagado   = aprobada ? Number(f.pagosAcumulados || 0) : 0;
                const pctAvance = aprobada ? Math.min(100, Math.round((pagado / (Number(f.monto) || 1)) * 100)) : 0;
                return (
                  <tr key={f.id} onClick={() => setDetalle(f)}
                    className={`border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-orange-tint/40 ${f.estado === INV.emitida ? 'bg-orange-tint/10' : ''}`}
                  >
                    <td className="px-2.5 py-3 whitespace-nowrap">
                      <span className="text-[12px] font-bold text-text-1">{f.id}</span>
                      <div className="text-[10px] text-text-5 max-w-[150px] truncate">{f.concepto}</div>
                    </td>
                    <td className="px-2.5 py-3 text-[12px] font-semibold text-text-1 max-w-[140px] truncate">{f.pyme}</td>
                    <td className="px-2.5 py-3 text-[12px] text-text-4 max-w-[170px]">
                      <span className="block truncate">{f.contratante ?? '—'}</span>
                      <span className="text-[10px] font-mono text-text-5">{f.contrato}</span>
                    </td>
                    <td className="px-2.5 py-3 text-center"><InvoiceStatusBadge estado={f.estado} /></td>
                    <td className="px-2.5 py-3 text-center">
                      {aprobada && pagado > 0 ? (
                        <div className="flex items-center justify-center gap-1.5" title={`Pagado ${fmt(pagado)} XAF de ${fmt(f.monto)} XAF`}>
                          <div className="w-14 h-1.5 rounded-full overflow-hidden shrink-0" style={{ background: '#ECEAE7' }}>
                            <div className="h-full rounded-full" style={{ width: `${pctAvance}%`, background: 'linear-gradient(90deg, #E0201C, #EF7A2C)' }} />
                          </div>
                          <span className="text-[11px] font-bold text-orange-dark whitespace-nowrap">{pctAvance}%</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-text-5">—</span>
                      )}
                    </td>
                    <td className="px-2.5 py-3 text-right text-[12px] font-bold text-text-1 whitespace-nowrap">{fmt(f.monto)} XAF</td>
                    <td className="px-2.5 py-3 text-center text-[11px] text-text-5 whitespace-nowrap">{f.fecha}</td>
                    <td className="px-2.5 py-3 text-center">
                      <div onClick={e => e.stopPropagation()}>
                        <button onClick={() => setDetalle(f)} title="Ver detalle"
                          className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {facturasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[12px] text-text-4">No se encontraron facturas con los filtros aplicados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {detalle && (
          <InvoiceDetailModal
            factura={detalle}
            onClose={() => setDetalle(null)}
            footer={
              <Button variant="ghost" size="sm" onClick={() => setDetalle(null)}>Cerrar</Button>
            }
          />
        )}
        </div>
      </div>
    </AppShell>
  );
}
