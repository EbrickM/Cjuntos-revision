import { useState } from 'react';
import {
  Zap, Receipt, Wallet, CheckCircle,
  Banknote, ShieldCheck, Search, ListFilter, Eye, MessageSquare, Send,
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import InfoRow from '../../components/ui/InfoRow';
import Badge from '../../components/ui/Badge';
import InvoiceStatusBadge from '../../components/invoices/InvoiceStatusBadge';
import InvoiceDetailModal from '../../components/invoices/InvoiceDetailModal';
import { facturaService } from '../../services/factura.service';
import { INV, MODALIDAD } from '../../lib/invoiceStates';
import { fmt } from '../../pages/empresa-pequena/epData';

// ── Admin: Centro de Operaciones de Facturación (rol Bonafide/Fondeador) ──────
// Bonafide valida IPIs, define la modalidad de desembolso y monitorea toda la
// cadena. Los pasos del banco (Fondeo Recibido → OTP) los ejecuta el portal del
// Banco Fondeador desde su bandeja de órdenes.
// El diseño (stats, buscador+filtro, tablas por pestaña) es el mismo que el de
// la sección Admin de Contratos.

const TABS = [
  { id: 'bandeja',  lbl: 'Bandeja IPIs', Icon: Zap },
  { id: 'facturas', lbl: 'Facturas',     Icon: Receipt },
  { id: 'billeteras', lbl: 'Billeteras', Icon: Wallet },
  { id: 'pagos',    lbl: 'Pagos y Cheques', Icon: Banknote },
];

const FILTROS_ESTADO = ['Todos', 'Enviada', 'En Evaluación', 'Emitida', 'Con Requerimientos', 'OTP Enviada', 'Pagada', 'Saldo en Billetera'];
const FILTROS_ESTADO_KEY = { 'Enviada': INV.enviada, 'En Evaluación': INV.enEvaluacion, 'Emitida': INV.emitida, 'Con Requerimientos': INV.conRequerimientos, 'OTP Enviada': INV.otpEnviada, 'Pagada': INV.pagada, 'Saldo en Billetera': INV.billetera };

const contratosCtx = {
  'CT-2026-0041': { retencion: 3, gestionCobranza: 1.5, interes: 5 },
  'CT-2026-0052': { retencion: 3, gestionCobranza: 1.5, interes: 5 },
  'CT-2026-0021': { retencion: 2, gestionCobranza: 1, interes: 6 },
  'CT-2026-0033': { retencion: 2.5, gestionCobranza: 1, interes: 5.5 },
};

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

const SearchBar = ({ value, onChange, placeholder = 'Buscar…', withEstado = false, estado, onEstado, estados }) => (
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-4">
    <div className="relative flex-1">
      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-3 py-2 text-[12px] rounded-[8px] border border-border bg-white placeholder-text-4 focus:outline-none focus:border-orange"
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
  const [tab, setTab]                 = useState('bandeja');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [busqueda, setBusqueda]       = useState('');
  const [detalle, setDetalle]         = useState(null);
  const [validando, setValidando]     = useState(null);
  const [ponerReq, setPonerReq]       = useState(false);
  const [reqMensaje, setReqMensaje]   = useState('');
  const [requerimiento, setRequerimiento] = useState(null);
  const [, setTick]                   = useState(0);

  const bump = () => setTick(t => t + 1);
  const facturas = facturaService.listar();

  const bandeja = facturas.filter(f => f.tipoFactoring === 'inverso' && f.estado === INV.emitida);
  const billeteras = facturaService.listarBilleteras();
  const pagos      = facturaService.listarPagos();

  const q = busqueda.trim().toLowerCase();
  const matchesQ = (f, fields) => !q || fields.some(v => (v ?? '').toLowerCase().includes(q));

  const filtradas = filtroEstado === 'Todos'
    ? facturas
    : facturas.filter(f => f.estado === FILTROS_ESTADO_KEY[filtroEstado]);

  const bandejaFiltrada = bandeja.filter(f => matchesQ(f, [f.id, f.ipi?.numero, f.pyme, f.contratante]));
  const facturasFiltradas = filtradas.filter(f => matchesQ(f, [f.id, f.pyme, f.contratante, f.concepto, f.contrato]));
  const billeterasFiltradas = billeteras.filter(b => matchesQ(b, [b.pyme]));
  const pagosFiltrados = pagos.filter(p => matchesQ(p, [p.id, p.proveedor, p.facturaId]));

  const kpis = [
    { value: facturas.filter(f => f.estado === INV.emitida).length, label: 'IPIs por validar', numCls: 'text-orange' },
    { value: facturas.filter(f => ![INV.pagada, INV.billetera].includes(f.estado)).length, label: 'En proceso', numCls: 'text-blue-text' },
    { value: facturas.filter(f => f.estado === INV.pagada).length, label: 'Pagadas', numCls: 'text-green-text' },
    { value: fmt(billeteras.reduce((a, b) => a + (b.saldoDisponible ?? 0), 0)) + ' XAF', label: 'Saldo en Billetera', numCls: 'text-yellow-text' },
  ];

  const handleConfirmarValidacion = (f, data) => {
    facturaService.validarIPI(f.id, {
      modalidadPago: data.modalidadPago,
      retencion: data.retencion,
      gestionCobranza: data.gestionCobranza,
      interes: data.interes,
      observacion: data.observacion,
    });
    setValidando(null);
    bump();
  };

  const handlePonerRequerimiento = () => {
    if (!detalle) return;
    facturaService.ponerRequerimiento(detalle.id, reqMensaje);
    setPonerReq(false);
    setReqMensaje('');
    setDetalle(null);
    bump();
  };

  const handleConfirmarRequerimiento = (f, mensaje) => {
    facturaService.ponerRequerimiento(f.id, mensaje);
    setRequerimiento(null);
    bump();
  };

  const handleCloseDetalle = () => {
    setPonerReq(false);
    setReqMensaje('');
    setDetalle(null);
  };

  return (
    <AppShell active="adminFacturas" role="admin" title="Operaciones de Facturación" sub="Bonafide: valida IPIs, define modalidad y monitorea la cadena completa">
      <div className="fade-in space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map(({ value, label, numCls }) => (
            <div key={label} className="bg-white rounded-[14px] border border-border p-4">
              <div className={`text-[26px] font-extrabold leading-none mb-2 truncate ${numCls}`}>{value}</div>
              <div className="text-[12px] text-text-4 leading-snug">{label}</div>
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

        {/* ── Tab: Bandeja IPIs ── */}
        {tab === 'bandeja' && (
          <div className="space-y-4">
            <div className="bg-white rounded-[14px] border border-border p-5">
              <Header
                title="IPIs pendientes de validación"
                sub="Emitidos por las Contratantes; validá, aplicá la Matriz de Riesgo y definí la modalidad de desembolso."
                Icon={ShieldCheck}
                right={<span className="text-[11px] font-bold text-orange-dark whitespace-nowrap">{bandeja.length} pendientes</span>}
              />
              <SearchBar value={busqueda} onChange={setBusqueda} placeholder="Buscar por Nº, IPI, PYME o contratante…" />

              {/* Tabla */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px]">
                  <thead className="bg-page-bg">
                    <tr className="border-b border-border">
                      {['IPI', 'PYME', 'Contratante', 'Monto', 'Emisión', 'Estado', 'Acción'].map((h, i) => (
                        <th key={h} className={`text-xs font-semibold text-text-4 uppercase tracking-wide px-4 py-3
                          ${i === 0 ? 'text-left' : i === 3 ? 'text-right' : i === 6 ? 'text-center' : 'text-center'}
                        `}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bandejaFiltrada.map(f => (
                      <tr key={f.id} className="border-b border-border last:border-0 transition-colors hover:bg-orange-tint/40">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-[12px] font-bold text-text-1">{f.id}</div>
                          <div className="text-[10px] font-mono text-text-4">{f.ipi?.numero}</div>
                        </td>
                        <td className="px-4 py-3 text-[12px] font-semibold text-text-1 whitespace-nowrap">{f.pyme}</td>
                        <td className="px-4 py-3 text-[12px] text-text-4 max-w-[240px]">
                          <span className="block truncate">{f.contratante}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-[12px] font-bold text-text-1 whitespace-nowrap">{fmt(f.monto)} XAF</td>
                        <td className="px-4 py-3 text-center text-[11px] text-text-5 whitespace-nowrap">{f.ipi?.fechaEmision}</td>
                        <td className="px-4 py-3 text-center"><InvoiceStatusBadge estado={INV.emitida} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                            <Button variant="secondary" size="sm" onClick={() => setRequerimiento(f)}>
                              <MessageSquare className="w-3.5 h-3.5 mr-1" />Poner requerimiento
                            </Button>
                            <Button variant="primary" size="sm" onClick={() => setValidando(f)}>
                              <Zap className="w-3.5 h-3.5 mr-1" />Validar IPI
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {bandejaFiltrada.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-[12px] text-text-4">No hay IPIs pendientes que coincidan.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-[14px] border border-border p-5">
              <div className="text-[13px] font-bold mb-3">Flujo del IPI</div>
              <div className="flex flex-col sm:flex-row gap-2 text-[11px] text-text-3">
                <span className="px-2.5 py-1.5 rounded-full bg-page-bg">1 · Bonafide valida IPI</span>
                <span className="px-2.5 py-1.5 rounded-full bg-page-bg">2 · Contratante envía orden al Fondeador</span>
                <span className="px-2.5 py-1.5 rounded-full bg-page-bg">3 · Fondeo Recibido (Banco Fondeador)</span>
                <span className="px-2.5 py-1.5 rounded-full bg-page-bg">4 · OTP a la Contratante</span>
                <span className="px-2.5 py-1.5 rounded-full bg-page-bg">5 · Pago / Billetera</span>
              </div>
            </div>
          </div>
        )}

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
              placeholder="Buscar por Nº, PYME, contratante, contrato o concepto…"
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
                    {['Nº Factura', 'PYME', 'Contratante', 'Contrato', 'Estado', 'Monto', 'Fecha', 'Detalle'].map((h, i) => (
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
              right={<span className="text-[11px] font-bold text-orange-dark whitespace-nowrap">{billeteras.length} PYMEs</span>}
            />
            <SearchBar value={busqueda} onChange={setBusqueda} placeholder="Buscar por PYME…" />

            {billeterasFiltradas.length === 0 && (
              <div className="text-[13px] text-text-4 py-10 text-center">
                {billeteras.length === 0 ? 'Aún no hay PYMEs con modalidad Billetera Virtual desbloqueada.' : 'No se encontraron billeteras con el filtro aplicado.'}
              </div>
            )}

            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="bg-page-bg">
                  <tr className="border-b border-border">
                    {['PYME', 'Monto presupuestado', 'Saldo disponible', 'Total distribuido', 'Facturas', 'Estado'].map((h, i) => (
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
                      <td className="px-4 py-3 text-right text-[12px] font-bold text-green-text whitespace-nowrap">{fmt(b.saldoDisponible ?? 0)} XAF</td>
                      <td className="px-4 py-3 text-right text-[12px] font-semibold text-orange whitespace-nowrap">{fmt(b.totalDistribuido ?? 0)} XAF</td>
                      <td className="px-4 py-3 text-center text-[12px] font-bold text-text-1">{b.facturas?.length ?? 0}</td>
                      <td className="px-4 py-3 text-center"><InvoiceStatusBadge estado={INV.billetera} /></td>
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
            <SearchBar value={busqueda} onChange={setBusqueda} placeholder="Buscar por proveedor, Nº de pago o factura…" />

            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="bg-page-bg">
                  <tr className="border-b border-border">
                    {['Proveedor', 'Nº Pago', 'Factura', 'Método', 'Monto', 'Fecha'].map((h, i) => (
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
                          <Badge variant={pago.metodo === 'cheque' ? 'yellow' : 'green'}>
                            {pago.metodo === 'cheque' ? pago.cheque : 'Transferencia'}
                          </Badge>
                          {pago.estado === 'Pendiente de Cobro' && (
                            <span className="text-[10px] text-warn">Pendiente</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-[12px] font-extrabold text-text-1 whitespace-nowrap">{fmt(pago.monto)} XAF</td>
                      <td className="px-4 py-3 text-center text-[11px] text-text-5 whitespace-nowrap">{pago.fechaPago}</td>
                    </tr>
                  ))}
                  {pagosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-[12px] text-text-4">No hay pagos que coincidan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ── Modal: Validar IPI (Bonafide) ── */}
      {validando && (
        <ValidacionIpiModal
          factura={validando}
          onClose={() => setValidando(null)}
          onConfirm={handleConfirmarValidacion}
        />
      )}

      {/* ── Modal: Poner requerimiento (Bonafide) ── */}
      {requerimiento && (
        <RequerimientoIpiModal
          factura={requerimiento}
          onClose={() => setRequerimiento(null)}
          onConfirm={handleConfirmarRequerimiento}
        />
      )}

      {/* ── Modal: Detalle de factura ── */}
      {detalle && (
        <InvoiceDetailModal
          factura={detalle}
          onClose={handleCloseDetalle}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={handleCloseDetalle}>Cerrar</Button>
              {detalle.estado === INV.emitida && !ponerReq && (
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setPonerReq(true)}>
                    <MessageSquare className="w-3.5 h-3.5 mr-1" />Poner requerimiento
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => { const f = detalle; handleCloseDetalle(); setValidando(f); }}>
                    <Zap className="w-3.5 h-3.5 mr-1" />Validar IPI
                  </Button>
                </div>
              )}
            </>
          }
        >
          {ponerReq && (
            <div className="rounded-[12px] border border-orange/40 bg-orange-tint/10 p-4">
              <div className="text-[12px] font-semibold text-text-1 mb-2">Poner requerimiento a la PYME</div>
              <textarea
                value={reqMensaje}
                onChange={e => setReqMensaje(e.target.value)}
                rows={3}
                placeholder="Escribe el requerimiento que debe corregir la PYME…"
                className="w-full rounded-[10px] border-2 border-input-border focus:border-orange focus:outline-none px-3 py-2 text-[13px] resize-none"
              />
              <div className="flex justify-end mt-3">
                <Button variant="danger" size="sm" onClick={handlePonerRequerimiento} disabled={!reqMensaje.trim()}>
                  <Send className="w-3.5 h-3.5 mr-1" />Enviar requerimiento
                </Button>
              </div>
            </div>
          )}
        </InvoiceDetailModal>
      )}
    </AppShell>
  );
}

// ── Modal: poner requerimiento a la PYME desde la Bandeja IPIs ────────────────
function RequerimientoIpiModal({ factura, onClose, onConfirm }) {
  const [mensaje, setMensaje] = useState('');

  return (
    <Modal
      title={`Poner requerimiento · ${factura.id}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={() => onConfirm(factura, mensaje)} disabled={!mensaje.trim()}>
            <Send className="w-3.5 h-3.5 mr-1" />Enviar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InfoRow label="PYME" value={factura.pyme} />
          <InfoRow label="Contrato" value={factura.contrato} />
          <InfoRow label="Monto IPI" value={`${fmt(factura.monto)} XAF`} />
          <InfoRow label="Vence" value={factura.fechaVencimiento ?? '—'} />
        </div>

        <div>
          <label className="text-[11px] text-text-4 mb-1 block">Mensaje para la PYME</label>
          <textarea
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            rows={4}
            placeholder="Escribe el requerimiento que debe corregir la PYME…"
            className="w-full rounded-[10px] border-2 border-input-border focus:border-orange focus:outline-none px-3 py-2 text-[13px] resize-none"
          />
        </div>
      </div>
    </Modal>
  );
}

// ── Modal: validación del IPI con condiciones financieras y modalidad ─────────
function ValidacionIpiModal({ factura, onClose, onConfirm }) {
  const ctx = contratosCtx[factura.contrato] ?? { retencion: 3, gestionCobranza: 1.5, interes: 5 };
  const [modalidad, setModalidad] = useState(MODALIDAD.retiroTotal);
  const [retencion, setRetencion] = useState(ctx.retencion);
  const [gestion, setGestion]     = useState(ctx.gestionCobranza);
  const [interes, setInteres]     = useState(ctx.interes);
  const [observacion, setObservacion] = useState('');

  const neto = Math.round(factura.monto * (1 - (retencion + gestion + interes) / 100));

  return (
    <Modal
      title={`Validar IPI · ${factura.id}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={() => onConfirm(factura, { modalidadPago: modalidad, retencion, gestionCobranza: gestion, interes, observacion })}>
            <CheckCircle className="w-3.5 h-3.5 mr-1" />Validar y enviar
          </Button>
        </>
      }
      wide
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InfoRow label="PYME" value={factura.pyme} />
          <InfoRow label="Contrato" value={factura.contrato} />
          <InfoRow label="Monto IPI" value={`${fmt(factura.monto)} XAF`} />
          <InfoRow label="Vence" value={factura.fechaVencimiento ?? '—'} />
        </div>

        <div>
          <div className="text-[12px] font-semibold text-text-3 mb-2">Modalidad de desembolso de la PYME</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={() => setModalidad(MODALIDAD.retiroTotal)}
              className={`flex items-center gap-3 p-4 rounded-[12px] border-2 text-left transition cursor-pointer ${
                modalidad === MODALIDAD.retiroTotal ? 'border-orange bg-orange-tint/30' : 'border-border hover:border-orange/40'
              }`}>
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: 'var(--color-orange-tint)' }}>
                <Banknote className="w-4 h-4 text-orange" />
              </div>
              <div>
                <div className="text-[13px] font-bold">Retirar Todo</div>
                <div className="text-[11px] text-text-4">Transferencia directa a la cuenta de la PYME.</div>
              </div>
            </button>
            <button onClick={() => setModalidad(MODALIDAD.billeteraVirtual)}
              className={`flex items-center gap-3 p-4 rounded-[12px] border-2 text-left transition cursor-pointer ${
                modalidad === MODALIDAD.billeteraVirtual ? 'border-orange bg-orange-tint/30' : 'border-border hover:border-orange/40'
              }`}>
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: 'var(--color-orange-tint)' }}>
                <Wallet className="w-4 h-4 text-orange" />
              </div>
              <div>
                <div className="text-[13px] font-bold">Billetera Virtual</div>
                <div className="text-[11px] text-text-4">Fondos desbloqueados para distribuir a proveedores.</div>
              </div>
            </button>
          </div>
        </div>

        <div>
          <div className="text-[12px] font-semibold text-text-3 mb-2">Matriz de Riesgo (porcentajes)</div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-text-4 mb-1 block">Retención (%)</label>
              <input type="number" value={retencion} min={0} max={50}
                onChange={e => setRetencion(Number(e.target.value) || 0)}
                className="w-full h-11 px-3 rounded-[10px] border-2 border-input-border focus:border-orange focus:outline-none text-[14px] font-semibold text-center" />
            </div>
            <div>
              <label className="text-[11px] text-text-4 mb-1 block">Cobranza (%)</label>
              <input type="number" value={gestion} min={0} max={50}
                onChange={e => setGestion(Number(e.target.value) || 0)}
                className="w-full h-11 px-3 rounded-[10px] border-2 border-input-border focus:border-orange focus:outline-none text-[14px] font-semibold text-center" />
            </div>
            <div>
              <label className="text-[11px] text-text-4 mb-1 block">Interés (%)</label>
              <input type="number" value={interes} min={0} max={50}
                onChange={e => setInteres(Number(e.target.value) || 0)}
                className="w-full h-11 px-3 rounded-[10px] border-2 border-input-border focus:border-orange focus:outline-none text-[14px] font-semibold text-center" />
            </div>
          </div>
        </div>

        <div className="rounded-[12px] border border-border p-4" style={{ background: '#F8F7F5' }}>
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-text-4">Monto del IPI</span>
            <span className="font-semibold">{fmt(factura.monto)} XAF</span>
          </div>
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-text-4">Retención</span>
            <span className="font-semibold">− {fmt(factura.monto * retencion / 100)} XAF</span>
          </div>
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-text-4">Gestión de cobranza</span>
            <span className="font-semibold">− {fmt(factura.monto * gestion / 100)} XAF</span>
          </div>
          <div className="flex justify-between text-[12px] mb-2">
            <span className="text-text-4">Intereses</span>
            <span className="font-semibold">− {fmt(factura.monto * interes / 100)} XAF</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2.5">
            <span className="text-[12px] font-semibold text-text-1">Monto a transferir</span>
            <span className="text-[16px] font-extrabold text-green-text">{fmt(neto)} XAF</span>
          </div>
        </div>

        <div>
          <label className="text-[11px] text-text-4 mb-1 block">Observación para la PYME (requerimiento)</label>
          <input
            type="text"
            value={observacion}
            onChange={e => setObservacion(e.target.value)}
            placeholder="Condiciones de la validación…"
            className="w-full h-11 px-3 rounded-[10px] border-2 border-input-border focus:border-orange focus:outline-none text-[13px]"
          />
        </div>
      </div>
    </Modal>
  );
}