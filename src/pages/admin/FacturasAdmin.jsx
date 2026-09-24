import { useState } from 'react';
import {
  Receipt, Wallet, Banknote, Search, ListFilter, Eye,
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import InfoRow from '../../components/ui/InfoRow';
import Badge from '../../components/ui/Badge';
import InvoiceStatusBadge from '../../components/invoices/InvoiceStatusBadge';
import InvoiceDetailModal from '../../components/invoices/InvoiceDetailModal';
import { StatCard } from '../../components/common/StatCard';
import { useCountUp } from '../../hooks/useCountUp';
import { facturaService } from '../../services/factura.service';
import { INV } from '../../lib/invoiceStates';
import { fmt } from '../../pages/empresa-pequena/epData';

// ── Admin: Centro de Operaciones de Facturación (rol Bonafide) ────────────────
// Bonafide monitorea toda la cadena de facturación. La validación de IPIs y la
// definición de la modalidad de desembolso las ejecuta el portal del Banco
// Fondeador desde su bandeja de órdenes.
// El diseño (stats, buscador+filtro, tablas por pestaña) es el mismo que el de
// la sección Admin de Contratos.

const TABS = [
  { id: 'facturas', lbl: 'Facturas',     Icon: Receipt },
  { id: 'billeteras', lbl: 'Billeteras', Icon: Wallet },
  { id: 'pagos',    lbl: 'Pagos y Cheques', Icon: Banknote },
];

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

const SearchBar = ({ value, onChange, placeholder = 'Buscar…', withEstado = false, estado, onEstado, estados, compact = false }) => (
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-4">
    <div className={`relative ${compact ? 'w-full max-w-[300px]' : 'flex-1'}`}>
      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-8 pr-3 rounded-[8px] border border-border bg-white placeholder-text-4 focus:outline-none focus:border-orange ${compact ? 'py-1.5 text-[12px]' : 'py-2 text-[12px]'}`}
      />
    </div>
    {withEstado && (
      <div className="relative flex items-center shrink-0">
        <ListFilter className="absolute left-2.5 w-3.5 h-3.5 pointer-events-none shrink-0 text-orange" />
        <select
          value={estado}
          onChange={e => onEstado(e.target.value)}
          className="h-9 pl-8 pr-7 text-[12px] font-medium rounded-[8px] border-2 border-orange bg-white text-text-1 focus:outline-none transition cursor-pointer appearance-none w-full sm:w-auto"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23EF7A2C' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
        >
          {estados.map(e => <option key={e}>{e}</option>)}
        </select>
      </div>
    )}
  </div>
);

export default function FacturasAdmin() {
  const [tab, setTab]                 = useState('facturas');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroBilletera, setFiltroBilletera] = useState('Todos');
  const [busqueda, setBusqueda]       = useState('');
  const [detalle, setDetalle]         = useState(null);
  const [detalleBilletera, setDetalleBilletera] = useState(null);
  const [detallePago, setDetallePago] = useState(null);

  const facturas = facturaService.listar();

  const billeteras = facturaService.listarBilleteras();
  const pagos      = facturaService.listarPagos();

  const q = busqueda.trim().toLowerCase();
  const matchesQ = (f, fields) => !q || fields.some(v => (v ?? '').toLowerCase().includes(q));

  const filtradas = filtroEstado === 'Todos'
    ? facturas
    : facturas.filter(f => f.estado === FILTROS_ESTADO_KEY[filtroEstado]);

  const facturasFiltradas = filtradas.filter(f => matchesQ(f, [f.id, f.pyme, f.contratante, f.concepto, f.contrato]));
  const billeterasFiltradas = billeteras
    .filter(b => (filtroBilletera === 'Todos' ? true : (b.estado ?? INV.billetera) === FILTROS_ESTADO_KEY[filtroBilletera]))
    .filter(b => matchesQ(b, [b.pyme]));
  const pagosFiltrados = pagos.filter(p => matchesQ(p, [p.id, p.proveedor, p.facturaId]));

  const totalSaldoRaw = billeteras.reduce((a, b) => a + (b.saldoDisponible ?? 0), 0);

  const animOrdenes  = useCountUp(facturas.filter(f => f.estado === INV.ordenFondeador).length);
  const animEnProceso = useCountUp(facturas.filter(f => ![INV.pagada, INV.billetera].includes(f.estado)).length);
  const animPagadas  = useCountUp(facturas.filter(f => f.estado === INV.pagada).length);
  const animSaldo    = useCountUp(totalSaldoRaw);

  const kpis = [
    { value: animOrdenes,                    label: 'Órdenes al Fondeador' },
    { value: animEnProceso,                  label: 'En proceso'           },
    { value: animPagadas,                    label: 'Pagadas'              },
    { value: `${fmt(animSaldo)} XAF`,        label: 'Saldo en Billetera'   },
  ];

  return (
    <AppShell active="adminFacturas" role="admin" title="Operaciones de Facturación" sub="Bonafide: monitorea la cadena completa de facturación">
      <div className="fade-in space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map(({ value, label }, i) => (
            <div key={label} className="card-enter" style={{ animationDelay: `${i * 60}ms` }}>
              <StatCard tone="gradient" label={label} value={value} />
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-page-bg p-1 rounded-[10px] w-fit">
          {TABS.map(({ id, lbl, Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-[13px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                tab === id ? 'bg-white shadow-sm text-text-1 font-semibold' : 'text-text-3 hover:text-text-1'
              }`}>
              <Icon className="w-3.5 h-3.5" />{lbl}
            </button>
          ))}
        </div>

        {/* ── Tab: Facturas (historial) ── */}
        {tab === 'facturas' && (
          <div className="bg-white rounded-[14px] border border-border p-5">
            <Header
              title="Todas las facturas"
              sub="Historial completo de la cadena de facturación."
              Icon={Receipt}
              right={<span className="text-[11px] font-bold text-orange-dark whitespace-nowrap">{facturas.length} registradas</span>}
            />
            <SearchBar
              value={busqueda}
              onChange={setBusqueda}
              placeholder="Buscar por Nº, Emp. Contratada, contratante, contrato o concepto…"
              compact
              withEstado
              estado={filtroEstado}
              onEstado={setFiltroEstado}
              estados={FILTROS_ESTADO}
            />

            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-page-bg">
                  <tr className="border-b border-border">
                    {['Nº Factura', 'Emp. Contratada', 'Contratante', 'Contrato', 'Estado', 'Monto', 'Fecha', 'Detalle'].map((h, i) => (
                      <th key={h} className={`text-xs font-semibold text-text-4 uppercase tracking-wide px-4 py-3
                        ${i === 0 ? 'text-left' : i === 5 ? 'text-right' : 'text-center'}
                      `}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {facturasFiltradas.map((f) => (
                    <tr key={f.id} onClick={() => setDetalle(f)}
                      className={`border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-orange-tint/40 ${f.estado === INV.emitida ? 'bg-orange-tint/10' : ''}`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-bold text-text-1">{f.id}</span>
                        </div>
                        <div className="text-[10px] text-text-5">{f.concepto?.length > 36 ? `${f.concepto.slice(0, 36)}…` : f.concepto}</div>
                      </td>
                      <td className="px-4 py-3 text-[12px] font-semibold text-text-1 whitespace-nowrap">{f.pyme}</td>
                      <td className="px-4 py-3 text-[12px] text-text-4 max-w-[220px]">
                        <span className="block truncate">{f.contratante}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-[11px] font-mono text-text-5 whitespace-nowrap">{f.contrato}</span>
                      </td>
                      <td className="px-4 py-3 text-center"><InvoiceStatusBadge estado={f.estado} /></td>
                      <td className="px-4 py-3 text-right text-[12px] font-bold text-text-1 whitespace-nowrap">{fmt(f.monto)} XAF</td>
                      <td className="px-4 py-3 text-center text-[11px] text-text-5 whitespace-nowrap">{f.fecha}</td>
                      <td className="px-4 py-3 text-center">
                        <div onClick={e => e.stopPropagation()}>
                          <button onClick={() => setDetalle(f)} title="Ver detalle"
                            className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {facturasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-[12px] text-text-4">No se encontraron facturas con los filtros aplicados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tab: Billeteras Virtuales ── */}
        {tab === 'billeteras' && (
          <div className="bg-white rounded-[14px] border border-border p-5">
            <Header
              title="Billeteras Virtuales"
              sub="Fondos de Bonafide desbloqueados y a la espera de distribución a proveedores."
              Icon={Wallet}
              right={<span className="text-[11px] font-bold text-orange-dark whitespace-nowrap">{billeteras.length} Emp. Contratadas</span>}
            />
            <SearchBar
              value={busqueda}
              onChange={setBusqueda}
              placeholder="Buscar por Empresa Contratada…"
              compact
              withEstado
              estado={filtroBilletera}
              onEstado={setFiltroBilletera}
              estados={FILTROS_ESTADO}
            />

            {billeterasFiltradas.length === 0 && (
              <div className="text-[13px] text-text-4 py-10 text-center">
                {billeteras.length === 0 ? 'Aún no hay Empresas Contratadas con modalidad Billetera Virtual desbloqueada.' : 'No se encontraron billeteras con el filtro aplicado.'}
              </div>
            )}

            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="bg-page-bg">
                  <tr className="border-b border-border">
                    {['Emp. Contratada', 'Monto presupuestado', 'Saldo disponible', 'Total distribuido', 'Facturas', 'Estado', 'Detalle'].map((h, i) => (
                      <th key={h} className={`text-xs font-semibold text-text-4 uppercase tracking-wide px-4 py-3
                        ${i === 0 ? 'text-left' : i >= 1 && i <= 3 ? 'text-right' : 'text-center'}
                      `}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {billeterasFiltradas.map(b => (
                    <tr key={b.pyme} className="border-b border-border last:border-0 transition-colors hover:bg-orange-tint/40">
                      <td className="px-4 py-3 text-[12px] font-bold text-text-1 whitespace-nowrap">{b.pyme}</td>
                      <td className="px-4 py-3 text-right text-[12px] font-semibold text-text-1 whitespace-nowrap">{fmt(b.montoPresupuestado ?? 0)} XAF</td>
                      <td className="px-4 py-3 text-right text-[12px] font-bold text-orange whitespace-nowrap">{fmt(b.saldoDisponible ?? 0)} XAF</td>
                      <td className="px-4 py-3 text-right text-[12px] font-semibold text-orange whitespace-nowrap">{fmt(b.totalDistribuido ?? 0)} XAF</td>
                      <td className="px-4 py-3 text-center text-[12px] font-bold text-text-1">{b.facturas?.length ?? 0}</td>
                      <td className="px-4 py-3 text-center"><InvoiceStatusBadge estado={INV.billetera} /></td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => setDetalleBilletera(b)} title="Ver detalle"
                          className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tab: Pagos y Cheques ── */}
        {tab === 'pagos' && (
          <div className="bg-white rounded-[14px] border border-border p-5">
            <Header
              title="Pagos a proveedores"
              sub="Core Bancario transfiere a proveedores con cuenta; sin cuenta → Cheque de Venta."
              Icon={Banknote}
              right={<span className="text-[11px] font-bold text-orange-dark whitespace-nowrap">{pagos.length} pagos</span>}
            />
            <SearchBar value={busqueda} onChange={setBusqueda} placeholder="Buscar por proveedor, Nº de pago o factura…" compact />

            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="bg-page-bg">
                  <tr className="border-b border-border">
                    {['Proveedor', 'Nº Pago', 'Factura', 'Método', 'Monto', 'Fecha', 'Detalle'].map((h, i) => (
                      <th key={h} className={`text-xs font-semibold text-text-4 uppercase tracking-wide px-4 py-3
                        ${i === 0 ? 'text-left' : i === 4 ? 'text-right' : 'text-center'}
                      `}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagosFiltrados.map(pago => (
                    <tr key={pago.id} className="border-b border-border last:border-0 transition-colors hover:bg-orange-tint/40">
                      <td className="px-4 py-3 text-[12px] font-bold text-text-1 whitespace-nowrap">{pago.proveedor}</td>
                      <td className="px-4 py-3 text-center text-[11px] font-mono text-text-4 whitespace-nowrap">{pago.id}</td>
                      <td className="px-4 py-3 text-center text-[11px] font-mono text-text-5 whitespace-nowrap">{pago.facturaId}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Badge variant={pago.metodo === 'cheque' ? 'yellow' : 'orange'}>
                            {pago.metodo === 'cheque' ? pago.cheque : 'Transferencia'}
                          </Badge>
                          {pago.estado === 'Pendiente de Cobro' && (
                            <span className="text-[10px] text-warn">Pendiente</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-[12px] font-extrabold text-text-1 whitespace-nowrap">{fmt(pago.monto)} XAF</td>
                      <td className="px-4 py-3 text-center text-[11px] text-text-5 whitespace-nowrap">{pago.fechaPago}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => setDetallePago(pago)} title="Ver detalle"
                          className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {pagosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-[12px] text-text-4">No hay pagos que coincidan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ── Modal: Detalle de factura ── */}
      {detalle && (
        <InvoiceDetailModal
          factura={detalle}
          onClose={() => setDetalle(null)}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setDetalle(null)}>Cerrar</Button>
            </>
          }
        />
      )}

      {/* ── Modal: Detalle de billetera virtual ── */}
      {detalleBilletera && (
        <DetalleBilleteraModal
          billetera={detalleBilletera}
          facturas={facturas}
          onClose={() => setDetalleBilletera(null)}
        />
      )}

      {/* ── Modal: Detalle de pago ── */}
      {detallePago && (
        <DetallePagoModal
          pago={detallePago}
          facturas={facturas}
          onClose={() => setDetallePago(null)}
        />
      )}
    </AppShell>
  );
}

// ── Modal: detalle de billetera virtual ───────────────────────────────────────
function DetalleBilleteraModal({ billetera, facturas, onClose }) {
  const facturasDeBilletera = (billetera.facturas ?? [])
    .map(id => facturas.find(f => f.id === id))
    .filter(Boolean);

  return (
    <Modal
      title={`Billetera Virtual · ${billetera.pyme}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
        </>
      }
      wide
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InfoRow label="Empresa Contratada" value={billetera.pyme} />
          <InfoRow label="Monto presupuestado" value={`${fmt(billetera.montoPresupuestado ?? 0)} XAF`} />
          <InfoRow label="Saldo disponible" value={`${fmt(billetera.saldoDisponible ?? 0)} XAF`} />
          <InfoRow label="Total distribuido" value={`${fmt(billetera.totalDistribuido ?? 0)} XAF`} />
        </div>

        <div>
          <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2">Facturas en esta billetera ({facturasDeBilletera.length})</div>
          {facturasDeBilletera.length > 0 ? (
            <div className="space-y-2">
              {facturasDeBilletera.map(f => (
                <div key={f.id} className="flex items-center justify-between gap-3 p-3 rounded-[10px] border border-border">
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold text-text-1 font-mono">{f.id}</div>
                    <div className="text-[11px] text-text-4 truncate">{f.concepto}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[12px] font-extrabold text-text-1">{fmt(f.monto)} XAF</div>
                    <InvoiceStatusBadge estado={f.estado} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[12px] text-text-4 py-6 text-center border border-border rounded-[10px]">Sin facturas asociadas.</div>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ── Modal: detalle de pago ────────────────────────────────────────────────────
function DetallePagoModal({ pago, facturas, onClose }) {
  const factura = facturas.find(f => f.id === pago.facturaId) ?? null;

  return (
    <Modal
      title={`Pago · ${pago.id}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
        </>
      }
      wide
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InfoRow label="Proveedor" value={pago.proveedor} />
          <InfoRow label="Nº Pago" value={pago.id} />
          <InfoRow label="Método" value={pago.metodo === 'cheque' ? 'Cheque de Venta' : 'Transferencia'} />
          <InfoRow label="Estado" value={pago.estado} />
          <InfoRow label="Monto" value={`${fmt(pago.monto)} XAF`} />
          <InfoRow label="Fecha de pago" value={pago.fechaPago} />
          <InfoRow label={pago.metodo === 'cheque' ? 'Cheque' : 'Cuenta'} value={pago.cheque ?? pago.cuenta ?? '—'} />
          <InfoRow label="Factura" value={pago.facturaId} />
        </div>

        {factura && (
          <div className="rounded-[12px] border border-border p-4" style={{ background: '#F8F7F5' }}>
            <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2">Factura asociada</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <InfoRow label="Concepto" value={factura.concepto} />
              <InfoRow label="Monto" value={`${fmt(factura.monto)} XAF`} />
              <InfoRow label="Contratante" value={factura.contratante} />
              <InfoRow label="Estado" value={factura.estado} />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}