import { useState } from 'react';
import {
  CheckCircle, Banknote, Send, ShieldCheck, Check, X, Eye, Search,
  ArrowUpDown, ArrowUp, ArrowDown, Layers2, Receipt, Zap,
  LayoutList, FilePlus, AlertCircle, FileCheck, AlertTriangle, Wallet,
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import { StatCard } from '../../components/common/StatCard';
import { useCountUp } from '../../hooks/useCountUp';
import InfiniteScrollSentinel from '../../components/common/InfiniteScrollSentinel';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import InvoiceDetailModal from '../../components/invoices/InvoiceDetailModal';
import FondeadorOtpModal from '../../components/invoices/FondeadorOtpModal';
import RequerimientoBadge from '../../components/invoices/RequerimientoBadge';
import RequerirButton from '../../components/invoices/RequerirButton';
import AprobarButton from '../../components/invoices/AprobarButton';
import InvoiceStatusBadge from '../../components/invoices/InvoiceStatusBadge';
import Badge from '../../components/ui/Badge';
import { facturaService } from '../../services/factura.service';
import { INV, estadoLabel } from '../../lib/invoiceStates';
import { porFechaDesc } from './contratanteShared';

const ESTADO_LABEL = {
  [INV.creada]: 'Creada',
  [INV.enviada]: 'Enviada',
  [INV.enEvaluacion]: 'En evaluación',
  [INV.conCorrecciones]: 'Con correcciones',
  [INV.aprobada]: 'Aprobada',
  [INV.emitida]: 'Emitida',
  [INV.conRequerimientos]: 'Con Requerimientos',
  [INV.ordenFondeador]: 'Orden al Fondeador',
  [INV.fondeado]: 'Fondeado',
  [INV.otpEnviada]: 'OTP enviada',
  [INV.otpVerificada]: 'Verificada',
  [INV.pagada]: 'Pagada',
  [INV.billetera]: 'Billetera',
};
const labelDe = (f) => ESTADO_LABEL[f.estado] ?? f.estado ?? 'Emitida';
const ESTADO_ICON = {
  'Todos':              LayoutList,
  'Creada':             FilePlus,
  'Enviada':            Send,
  'En evaluación':      Eye,
  'Con correcciones':   AlertCircle,
  'Aprobada':           CheckCircle,
  'Emitida':            FileCheck,
  'Con Requerimientos': AlertTriangle,
  'Orden al Fondeador': Banknote,
  'Fondeado':           Banknote,
  'OTP enviada':        ShieldCheck,
  'Verificada':         ShieldCheck,
  'Pagada':             Check,
  'Billetera':          Wallet,
};

// ── IPIs generados por la Contratante ──────────────────────────────────────────
// A diferencia del Banco Fondeador (que infiere IPIs a partir del estado de
// pago de cada factura, porque no tiene el registro del envío), la Contratante
// sí tiene el dato real: `factura.ipiEnviado` lo estampa
// `facturaService.enviarIpiDeContrato()` en cada factura incluida cuando se
// genera un IPI desde el detalle del contrato. Acá solo se agrupan las
// facturas por ese número de IPI.
function ipisContratante() {
  const facturas = facturaService.listarPorRol('contratante');
  const grupos = new Map();
  facturas.forEach(f => {
    const numero = f.ipiEnviado?.numero;
    if (!numero) return;
    if (!grupos.has(numero)) {
      grupos.set(numero, {
        numero,
        pyme: f.pyme,
        contrato: f.contrato,
        fecha: f.ipiEnviado.fechaEnvio,
        monto: f.ipiEnviado.monto,
        ops: [],
      });
    }
    const pagado = Number(f.pagosAcumulados || 0);
    const completo = f.estado === INV.pagada || f.estado === INV.billetera;
    grupos.get(numero).ops.push({
      facturaId: f.id,
      pyme: f.pyme,
      concepto: f.concepto,
      tipo: completo ? 'Completo' : 'Parcial',
      monto: completo ? Number(f.monto) || 0 : pagado,
      pct: completo ? 100 : (Number(f.pagoParcial?.pct) || Math.round((pagado / (Number(f.monto) || 1)) * 100)),
    });
  });
  return [...grupos.values()].sort(porFechaDesc);
}


// ── MIS FACTURAS (portal Contratante) ─────────────────────────────────────────
// Fase 1 BPMN: la PYME emite → la Contratante evalúa/aprueba (o devuelve con
// correcciones) → ordena al Banco Fondeador y verifica la transferencia con
// OTP (Ruta A / Ruta B).
export default function EmpFacturas() {
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [busqueda, setBusqueda]         = useState('');
  const [detalle, setDetalle]           = useState(null); // factura seleccionada
  const [evaluando, setEvaluando]       = useState(null); // modal evaluar
  const [otpFactura, setOtpFactura]     = useState(null); // modal OTP Fondeador
  const [vista, setVista]               = useState('facturas'); // 'facturas' | 'ipis'
  const [ipiDetalle, setIpiDetalle]     = useState(null); // modal resumen de operaciones del IPI
  const [, setTick]                     = useState(0);
  const bump = () => setTick(t => t + 1);
  const [sort, setSort] = useState({ key: null, dir: 'asc' });
  const [groupBy, setGroupBy] = useState(null);
  const toggleSort = (key) => setSort(s =>
    s.key !== key ? { key, dir: 'asc' }
    : s.dir === 'asc' ? { key, dir: 'desc' }
    : { key: null, dir: 'asc' }
  );
  const toggleGroup = (key) => setGroupBy(g => g === key ? null : key);
  const sortIcon = (k) => sort.key !== k
    ? <ArrowUpDown className="w-3 h-3 shrink-0 opacity-30" />
    : sort.dir === 'asc'
      ? <ArrowUp className="w-3 h-3 shrink-0 text-orange" />
      : <ArrowDown className="w-3 h-3 shrink-0 text-orange" />;
  const groupIcon = (k) => <Layers2 className={`w-3 h-3 shrink-0 ${groupBy === k ? 'text-orange' : 'opacity-30'}`} />;
  const [sortIpi, setSortIpi] = useState({ key: null, dir: 'asc' });
  const [groupByIpi, setGroupByIpi] = useState(null);
  const toggleSortIpi = (key) => setSortIpi(s =>
    s.key !== key ? { key, dir: 'asc' }
    : s.dir === 'asc' ? { key, dir: 'desc' }
    : { key: null, dir: 'asc' }
  );
  const toggleGroupIpi = (key) => setGroupByIpi(g => g === key ? null : key);
  const sortIconIpi = (k) => sortIpi.key !== k
    ? <ArrowUpDown className="w-3 h-3 shrink-0 opacity-30" />
    : sortIpi.dir === 'asc'
      ? <ArrowUp className="w-3 h-3 shrink-0 text-orange" />
      : <ArrowDown className="w-3 h-3 shrink-0 text-orange" />;
  const groupIconIpi = (k) => <Layers2 className={`w-3 h-3 shrink-0 ${groupByIpi === k ? 'text-orange' : 'opacity-30'}`} />;

  const facturas = facturaService.listarPorRol('contratante');
  const facturasVivas = facturas.map(f => ({ ...f }));
  const ipis = ipisContratante();

  const ESTADOS = ['Todos', ...Array.from(new Set(facturasVivas.map(labelDe)))];

  const filtered = facturasVivas.filter(f =>
    (filtroEstado === 'Todos' || labelDe(f) === filtroEstado) &&
    (!busqueda.trim() ||
      f.id.toLowerCase().includes(busqueda.toLowerCase()) ||
      (f.pyme || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (f.contrato || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (f.concepto || '').toLowerCase().includes(busqueda.toLowerCase()))
  );

  const parseDate = (d) => {
    if (!d) return '';
    const [dd, mm, yyyy] = (d || '').split('/');
    return `${yyyy ?? ''}-${mm ?? ''}-${dd ?? ''}`;
  };

  const sorted = (() => {
    const effectiveKey = groupBy || sort.key;
    if (!effectiveKey) return filtered;
    const dir = groupBy ? 1 : (sort.dir === 'asc' ? 1 : -1);
    return [...filtered].sort((a, b) => {
      if (effectiveKey === 'contrato') return (a.contrato ?? '').localeCompare(b.contrato ?? '');
      if (effectiveKey === 'empresa') {
        const ea = a.pyme ?? a.contratante ?? a.suministrador ?? a.proveedorNombre ?? '';
        const eb = b.pyme ?? b.contratante ?? b.suministrador ?? b.proveedorNombre ?? '';
        return dir * ea.localeCompare(eb);
      }
      if (effectiveKey === 'fecha') return dir * parseDate(a.fecha).localeCompare(parseDate(b.fecha));
      if (effectiveKey === 'monto') return dir * (a.monto - b.monto);
      if (effectiveKey === 'pagado') return dir * ((a.pagosAcumulados ?? 0) - (b.pagosAcumulados ?? 0));
      if (effectiveKey === 'estado') return dir * estadoLabel(a.estado).localeCompare(estadoLabel(b.estado));
      return 0;
    });
  })();

  const sortedIpis = (() => {
    const effectiveKey = groupByIpi || sortIpi.key;
    if (!effectiveKey) return ipis;
    const dir = groupByIpi ? 1 : (sortIpi.dir === 'asc' ? 1 : -1);
    return [...ipis].sort((a, b) => {
      if (effectiveKey === 'pyme')     return dir * (a.pyme ?? '').localeCompare(b.pyme ?? '');
      if (effectiveKey === 'contrato') return dir * (a.contrato ?? '').localeCompare(b.contrato ?? '');
      if (effectiveKey === 'fecha')    return dir * parseDate(a.fecha).localeCompare(parseDate(b.fecha));
      if (effectiveKey === 'monto')    return dir * (a.monto - b.monto);
      if (effectiveKey === 'ops')      return dir * (a.ops.length - b.ops.length);
      if (effectiveKey === 'numero')   return dir * (a.numero ?? '').localeCompare(b.numero ?? '');
      return 0;
    });
  })();

  const pendientes  = facturasVivas.filter(f => f.estado === INV.enviada || f.estado === INV.enEvaluacion).length;
  const conOtp      = facturasVivas.filter(f => f.estado === INV.otpEnviada).length;
  const totalMonto  = facturasVivas.reduce((a, f) => a + f.monto, 0);

  const animTotal    = useCountUp(facturasVivas.length, 900,  100);
  const animPend     = useCountUp(pendientes,           900,  200);
  const animConOtp   = useCountUp(conOtp,               900,  300);
  const animMonto    = useCountUp(totalMonto,          1500,  200);

  const { visibleItems: pagedFacturas, hasMore, loading, sentinelRef } =
    useInfiniteScroll(sorted, { pageSize: 10, delay: 0, resetKey: `${busqueda}|${filtroEstado}|${sort.key}|${sort.dir}|${groupBy}` });

  const closeModal = () => { setDetalle(null); setOtpFactura(null); };

  const accion = (f) => {
    switch (f.estado) {
      case INV.enviada:
        return { lbl: 'Evaluar factura', Icon: CheckCircle, handler: () => setEvaluando(f) };
      case INV.aprobada:
        return f.tipoFactoring === 'directo'
          ? { lbl: 'Pagar ahora', Icon: Banknote, handler: () => pagarDirecta(f) }
          : null;
      case INV.conRequerimientos:
        return (f.pymeNotifico)
          ? { lbl: 'Enviar al Fondeador', Icon: Send, handler: () => enviarFondeador(f) }
          : null;
      case INV.otpEnviada:
        return { lbl: 'Verificar OTP', Icon: ShieldCheck, handler: () => setOtpFactura(f) };
      default:
        return null;
    }
  };

  const pagarDirecta = (f) => {
    facturaService.pagarDirecta(f.id); bump();
  };
  const enviarFondeador = (f) => {
    // La orden queda en la bandeja del Banco Fondeador, que la liquida desde su
    // propio portal (Fondeo Recibido → OTP) — ya no es un paso automático.
    facturaService.enviarOrdenFondeador(f.id); bump();
  };
  const confirmarOtp = () => {
    if (!otpFactura) return;
    facturaService.verificarOTP(otpFactura.id); setOtpFactura(null); setDetalle(null); bump();
  };

  return (
    <AppShell active="empFacturas" role="contratante" title="Facturas recibidas" sub="Facturas emitidas por Empresas Contratadas — evalúa y aprueba el pago" back>
      <div className="fade-in space-y-5">

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { lbl: 'Total facturas',     val: String(animTotal) },
            { lbl: 'Pendientes validar', val: String(animPend) },
            { lbl: 'OTP por confirmar',  val: String(animConOtp) },
            { lbl: 'Monto total',        val: `${new Intl.NumberFormat('de-DE').format(animMonto)} XAF` },
          ].map(({ lbl, val }) => (
            <StatCard key={lbl} label={lbl} value={val} tone="gradient" />
          ))}
        </div>

        {/* Switch: Facturas | IPIs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex bg-white rounded-[10px] gap-1">
            {[
              { id: 'facturas', lbl: 'Facturas', Icon: Receipt },
              { id: 'ipis',     lbl: 'IPIs',      Icon: Zap },
            ].map(t => (
              <button key={t.id} onClick={() => setVista(t.id)}
                className={`bona-btn py-1.5 px-4 rounded-[8px] text-[12px] font-medium transition-all cursor-pointer whitespace-nowrap inline-flex items-center justify-center gap-1.5 ${
                  vista === t.id ? 'bg-[#EF7A2C] shadow-sm text-white font-semibold' : 'text-text-3 hover:text-text-1'
                }`}>
                <t.Icon className="w-3.5 h-3.5 shrink-0" />
                {t.lbl}
                {t.id === 'ipis' && ipis.length > 0 && (
                  <span className={`ml-0.5 px-1.5 py-px rounded-full text-[10px] font-bold ${vista === 'ipis' ? 'bg-white/25 text-white' : 'bg-orange-tint text-orange-dark'}`}>{ipis.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {vista === 'facturas' && (
          <>
            <div className="flex items-center gap-3">
              <div className="overflow-x-auto pb-0.5 flex-1">
                <div className="flex bg-white rounded-[10px] gap-1 p-1 w-max">
                  {ESTADOS.map(e => {
                    const Icon = ESTADO_ICON[e];
                    return (
                      <button
                        key={e}
                        onClick={() => setFiltroEstado(e)}
                        className={`bona-btn font-medium rounded-[8px] text-[12px] text-center transition-all whitespace-nowrap inline-flex items-center justify-center gap-1.5 px-3 py-1.5
                          ${filtroEstado === e ? 'bg-[#EF7A2C] shadow-sm text-white font-semibold' : 'text-text-3 hover:text-text-1 cursor-pointer'}`}
                      >
                        {Icon && <Icon className="w-3 h-3 shrink-0" />}
                        {e}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="relative shrink-0">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4" />
                <input
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar factura, contrato…"
                  className="h-8 w-56 pl-8 pr-3 text-[12px] rounded-[8px] border-2 border-orange bg-white placeholder-text-4 focus:outline-none focus:border-orange transition"
                />
              </div>
            </div>

            {/* Tabla de facturas */}
            <div className="bg-white rounded-[14px] border border-border overflow-x-auto">
              {/* Header */}
              <div className="min-w-[1020px] grid [grid-template-columns:1.2fr_1.4fr_0.8fr_1.3fr_1.4fr_1.1fr_0.9fr_1.4fr_1fr] bg-page-bg px-4 py-2.5 border-b border-border gap-3 items-center">
                <button onClick={() => toggleGroup('contrato')}
                  className={`text-[11px] font-semibold uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 ${groupBy === 'contrato' ? 'text-orange' : 'text-text-4'}`}>
                  Contrato {groupIcon('contrato')}
                </button>
                <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide">Cod. Factura</span>
                <button onClick={() => toggleSort('fecha')}
                  className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1">
                  Fecha {sortIcon('fecha')}
                </button>
                <button onClick={() => toggleGroup('empresa')}
                  className={`text-[11px] font-semibold uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 text-center justify-center ${groupBy === 'empresa' ? 'text-orange' : 'text-text-4'}`}>
                  Emp. Contratada {groupIcon('empresa')}
                </button>
                <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Concepto</span>
                <button onClick={() => toggleSort('monto')}
                  className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 justify-end">
                  Monto {sortIcon('monto')}
                </button>
                <button onClick={() => toggleSort('pagado')}
                  className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 justify-center">
                  Pagado {sortIcon('pagado')}
                </button>
                <button onClick={() => toggleSort('estado')}
                  className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 justify-center">
                  Estado {sortIcon('estado')}
                </button>
                <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Acciones</span>
              </div>
              {pagedFacturas.flatMap((f, i) => {
                const gVal = groupBy === 'contrato' ? (f.contrato || '—')
                           : groupBy === 'empresa'  ? (f.pyme ?? f.contratante ?? f.suministrador ?? f.proveedorNombre ?? '—')
                           : null;
                const prevGVal = i === 0 ? null
                  : groupBy === 'contrato' ? (pagedFacturas[i-1].contrato || '—')
                  : groupBy === 'empresa'  ? (pagedFacturas[i-1].pyme ?? pagedFacturas[i-1].contratante ?? pagedFacturas[i-1].suministrador ?? pagedFacturas[i-1].proveedorNombre ?? '—')
                  : null;
                const isNewGroup = gVal !== null && (i === 0 || gVal !== prevGVal);
                const groupSep = isNewGroup ? [
                  <div key={`grp-${i}`} className="min-w-[1020px] px-4 py-1.5 bg-orange-tint/20 border-b border-orange/20">
                    <span className="text-[11px] font-bold text-orange">{gVal}</span>
                  </div>
                ] : [];
                const rowDiv = (
                  <div
                    key={f.id}
                    onClick={() => setDetalle(f)}
                    className="min-w-[1020px] grid [grid-template-columns:1.2fr_1.4fr_0.8fr_1.3fr_1.4fr_1.1fr_0.9fr_1.4fr_1fr] px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-all duration-150 hover:scale-[1.01] hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:z-10 relative bg-white items-center gap-3"
                  >
                    <div className="text-[13px] font-bold text-text-1">{f.contrato || '—'}</div>
                    <div className="text-[12px] font-mono font-bold text-text-2">{f.id}</div>
                    <div className="text-[11px] text-text-4">{f.fecha || '—'}</div>
                    <div className="text-[12px] font-semibold text-text-2 truncate text-center">
                      {f.pyme ?? f.contratante ?? f.suministrador ?? f.proveedorNombre ?? '—'}
                    </div>
                    <div className="text-[11px] text-text-4 truncate text-center">{f.concepto || '—'}</div>
                    <div className="text-[13px] font-extrabold text-text-1 text-right whitespace-nowrap">
                      {new Intl.NumberFormat('de-DE').format(f.monto)} XAF
                    </div>
                    {(() => {
                      const total  = Number(f.monto) || 0;
                      const pagado = Number(f.pagosAcumulados) || 0;
                      const isPaid = f.estado === INV.pagada || f.estado === INV.billetera;
                      if (isPaid || pagado > 0) {
                        const amount = isPaid ? total : pagado;
                        const pct = total > 0 ? Math.round((amount / total) * 100) : 100;
                        return <span className="text-[12px] font-bold text-center block" style={{ color: '#EF7A2C' }}>{pct}%</span>;
                      }
                      return <span className="text-[12px] text-text-4 text-center block">—</span>;
                    })()}
                    <div className="flex justify-center">
                      <InvoiceStatusBadge estado={f.estado} noDot />
                    </div>
                    <div className="flex items-center justify-center" onClick={e => e.stopPropagation()}>
                      <span className="w-7 h-7 flex items-center justify-center shrink-0">
                        <button
                          onClick={e => { e.stopPropagation(); setDetalle(f); }}
                          className="p-1.5 rounded-[8px] transition text-text-4 hover:text-orange cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </span>
                      {f.estado === INV.enviada && (
                        <span className="w-7 h-7 flex items-center justify-center shrink-0">
                          <AprobarButton onClick={() => setEvaluando(f)} />
                        </span>
                      )}
                      <span className="w-7 h-7 flex items-center justify-center shrink-0">
                        <RequerirButton factura={{ id: f.id }} emisor="La Contratante" onEnviar={(msg) => { facturaService.enviarRequerimiento(f.id, { mensaje: msg, emisor: 'La Contratante' }); bump(); }} />
                      </span>
                      <span className="w-6 h-6 flex items-center justify-center shrink-0">
                        <RequerimientoBadge factura={f} variant="inline" />
                      </span>
                    </div>
                  </div>
                );
                return [...groupSep, rowDiv];
              })}
              {filtered.length === 0 && (
                <div className="min-w-[1020px] px-4 py-10 text-center text-[13px] text-text-4">No hay facturas con los filtros aplicados.</div>
              )}
              <InfiniteScrollSentinel sentinelRef={sentinelRef} loading={loading} hasMore={hasMore} />
            </div>
          </>
        )}

        {vista === 'ipis' && (
          <div className="bg-white rounded-[14px] border border-border overflow-x-auto">
            {/* Header */}
            <div className="min-w-[760px] grid [grid-template-columns:1.5fr_1.6fr_1.4fr_0.8fr_1fr_1.3fr_0.7fr] bg-page-bg px-4 py-2.5 border-b border-border gap-3 items-center">
              <button onClick={() => toggleSortIpi('numero')}
                className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1">
                IPI {sortIconIpi('numero')}
              </button>
              <button onClick={() => toggleGroupIpi('pyme')}
                className={`text-[11px] font-semibold uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 justify-center ${groupByIpi === 'pyme' ? 'text-orange' : 'text-text-4'}`}>
                Emp. Contratada {groupIconIpi('pyme')}
              </button>
              <button onClick={() => toggleGroupIpi('contrato')}
                className={`text-[11px] font-semibold uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 justify-center ${groupByIpi === 'contrato' ? 'text-orange' : 'text-text-4'}`}>
                Contrato {groupIconIpi('contrato')}
              </button>
              <button onClick={() => toggleSortIpi('ops')}
                className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 justify-center">
                Ops. {sortIconIpi('ops')}
              </button>
              <button onClick={() => toggleSortIpi('fecha')}
                className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 justify-center">
                Fecha {sortIconIpi('fecha')}
              </button>
              <button onClick={() => toggleSortIpi('monto')}
                className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 justify-end">
                Monto {sortIconIpi('monto')}
              </button>
              <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Detalle</span>
            </div>
            {sortedIpis.flatMap((ipi, idx) => {
              const gVal = groupByIpi === 'pyme'     ? (ipi.pyme || '—')
                         : groupByIpi === 'contrato' ? (ipi.contrato || '—')
                         : null;
              const prevGVal = idx === 0 ? null
                : groupByIpi === 'pyme'     ? (sortedIpis[idx - 1].pyme || '—')
                : groupByIpi === 'contrato' ? (sortedIpis[idx - 1].contrato || '—')
                : null;
              const isNewGroup = gVal !== null && (idx === 0 || gVal !== prevGVal);
              const groupSep = isNewGroup ? [
                <div key={`grp-${idx}`} className="min-w-[760px] px-4 py-1.5 bg-orange-tint/20 border-b border-orange/20">
                  <span className="text-[11px] font-bold text-orange">{gVal}</span>
                </div>,
              ] : [];
              const rowDiv = (
                <div
                  key={ipi.numero}
                  onClick={() => setIpiDetalle(ipi)}
                  className="min-w-[760px] grid [grid-template-columns:1.5fr_1.6fr_1.4fr_0.8fr_1fr_1.3fr_0.7fr] px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-all duration-150 hover:scale-[1.01] hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:z-10 relative bg-white items-center gap-3"
                >
                  <div className="text-[12px] font-mono font-bold text-text-1">{ipi.numero}</div>
                  <div className="text-[12px] font-semibold text-text-1 text-center">{ipi.pyme}</div>
                  <div className="text-[11px] font-mono text-text-4 text-center">{ipi.contrato}</div>
                  <div className="text-[12px] font-semibold text-text-3 text-center">{ipi.ops.length}</div>
                  <div className="text-[11px] text-text-4 text-center whitespace-nowrap">{ipi.fecha}</div>
                  <div className="text-[12px] font-bold text-text-1 text-right whitespace-nowrap">{new Intl.NumberFormat('de-DE').format(ipi.monto)} XAF</div>
                  <div className="flex justify-center" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setIpiDetalle(ipi)} title="Ver resumen de operaciones"
                      className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
              return [...groupSep, rowDiv];
            })}
            {ipis.length === 0 && (
              <div className="min-w-[760px] px-4 py-10 text-center text-[13px] text-text-4">Aún no se ha generado ningún IPI.</div>
            )}
          </div>
        )}

      </div>

      {/* ── Modal: Detalle de factura ── */}
      {detalle && (() => {
        const viva = facturaService.obtener(detalle.id) ?? detalle;
        const a = accion(viva);
        return (
          <InvoiceDetailModal
            factura={viva}
            onClose={closeModal}
            footer={
              <>
                <Button variant="ghost" size="sm" onClick={closeModal}>Cerrar</Button>
                <div className="flex items-center gap-2">
                  <RequerirButton label="Poner requerimientos" factura={{ id: viva.id }} emisor="La Contratante" onEnviar={(msg) => { facturaService.enviarRequerimiento(viva.id, { mensaje: msg, emisor: 'La Contratante' }); bump(); }} />
                  {viva.estado === INV.enviada ? (
                    <Button variant="success" size="sm" onClick={() => setEvaluando(viva)}>
                      <Check className="w-3.5 h-3.5 mr-1" /> Aprobar factura
                    </Button>
                  ) : a && (
                    <Button variant="primary" size="sm" onClick={a.handler}>
                      <a.Icon className="w-3.5 h-3.5 mr-1" />{a.lbl}
                    </Button>
                  )}
                </div>
              </>
            }
          />
        );
      })()}

      {/* ── Modal: Evaluar factura (aprobar / devolver) ── */}
      {evaluando && (
        <EvaluarFacturaModal
          factura={facturaService.obtener(evaluando.id) ?? evaluando}
          onClose={() => setEvaluando(null)}
          onResult={(aprobada, motivo) => {
            facturaService.evaluar(evaluando.id, { aprobada, motivo });
            setEvaluando(null); setDetalle(null); bump();
          }}
        />
      )}

      {/* ── Modal: OTP del Banco Fondeador ── */}
      {otpFactura && (
        <FondeadorOtpModal
          factura={facturaService.obtener(otpFactura.id) ?? otpFactura}
          onClose={() => setOtpFactura(null)}
          onConfirm={confirmarOtp}
        />
      )}

      {/* ── Modal: IPI · Resumen de operaciones (igual al de Detalle de Contrato, sin "Enviar IPI") ── */}
      {ipiDetalle && (
        <Modal
          title={`IPI · Resumen de operaciones (${ipiDetalle.ops.length})`}
          onClose={() => setIpiDetalle(null)}
          footer={<Button variant="ghost" size="sm" onClick={() => setIpiDetalle(null)}>Cerrar</Button>}
        >
          <div className="space-y-4">
            <p className="text-[12px] leading-relaxed text-text-4">
              IPI del contrato <span className="font-mono font-semibold text-text-1">{ipiDetalle.contrato}</span> de <span className="font-semibold text-text-1">{ipiDetalle.pyme}</span>.
              Resume todas las operaciones de pago registradas; la liquidación seguirá después el pipeline normal de cada factura.
            </p>

            <div className="space-y-2">
              {ipiDetalle.ops.map(o => (
                <div key={o.facturaId} className="flex items-center justify-between gap-3 rounded-[10px] border border-border p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-mono font-bold text-text-1 truncate">{o.facturaId}</span>
                      <Badge variant={o.tipo === 'Completo' ? 'green' : 'orange'}>{o.tipo}</Badge>
                    </div>
                    <p className="text-[11px] mt-0.5 truncate text-text-4">
                      {o.pyme}{o.concepto ? ` · ${o.concepto}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[13px] font-extrabold text-text-1 whitespace-nowrap">{new Intl.NumberFormat('de-DE').format(o.monto)} XAF</div>
                    <div className="text-[10px] font-semibold text-orange-dark whitespace-nowrap">
                      {o.tipo === 'Completo' ? '100%' : `${o.pct}%`}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[12px] p-4 flex items-center justify-between gap-3" style={{ background: 'var(--bonafide-gradient)' }}>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-white/80">Total operaciones</div>
                <div className="text-[16px] sm:text-[20px] font-extrabold text-white leading-tight">{new Intl.NumberFormat('de-DE').format(ipiDetalle.monto)} XAF</div>
              </div>
              <Badge variant="gold">{ipiDetalle.ops.length} operación{ipiDetalle.ops.length === 1 ? '' : 'es'}</Badge>
            </div>
          </div>
        </Modal>
      )}

    </AppShell>
  );
}

// ── Modal: evaluación de la factura por la Contratante ────────────────────────
function EvaluarFacturaModal({ factura, onClose, onResult }) {
  const [opcion, setOpcion]     = useState('aprobar');
  const [motivo, setMotivo]     = useState('');
  const esInverso               = factura.tipoFactoring === 'inverso';
  const accionText = opcion === 'aprobar'
    ? 'Aprobar y preparar pago'
    : 'Devolver con correcciones';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bona-gradient-shadow w-full max-w-md rounded-2xl p-[2px]">
        <div className="bg-white rounded-2xl p-8 relative max-h-[90vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-page-bg rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5 text-text-3" />
          </button>
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #EF7A2C, #E0201C)' }}>
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-text-1 mb-1">Evaluar factura</h2>
            <p className="text-sm text-text-3">{factura.id} · {factura.pyme}</p>
          </div>

          <div className="rounded-[14px] border border-border p-4 mb-4" style={{ background: '#F8F7F5' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#A9A6A1' }}>Monto</span>
              <span className="text-[16px] font-extrabold text-orange">
                {new Intl.NumberFormat('de-DE').format(factura.monto)} <span className="text-[10px] font-semibold">XAF</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#A9A6A1' }}>Vence</span>
              <span className="text-[12px] font-semibold text-text-1">{factura.fechaVencimiento ?? '—'}</span>
            </div>
          </div>

          <div className="space-y-2 mb-5">
            {[
              { id: 'aprobar', lbl: 'Aprobar factura', sub: esInverso ? 'La Empresa Contratada queda lista para el IPI.' : 'Pago directo a la Empresa Contratada.' },
              { id: 'correcciones', lbl: 'Devolver con correcciones', sub: 'Regresa a la Empresa Contratada para corregir y reenviar.' },
            ].map(o => (
              <button key={o.id} onClick={() => setOpcion(o.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-[12px] border-2 text-left transition cursor-pointer ${
                  opcion === o.id ? 'border-orange bg-orange-tint/30' : 'border-border hover:border-orange/40'
                }`}>
                <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${opcion === o.id ? 'border-orange bg-orange' : 'border-border'}`} />
                <div>
                  <div className="text-[13px] font-bold text-text-1">{o.lbl}</div>
                  <div className="text-[11px] text-text-4">{o.sub}</div>
                </div>
              </button>
            ))}
          </div>

          {opcion === 'correcciones' && (
            <input
              type="text"
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Motivo de la corrección…"
              className="w-full h-11 px-3 rounded-[10px] border-2 border-input-border focus:border-orange focus:outline-none text-[13px] mb-5"
            />
          )}

          <Button onClick={() => onResult(opcion === 'aprobar', motivo)} full className="h-[48px]">
            {accionText}
          </Button>
        </div>
      </div>
    </div>
  );
}