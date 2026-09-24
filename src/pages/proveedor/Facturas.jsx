import { useState } from 'react';
import { useCountUp } from '../../hooks/useCountUp';
import {
  Eye, FileText, Banknote, Search, ListFilter, Receipt,
  ArrowUpDown, ArrowUp, ArrowDown, Layers2,
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import { StatCard } from '../../components/common/StatCard';
import InfiniteScrollSentinel from '../../components/common/InfiniteScrollSentinel';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import InvoiceDetailModal from '../../components/invoices/InvoiceDetailModal';
import InvoiceStatusBadge from '../../components/invoices/InvoiceStatusBadge';
import RequerimientoBadge from '../../components/invoices/RequerimientoBadge';
import FacturaContratanteModal from '../../components/invoices/FacturaContratanteModal';
import { defaultVencimiento } from '../../components/invoices/facturaUtils';
import { facturaService } from '../../services/factura.service';
import { SELECT_ARROW } from '../../components/ui/selectArrow';
import { contratoService } from '../../services/contrato.service';
import { INV, estadoLabel } from '../../lib/invoiceStates';

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

const INIT_CT_EMPTY = { open: false, editId: null, contratoId: '', monto: '', concepto: '', fechaVencimiento: '', documento: null };

const SectionHeader = ({ icon: Icon, iconBg, iconColor, title, subtitle, action }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: iconBg }}>
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-bold text-text-1">{title}</div>
        {subtitle && <div className="text-[12px] text-text-4">{subtitle}</div>}
      </div>
    </div>
    {action && <div>{action}</div>}
  </div>
);

// ── MIS FACTURAS (portal Proveedor) ───────────────────────────────────────────
// Fase 2 del BPMN: el Proveedor recibe facturas de sus suministradores; el
// Banco Fondeador (core) paga por transferencia, o emite Cheque de Venta para
// proveedores sin cuenta bancaria. Los comprobantes se consultan aquí.
export default function ProvFacturas() {
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [busqueda, setBusqueda]         = useState('');
  const [detalle, setDetalle]           = useState(null);
  const [facModal, setFacModal]         = useState(INIT_CT_EMPTY);
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

  const facturas   = facturaService.listarPorRol('proveedor');
  const pagos      = facturaService.listarPagos();
  const fmt        = v => new Intl.NumberFormat('de-DE').format(v ?? 0);

  const pagoDe = (id) => pagos.find(p => p.facturaId === id);

  // "Refacturar": abre el modal de nueva factura precargado con los datos de la
  // factura con requerimiento; al enviar se limpia el requerimiento y pasa a
  // Emitida (facturaService.refacturar).
  const abrirRefactura = (f) => setFacModal({
    open: true,
    editId: f.id,
    refacturando: true,
    contratoId: f.contrato,
    monto: String(f.monto ?? ''),
    concepto: f.concepto ?? '',
    fechaVencimiento: f.fechaVencimiento ?? defaultVencimiento(),
    documento: f.documentos?.[0] ?? null,
  });

  const handleGuardar = () => {
    const monto = Number(facModal.monto.replace?.(/[^0-9]/g, '') ?? facModal.monto) || 0;
    if (monto <= 0 || !facModal.concepto.trim() || !facModal.contratoId) return;
    const contrato = contratoService.listarFactoring().find(c => c.id === facModal.contratoId);
    if (contrato?.montoMax && monto > contrato.montoMax) return;
    if (facModal.refacturando) {
      const patch = {
        monto, concepto: facModal.concepto, fechaVencimiento: facModal.fechaVencimiento,
      };
      if (facModal.documento) patch.documentos = [{ name: facModal.documento.name, url: facModal.documento.url }];
      facturaService.refacturar(facModal.editId, patch);
    } else {
      facturaService.crear({
        contrato: facModal.contratoId,
        contratante: contrato?.contratanteNombre ?? 'Chevron',
        tipoFactoring: contrato?.tipoFactoring ?? 'inverso',
        pyme: 'Tradex',
        origen: 'suministrador',
        monto, concepto: facModal.concepto, fechaVencimiento: facModal.fechaVencimiento,
        documentos: facModal.documento ? [{ name: facModal.documento.name, url: facModal.documento.url }] : [],
      });
    }
    setFacModal(INIT_CT_EMPTY);
    bump();
  };

  const ESTADOS = ['Todos', ...Array.from(new Set(facturas.map(labelDe)))];

  const filtered = facturas.filter(f =>
    (filtroEstado === 'Todos' || labelDe(f) === filtroEstado) &&
    (!busqueda.trim() ||
      f.id.toLowerCase().includes(busqueda.toLowerCase()) ||
      (f.suministrador || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (f.contrato || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (f.contratante || '').toLowerCase().includes(busqueda.toLowerCase()) ||
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

  const aprobadas = facturas.filter(f => f.estado === INV.aprobada).length;
  const pagadas   = facturas.filter(f => f.estado === INV.pagada).length;
  const totalMonto = facturas.reduce((a, f) => a + f.monto, 0);

  const animTotal    = useCountUp(facturas.length, 900,  100);
  const animAprobadas= useCountUp(aprobadas,       900,  200);
  const animPagadas  = useCountUp(pagadas,         900,  300);
  const animMonto    = useCountUp(totalMonto,      1500, 400);

  const { visibleItems: paged, hasMore, loading, sentinelRef } =
    useInfiniteScroll(sorted, { pageSize: 10, delay: 0, resetKey: `${busqueda}|${filtroEstado}|${sort.key}|${sort.dir}|${groupBy}` });

  return (
    <AppShell active="provFacturas" role="proveedor" title="Mis Facturas" sub="Facturas de suministradores y comprobantes de pago (core bancario / Cheque de Venta)" back>
      <div className="fade-in space-y-5">

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { lbl: 'Total facturas',      val: String(animTotal) },
            { lbl: 'Aprobadas (en pago)', val: String(animAprobadas) },
            { lbl: 'Pagadas',             val: String(animPagadas) },
            { lbl: 'Monto total',         val: `${fmt(animMonto)} XAF` },
          ].map(({ lbl, val }) => (
            <StatCard key={lbl} label={lbl} value={val} tone="gradient" />
          ))}
        </div>

        {/* Título + buscador + estado */}
        <SectionHeader
            icon={Receipt} iconBg="#FFF3E0" iconColor="#EF7A2C"
            title="Facturas de Suministradores"
            action={
              <Button variant="primary" className="w-full sm:w-auto"
                onClick={() => setFacModal({ ...INIT_CT_EMPTY, open: true, fechaVencimiento: defaultVencimiento() })}>
                Nueva Factura
              </Button>
            }
          />
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4" />
              <input
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar factura, suministrador, contrato…"
                className="h-8 w-full pl-8 pr-3 text-[12px] rounded-[8px] border-2 border-orange bg-white placeholder-text-4 focus:outline-none focus:border-orange transition"
              />
            </div>
            <div className="relative flex items-center shrink-0">
              <ListFilter className="absolute left-2.5 w-3.5 h-3.5 pointer-events-none shrink-0 text-orange" />
              <select
                value={filtroEstado}
                onChange={e => setFiltroEstado(e.target.value)}
                className="h-8 pl-8 pr-7 text-[12px] font-medium rounded-[8px] border-2 border-orange bg-white text-text-1 focus:outline-none transition cursor-pointer appearance-none w-full sm:w-auto"
                style={{ backgroundImage: SELECT_ARROW, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
              >
                {ESTADOS.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>

          {/* Tabla de facturas */}
          <div className="bg-white rounded-[14px] border border-border overflow-x-auto">
            {/* Header */}
            <div className="min-w-[1020px] grid [grid-template-columns:1.2fr_1.4fr_0.9fr_1fr_1.4fr_1.1fr_0.9fr_1.4fr_1fr] bg-page-bg px-4 py-2.5 border-b border-border gap-3">
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
                Suministrador {groupIcon('empresa')}
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

            {/* Rows */}
            {paged.flatMap((f, i) => {
              const gVal = groupBy === 'contrato' ? (f.contrato || '—')
                         : groupBy === 'empresa'  ? (f.suministrador ?? '—')
                         : null;
              const prevGVal = i === 0 ? null
                : groupBy === 'contrato' ? (paged[i-1].contrato || '—')
                : groupBy === 'empresa'  ? (paged[i-1].suministrador ?? '—')
                : null;
              const isNewGroup = gVal !== null && (i === 0 || gVal !== prevGVal);
              const groupSep = isNewGroup ? [
                <div key={`grp-${i}`} className="min-w-[1020px] px-4 py-1.5 bg-orange-tint/20 border-b border-orange/20">
                  <span className="text-[11px] font-bold text-orange">{gVal}</span>
                </div>
              ] : [];
              const pago = pagoDe(f.id);
              const rowDiv = (
                <div
                  key={f.id}
                  onClick={() => setDetalle(f)}
                  className="min-w-[1020px] grid [grid-template-columns:1.2fr_1.4fr_0.9fr_1fr_1.4fr_1.1fr_0.9fr_1.4fr_1fr] px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-all duration-150 hover:scale-[1.01] hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:z-10 relative bg-white items-center gap-3"
                >
                  {/* 1. Contrato */}
                  <div className="text-[13px] font-bold text-text-1">{f.contrato || '—'}</div>
                  {/* 2. Cod. Factura */}
                  <div className="text-[12px] font-mono font-bold text-text-2">{f.id}</div>
                  {/* 3. Fecha */}
                  <div className="text-[11px] text-text-4">{f.fecha || '—'}</div>
                  {/* 4. Suministrador */}
                  <div className="text-[12px] font-semibold text-text-2 truncate text-center">
                    {f.suministrador ?? '—'}
                  </div>
                  {/* 5. Concepto */}
                  <div className="text-[11px] text-text-4 truncate text-center">{f.concepto || '—'}</div>
                  {/* 6. Monto */}
                  <div className="text-[13px] font-extrabold text-text-1 text-right whitespace-nowrap">
                    {fmt(f.monto)} XAF
                  </div>
                  {/* 7. Pagado/% */}
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
                  {/* 8. Estado */}
                  <div className="flex justify-center flex-wrap gap-1">
                    <InvoiceStatusBadge estado={f.estado} noDot />
                    {pago && (
                      <Badge variant={pago.metodo === 'cheque' ? 'yellow' : 'orange'}>
                        {pago.metodo === 'cheque' ? <FileText className="w-3 h-3 inline mr-0.5" /> : <Banknote className="w-3 h-3 inline mr-0.5" />}
                        {pago.metodo === 'cheque' ? pago.cheque : 'Transf.'}
                      </Badge>
                    )}
                  </div>
                  {/* 9. Acciones */}
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={e => { e.stopPropagation(); setDetalle(f); }}
                      className="p-1.5 rounded-[8px] transition text-text-4 hover:text-orange cursor-pointer shrink-0"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <span className="w-6 h-6 flex items-center justify-center shrink-0">
                      <RequerimientoBadge factura={f} variant="inline" cta={{ label: 'Refacturar', onClick: () => abrirRefactura(f) }} />
                    </span>
                  </div>
                </div>
              );
              return [...groupSep, rowDiv];
            })}

            {filtered.length === 0 && (
              <div className="min-w-[1020px] px-4 py-10 text-center text-[13px] text-text-4">
                No hay facturas con los filtros aplicados.
              </div>
            )}
            <InfiniteScrollSentinel sentinelRef={sentinelRef} loading={loading} hasMore={hasMore} />
          </div>

      </div>

      {/* ── Modal: Nueva Factura al Contratante ── */}
      {facModal.open && (
        <FacturaContratanteModal
          modal={facModal}
          onChange={p => setFacModal(prev => ({ ...prev, ...p }))}
          onSave={handleGuardar}
          onCancel={() => setFacModal(INIT_CT_EMPTY)}
        />
      )}

      {/* ── Modal: Detalle de factura ── */}
      {detalle && (() => {
        const viva = facturaService.obtener(detalle.id) ?? detalle;
        return (
          <InvoiceDetailModal
            factura={viva}
            onClose={() => setDetalle(null)}
            footer={
              <>
                <Button variant="ghost" size="sm" onClick={() => setDetalle(null)}>Cerrar</Button>
                <div className="flex items-center gap-2">
                  {pagoDe(viva.id) && (
                    <div className="flex items-center gap-2">
                      <Badge variant={pagoDe(viva.id).metodo === 'cheque' ? 'yellow' : 'orange'}>
                        {pagoDe(viva.id).metodo === 'cheque' ? pagoDe(viva.id).cheque : 'Transferencia core'}
                      </Badge>
                    </div>
                  )}
                </div>
              </>
            }
          >
            {viva.estado === INV.aprobada && (
              <div className="rounded-[12px] p-4 border border-border" style={{ background: '#F8F7F5' }}>
                <div className="text-[12px] font-semibold text-text-1 mb-1">Próximo paso</div>
                <div className="text-[12px] text-text-4 leading-relaxed">
                  El Banco Fondeador ejecutará la transferencia a tu cuenta, o emitirá un <b>Cheque de Venta</b> si no
                  tenés cuenta bancaria registrada. Verás el comprobante aquí en cuanto esté disponible.
                </div>
              </div>
            )}
          </InvoiceDetailModal>
        );
      })()}

    </AppShell>
  );
}