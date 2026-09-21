import { useState } from 'react';
import {
  Building2, Upload, Paperclip, Search, Send, BadgeCheck, Check, Wallet as WalletIcon, X, ChevronDown, ListFilter,
} from 'lucide-react';
import { localDb } from '../../lib/localDb';
import AppShell from '../../components/layout/AppShell';
import { useApp } from '../../state/AppContext';
import InfiniteScrollSentinel from '../../components/common/InfiniteScrollSentinel';
import { StatCard } from '../../components/common/StatCard';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import InfoRow from '../../components/ui/InfoRow';
import FormGroup, { Input, Select, Textarea } from '../../components/ui/FormGroup';
import InvoiceDetailModal from '../../components/invoices/InvoiceDetailModal';
import RequerimientoBadge from '../../components/invoices/RequerimientoBadge';
import RequerirButton from '../../components/invoices/RequerirButton';
import AprobarButton from '../../components/invoices/AprobarButton';
import FacturaContratanteModal from '../../components/invoices/FacturaContratanteModal';
import { formatXaf, defaultVencimiento } from '../../components/invoices/facturaUtils';
import { SELECT_ARROW } from '../../components/ui/selectArrow';
import { facturaService } from '../../services/factura.service';
import { contratoService } from '../../services/contrato.service';
import { INV, estadoLabel, estadoBadge } from '../../lib/invoiceStates';

const BADGE_LABEL = {
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

const INIT_CT_EMPTY = { open: false, editId: null, contratoId: '', monto: '', concepto: '', fechaVencimiento: '', documento: null };

const initialProviders = [
  { id: 'p1', razonSocial: 'SAP',     sector: 'Materiales' },
  { id: 'p2', razonSocial: 'APEX', sector: 'Transporte' },
  { id: 'p3', razonSocial: 'APEX Tech',   sector: 'TecnologÃ­a' },
];

// Facturas de proveedores (control interno) â€” registro local independiente del
// BPMN de facturaciÃ³n al contratante (Fase 2 se tramita vÃ­a billetera/pagos).
const initialInvoicesPr = [
  { id: 'PR-2026-0231', tipo: 'proveedor', contrato: 'CT-2026-0041', proveedorId: 'p1', proveedorNombre: 'SAP',
    monto: 8_000_000, estado: 'Pendiente', concepto: 'Suministro de cemento y añadidos al Lote 7',
    fecha: '10/07/2026', fechaVencimiento: '10/08/2026', documento: null },
];

const hoy = () => new Date().toLocaleDateString('es-GQ', { day: '2-digit', month: '2-digit', year: 'numeric' });

const prEstadoStyle = (estado) =>
  estado === 'Pagada'   ? { background: '#E3F4EA', color: '#2E7D5B' } :
  estado === 'Aprobada' ? { background: '#E3F4EA', color: '#2E7D5B' } :
  estado === 'Vencida'  ? { background: '#FDEEEB', color: '#B8352A' } :
  { background: '#FDF6E8', color: '#C68A1D' };

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

export default function EpFacturacion() {
  const { go }                        = useApp();
  const [vista, setVista]             = useState('contratante');
  const [facturas, setFacturas]       = useState(() => facturaService.listarPorRol('empresa-pequena'));
  const [invoicesPr, setInvoicesPr]   = useState(() => localDb.get('ep_invoices_pr', initialInvoicesPr, 1));
  const [providers]                  = useState(initialProviders);
  const [ctModal, setCtModal]        = useState(INIT_CT_EMPTY);
  const [prModal, setPrModal]        = useState(INIT_CT_EMPTY);
  const [detalle, setDetalle]        = useState(null);
  const [prDetalle, setPrDetalle]    = useState(null);
  const [confirmEnvio, setConfirmEnvio] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroEstadoPr, setFiltroEstadoPr] = useState('Todos');
  const [searchCT, setSearchCT]         = useState('');
  const [searchPr, setSearchPr]         = useState('');

  const bump = () => setFacturas(facturaService.listarPorRol('empresa-pequena'));

  const contratanteInvoices = facturas;
  const proveedorInvoices   = invoicesPr;

  const labelDe    = (f) => BADGE_LABEL[f.estado] ?? f.estado ?? 'Emitida';
  const ESTADOS    = ['Todos', ...Array.from(new Set(contratanteInvoices.map(labelDe)))];
  const ESTADOS_PR = ['Todos', ...Array.from(new Set(proveedorInvoices.map(inv => inv.estado)))];

  const filteredCT = contratanteInvoices.filter(f =>
    (filtroEstado === 'Todos' || labelDe(f) === filtroEstado) &&
    (!searchCT.trim() ||
      f.id.toLowerCase().includes(searchCT.toLowerCase()) ||
      (f.contratante || '').toLowerCase().includes(searchCT.toLowerCase()) ||
      (f.contrato || '').toLowerCase().includes(searchCT.toLowerCase()) ||
      (f.concepto || '').toLowerCase().includes(searchCT.toLowerCase()) ||
      (f.pyme || '').toLowerCase().includes(searchCT.toLowerCase()))
  );

  const filteredPr = proveedorInvoices.filter(inv =>
    (filtroEstadoPr === 'Todos' || inv.estado === filtroEstadoPr) &&
    (!searchPr.trim() ||
      inv.id.toLowerCase().includes(searchPr.toLowerCase()) ||
      (inv.concepto || '').toLowerCase().includes(searchPr.toLowerCase()) ||
      (inv.proveedorNombre || '').toLowerCase().includes(searchPr.toLowerCase()))
  );

  const { visibleItems: pagedCT, hasMore: hasMoreCT, loading: loadingCT, sentinelRef: sentinelCTRef } =
    useInfiniteScroll(filteredCT, { pageSize: 10, delay: 0, resetKey: `${searchCT}|${filtroEstado}` });
  const { visibleItems: pagedPR, hasMore: hasMorePR, loading: loadingPR, sentinelRef: sentinelPRRef } =
    useInfiniteScroll(filteredPr, { pageSize: 10, delay: 0, resetKey: `${searchPr}|${filtroEstadoPr}` });

  // â”€â”€ AcciÃ³n segÃºn el estado del BPMN (lado PYME) â”€â”€
  const ctAction = (f) => {
    switch (f.estado) {
      case INV.creada:
        return { lbl: 'Enviar a la Contratante', Icon: Send, handler: () => setConfirmEnvio(f) };
      case INV.conRequerimientos:
        return (f.pymeNotifico)
          ? null
          : { lbl: 'Notificar a la Contratante', Icon: BadgeCheck, handler: () => { facturaService.notificarContratante(f.id); bump(); } };
      case INV.billetera:
        return { lbl: 'Ver billetera', Icon: WalletIcon, handler: () => { setDetalle(null); go('epBilletera'); } };
      default:
        return null;
    }
  };

  // En "Facturas al Contratante" la PYME ni aprueba ni envía requerimientos:
  // esos acciones solo existen en "Facturas de Proveedores" (aprobarlas genera
  // la factura al Contratante). La define en esa vista con sus botones propios.

  const enviarReqPr = (inv, mensaje) => {
    const keep = localDb.get('ep_invoices_pr', initialInvoicesPr, 1);
    const next = keep.map(x => x.id === inv.id
      ? { ...x, requerimientos: [{ mensaje, emisor: 'La PYME', fecha: hoy() }, ...(x.requerimientos ?? [])] }
      : x);
    localDb.set('ep_invoices_pr', next);
    setInvoicesPr(next);
  };

  // â”€â”€ CT handlers (mediante factura.service sobre localDb) â”€â”€
  const handleSaveCt = () => {
    const monto = Number(ctModal.monto.replace?.(/[^0-9]/g, '') ?? ctModal.monto) || 0;
    if (monto <= 0 || !ctModal.concepto.trim() || !ctModal.contratoId) return;
    const contrato = contratoService.listarFactoring().find(c => c.id === ctModal.contratoId);
    if (contrato?.montoMax && monto > contrato.montoMax) return;
    if (ctModal.editId) {
      facturaService.corregirYReenviar(ctModal.editId, {
        monto, concepto: ctModal.concepto, fechaVencimiento: ctModal.fechaVencimiento,
        documentos: ctModal.documento ? [{ name: ctModal.documento.name, url: ctModal.documento.url }] : undefined,
      });
    } else {
      facturaService.crear({
        contrato: ctModal.contratoId,
        contratante: contrato?.contratanteNombre ?? 'Chevron',
        tipoFactoring: contrato?.tipoFactoring ?? 'inverso',
        pyme: 'Tradex',
        monto, concepto: ctModal.concepto, fechaVencimiento: ctModal.fechaVencimiento,
        documentos: ctModal.documento ? [{ name: ctModal.documento.name, url: ctModal.documento.url }] : [],
      });
    }
    setCtModal(INIT_CT_EMPTY);
    bump();
  };

  const handleSavePr = () => {
    const monto = Number(prModal.monto.replace?.(/[^0-9]/g, '') ?? prModal.monto) || 0;
    if (monto <= 0 || !prModal.proveedorId || !prModal.contratoId) return;
    const prov  = providers.find(p => p.id === prModal.proveedorId);
    const today = prModal.fecha || new Date().toLocaleDateString('es-GQ', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const keep = localDb.get('ep_invoices_pr', initialInvoicesPr, 1);
    if (prModal.editId) {
      localDb.set('ep_invoices_pr', keep.map(inv => inv.id === prModal.editId
        ? { ...inv, monto, concepto: prModal.concepto, proveedorId: prModal.proveedorId, proveedorNombre: prov?.razonSocial || '', fecha: today, fechaVencimiento: prModal.fechaVencimiento, documento: prModal.documento }
        : inv));
    } else {
      const max = keep.reduce((m, inv) => Math.max(m, parseInt(inv.id.replace('PR-2026-', '')) || 0), 0);
      localDb.set('ep_invoices_pr', [...keep, {
        id: `PR-2026-${String(max + 1).padStart(4, '0')}`, tipo: 'proveedor', contrato: prModal.contratoId,
        monto, estado: 'Pendiente', concepto: prModal.concepto,
        proveedorId: prModal.proveedorId, proveedorNombre: prov?.razonSocial || '', fecha: today,
        fechaVencimiento: prModal.fechaVencimiento, documento: prModal.documento,
      }]);
    }
    setPrModal(INIT_CT_EMPTY);
    setFacturas(facturaService.listarPorRol('empresa-pequena'));
    setInvoicesPr(localDb.get('ep_invoices_pr', initialInvoicesPr, 1));
  };

  // ── Aprobar factura de proveedor ──
  // Marca la factura del proveedor como aprobada y emite la factura nueva al
  // Contratante (origen 'contratante'): aparece en "Facturas al Contratante"
  // de la PYME y como factura nueva aprobada en el portal del Contratante.
  const aprobarPr = (inv) => {
    const keep = localDb.get('ep_invoices_pr', initialInvoicesPr, 1);
    const invivo = keep.find(x => x.id === inv.id);
    if (!invivo || invivo.estado === 'Aprobada') return;
    facturaService.aprobarFacturaDeProveedor(invivo);
    const next = keep.map(x => x.id === inv.id ? { ...x, estado: 'Aprobada' } : x);
    localDb.set('ep_invoices_pr', next);
    setInvoicesPr(next);
    setFacturas(facturaService.listarPorRol('empresa-pequena'));
  };

  return (
    <AppShell active="epFacturacion" role="empresa-pequena" title="Mis Facturas" sub="Gestión de facturas de todos los contratos activos" back>
      <div className="fade-in space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total facturas', value: String(facturas.length) },
            { label: 'Al contratante', value: String(contratanteInvoices.length) },
            { label: 'En billetera',   value: String(facturas.filter(f => f.estado === INV.billetera).length) },
            { label: 'Pagadas',        value: String(facturas.filter(f => f.estado === INV.pagada).length) },
          ].map(({ label, value }) => (
            <StatCard key={label} label={label} value={value} tone="gradient" />
          ))}
        </div>

        {/* Mis facturas: Contratante / Proveedores */}
        <SectionHeader icon={Building2} iconBg="#FFF3E0" iconColor="#EF7A2C"
            title={vista === 'contratante' ? 'Facturas al Contratante' : 'Facturas de Proveedores'}
            action={
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                <div className="relative flex items-center shrink-0">
                  <Building2 className="absolute left-2.5 w-3.5 h-3.5 pointer-events-none shrink-0 text-orange" />
                  <select
                    value={vista}
                    onChange={e => setVista(e.target.value)}
                    className="h-8 pl-8 pr-7 text-[12px] font-medium rounded-[8px] border-2 border-orange bg-white text-text-1 focus:outline-none transition cursor-pointer appearance-none w-full sm:w-auto"
                    style={{ backgroundImage: SELECT_ARROW, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
                  >
                    <option value="contratante">Facturas al contratante</option>
                    <option value="proveedor">Facturas de proveedores</option>
                  </select>
                </div>
                <Button variant="primary" className="w-full sm:w-auto order-first sm:order-last"
                  onClick={() => vista === 'contratante'
                    ? setCtModal({ ...INIT_CT_EMPTY, open: true, fechaVencimiento: defaultVencimiento() })
                    : setPrModal({ ...INIT_CT_EMPTY, open: true })}>
                  {vista === 'contratante' ? 'Nueva Factura' : 'Importar Factura'}
                </Button>
              </div>
            }
          />

          {/* Filtros: bÃºsqueda + estado */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pl-5">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4" />
              <input
                value={vista === 'contratante' ? searchCT : searchPr}
                onChange={e => vista === 'contratante' ? setSearchCT(e.target.value) : setSearchPr(e.target.value)}
                placeholder={vista === 'contratante' ? 'Buscar factura o contrato, ' : 'Buscar por , proveedor o concepto'}
                className="h-8 w-full pl-8 pr-3 text-[12px] rounded-[8px] border-2 border-orange bg-white placeholder-text-4 focus:outline-none focus:border-orange transition"
              />
            </div>
            <div className="relative flex items-center shrink-0">
              <ListFilter className="absolute left-2.5 w-3.5 h-3.5 pointer-events-none shrink-0 text-orange" />
              <select
                value={vista === 'contratante' ? filtroEstado : filtroEstadoPr}
                onChange={e => vista === 'contratante' ? setFiltroEstado(e.target.value) : setFiltroEstadoPr(e.target.value)}
                className="h-8 pl-8 pr-7 text-[12px] font-medium rounded-[8px] border-2 border-orange bg-white text-text-1 focus:outline-none transition cursor-pointer appearance-none w-full sm:w-auto"
                style={{ backgroundImage: SELECT_ARROW, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
              >
                {(vista === 'contratante' ? ESTADOS : ESTADOS_PR).map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>

          {/* Cards de facturas */}
          <div className="rounded-[14px] pt-2 pb-5">
          {vista === 'contratante' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-7">
              {pagedCT.map((f, idx) => {
                const accion = ctAction(f);
                const hasAction = !!accion;
                return (
                  <div
                    key={f.id}
                    onClick={() => { setDetalle(f); }}
                    className="relative bg-white rounded-[16px] p-5 cursor-pointer flex flex-col gap-4 transition-all duration-200 hover:scale-[1.015] shadow-[0_3px_10px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_32px_rgba(224,32,28,0.18),0_4px_14px_rgba(239,122,44,0.12)] card-enter"
                    style={{ animationDelay: `${(idx % 8) * 60}ms` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[13px] font-mono font-bold text-text-1">{f.id}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: '#A9A6A1' }}>{f.fecha}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant={estadoBadge(f.estado)}>{estadoLabel(f.estado)}</Badge>
                        <RequerimientoBadge factura={f} />
                      </div>
                    </div>

                    <div>
                      <p className="text-[12px] font-semibold text-text-1 leading-snug">{f.contratante}</p>
                      <p className="text-[10px] font-mono" style={{ color: '#A9A6A1' }}>{f.contrato}</p>
                      {f.documentos?.length > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-text-4 mt-1"><Paperclip className="w-3 h-3" /> Documento</span>
                      )}
                    </div>

                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-text-4 mb-0.5">Monto</div>
                      <div className="text-[17px] font-extrabold text-text-1 leading-tight">{formatXaf(f.monto)}</div>
                    </div>

                    <div className="mt-auto pt-1 flex items-center justify-between">
                      {hasAction ? (
                        <span className="text-[9px] font-semibold flex items-center gap-1" style={{ color: '#E8A000' }}>
                          <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0" style={{ background: '#E8A000' }} />
                          Acción requerida
                        </span>
                      ) : <span />}
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          onClick={e => { e.stopPropagation(); setDetalle(f); }}
                          className="text-[11px] font-semibold flex items-center gap-0.5 hover:opacity-75 cursor-pointer transition text-orange"
                        >
                          Ver detalle <ChevronDown className="w-3.5 h-3.5 rotate-[-90deg]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredCT.length === 0 && (
                <div className="col-span-full text-[13px] text-text-4 text-center py-10">No hay facturas en este estado.</div>
              )}
              <InfiniteScrollSentinel sentinelRef={sentinelCTRef} loading={loadingCT} hasMore={hasMoreCT} className="col-span-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-7">
              {pagedPR.map((inv, idx) => {
                const estilo = prEstadoStyle(inv.estado);
                return (
                  <div key={inv.id}
                       onClick={() => setPrDetalle(inv)}
                       className="relative bg-white rounded-[16px] p-5 cursor-pointer flex flex-col gap-4 transition-all duration-200 hover:scale-[1.015] shadow-[0_3px_10px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_32px_rgba(224,32,28,0.18),0_4px_14px_rgba(239,122,44,0.12)] card-enter"
                       style={{ animationDelay: `${(idx % 8) * 50}ms` }}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[13px] font-mono font-bold text-text-1">{inv.id}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: '#A9A6A1' }}>{inv.fecha}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={estilo}>{inv.estado}</span>
                        {inv.documento && (
                          <span className="flex items-center gap-0.5 text-[10px] text-text-4"><Paperclip className="w-3 h-3" /> Doc</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-[12px] font-semibold text-text-1 leading-snug">{inv.proveedorNombre}</p>
                      <p className="text-[10px] font-mono" style={{ color: '#A9A6A1' }}>{inv.contrato} Vence: {inv.fechaVencimiento}</p>
                      <p className="text-[11px] text-text-3 mt-1 truncate">{inv.concepto}</p>
                    </div>

                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-text-4 mb-0.5">Monto</div>
                      <div className="text-[17px] font-extrabold text-text-1 leading-tight">{formatXaf(inv.monto)}</div>
                    </div>

                    <div className="mt-auto pt-1 flex items-center justify-between">
                      {inv.estado === 'Pendiente' ? (
                        <span className="text-[9px] font-semibold flex items-center gap-1" style={{ color: '#E8A000' }}>
                          <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0" style={{ background: '#E8A000' }} />
                          Por aprobar
                        </span>
                      ) : <span />}
                      <div className="flex items-center gap-0.5 shrink-0">
                        {inv.estado === 'Pendiente' && (
                          <AprobarButton onClick={() => aprobarPr(inv)} />
                        )}
                        <RequerirButton factura={{ id: inv.id }} emisor="La PYME" onEnviar={(msg) => enviarReqPr(inv, msg)} />
                        <button onClick={e => { e.stopPropagation(); setPrDetalle(inv); }}
                          className="text-[11px] font-semibold flex items-center gap-0.5 hover:opacity-75 cursor-pointer transition text-orange">
                          Ver detalle <ChevronDown className="w-3.5 h-3.5 rotate-[-90deg]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {proveedorInvoices.length === 0 && (
                <div className="col-span-full text-[12px] text-text-4 py-6 text-center">No hay facturas de proveedores importadas.</div>
              )}
              <InfiniteScrollSentinel sentinelRef={sentinelPRRef} loading={loadingPR} hasMore={hasMorePR} className="col-span-full" />
            </div>
          )}
        </div>

      </div>

      {/* â”€â”€ Modal: Nueva / Editar factura al Contratante â”€â”€ */}
      {ctModal.open && (
        <FacturaContratanteModal
          modal={ctModal}
          onChange={p => setCtModal(prev => ({ ...prev, ...p }))}
          onSave={handleSaveCt}
          onCancel={() => setCtModal(INIT_CT_EMPTY)}
        />
      )}

      {/* -- Modal: Confirmar envio de factura -- */}

      {confirmEnvio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
             onClick={e => e.target === e.currentTarget && setConfirmEnvio(null)}>
          <div className="bona-gradient-shadow w-full max-w-md rounded-2xl p-[2px]">
            <div className="bg-white rounded-2xl p-8 relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setConfirmEnvio(null)} className="absolute top-4 right-4 p-2 hover:bg-page-bg rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5 text-text-3" />
              </button>
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #EF7A2C, #E0201C)' }}>
                  <Send className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-text-1 mb-1">Enviar factura</h2>
                <p className="text-sm text-text-3">{confirmEnvio.id} a {confirmEnvio.contratante}</p>
              </div>
              <div className="rounded-[14px] border border-border p-4 mb-6" style={{ background: '#F8F7F5' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#A9A6A1' }}>Monto</span>
                  <span className="text-[16px] font-extrabold text-green-text">
                    {formatXaf(confirmEnvio.monto)} <span className="text-[10px] font-semibold">XAF</span>
                  </span>
                </div>
              </div>
              <Button onClick={() => { facturaService.enviar(confirmEnvio.id); setConfirmEnvio(null); bump(); }} full className="h-[48px] mb-3">
                Confirmar enví­o
              </Button>
              <button onClick={() => setConfirmEnvio(null)} className="w-full text-sm text-center font-medium text-text-3 hover:text-text-1 transition-colors cursor-pointer">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ Modal: Detalle de factura â”€â”€ */}
      {detalle && (() => {
        const viva = facturaService.obtener(detalle.id) ?? detalle;
        const a = ctAction(viva);
        return (
          <InvoiceDetailModal
            factura={viva}
            onClose={() => setDetalle(null)}
            footer={
              <>
                <Button variant="ghost" size="sm" onClick={() => setDetalle(null)}>Cerrar</Button>
                <div className="flex items-center gap-2">
                  {a && (
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

      {/* â”€â”€ Modal: Importar / Editar factura de Proveedor â”€â”€ */}
      {prModal.open && (
        <Modal
          title={prModal.editId ? `Editar factura ${prModal.editId}` : 'Importar Factura de Proveedor'}
          onClose={() => setPrModal(INIT_CT_EMPTY)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setPrModal(INIT_CT_EMPTY)}>Cancelar</Button>
              <Button variant="primary" onClick={handleSavePr}>{prModal.editId ? 'Guardar cambios' : 'Importar factura'}</Button>
            </>
          }
          wide
        >
          <div className="space-y-4">
            <div className="text-[12px] text-text-4">Registra una factura recibida de un proveedor para control interno de pagos.</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Proveedor" required>
                <Select value={prModal.proveedorId} onChange={e => setPrModal({ ...prModal, proveedorId: e.target.value })}>
                  <option value="">Seleccionar proveedor</option>
                  {providers.map(p => <option key={p.id} value={p.id}>{p.razonSocial} · {p.sector}</option>)}
                </Select>
              </FormGroup>
              <FormGroup label="Monto (XAF)" required>
                <Input
                  type="text" inputMode="numeric" placeholder="Ej: 4,500,000"
                  value={prModal.monto}
                  onChange={e => setPrModal({ ...prModal, monto: e.target.value.replace(/[^0-9]/g, '') })}
                />
                {prModal.monto && <div className="text-[11px] text-text-4 mt-1">{formatXaf(prModal.monto)}</div>}
              </FormGroup>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Fecha de emisión">
                <Input type="text" placeholder="DD/MM/AAAA" value={prModal.fecha} onChange={e => setPrModal({ ...prModal, fecha: e.target.value })} />
              </FormGroup>
              <FormGroup label="Fecha de vencimiento">
                <Input type="text" placeholder="DD/MM/AAAA" value={prModal.fechaVencimiento} onChange={e => setPrModal({ ...prModal, fechaVencimiento: e.target.value })} />
              </FormGroup>
            </div>
            <FormGroup label="Concepto">
              <Textarea
                value={prModal.concepto}
                onChange={e => setPrModal({ ...prModal, concepto: e.target.value })}
                placeholder="Descripción del servicio o producto facturado"
              />
            </FormGroup>
            <div>
              <div className="text-[12px] font-medium text-text-3 mb-1.5">Adjuntar documento</div>
              {prModal.documento ? (
                <div className="flex items-center gap-2 bg-page-bg rounded-[8px] px-3 py-2 text-[12px] text-text-3 border border-border">
                  <Paperclip className="w-3.5 h-3.5 text-text-4 shrink-0" />
                  <span className="flex-1 truncate">{prModal.documento.name}</span>
                  <button onClick={() => setPrModal(p => ({ ...p, documento: null }))} className="text-text-4 hover:text-red-text text-[14px] leading-none">a—</button>
                </div>
              ) : (
                <label className="flex items-center gap-2 border border-dashed border-border rounded-[8px] px-3 py-2.5 text-[12px] text-text-4 cursor-pointer hover:border-orange/40 hover:bg-orange-tint transition">
                  <Upload className="w-3.5 h-3.5 shrink-0" />
                  Seleccionar archivo (PDF, imagen)
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) setPrModal(p => ({ ...p, documento: { name: file.name, url: URL.createObjectURL(file) } }));
                  }} />
                </label>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal: Detalle de factura de Proveedor ── */}
      {prDetalle && (() => {
        const inv = invoicesPr.find(x => x.id === prDetalle.id) ?? prDetalle;
        const estilo = prEstadoStyle(inv.estado);
        return (
          <Modal
            title={`Factura de Proveedor · ${inv.id}`}
            onClose={() => setPrDetalle(null)}
            footer={
              <>
                <Button variant="ghost" size="sm" onClick={() => setPrDetalle(null)}>Cerrar</Button>
                <div className="flex items-center gap-2">
                  <RequerirButton label="Poner requerimientos" factura={{ id: inv.id }} emisor="La PYME" onEnviar={(msg) => enviarReqPr(inv, msg)} />
                  {inv.estado === 'Pendiente' && (
                    <Button variant="success" size="sm" onClick={() => { aprobarPr(inv); setPrDetalle(null); }}>
                      <Check className="w-3.5 h-3.5 mr-1" /> Aprobar factura
                    </Button>
                  )}
                </div>
              </>
            }
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={estilo}>{inv.estado}</span>
                <span className="text-[12px]" style={{ color: '#A9A6A1' }}>{inv.fecha}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <InfoRow label="Proveedor" value={inv.proveedorNombre} />
                <InfoRow label="Contrato" value={inv.contrato} />
                <InfoRow label="Monto" value={formatXaf(inv.monto)} />
                <InfoRow label="Emisión" value={inv.fecha} />
                <InfoRow label="Vence" value={inv.fechaVencimiento ?? '—'} />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-1">Concepto</div>
                <p className="text-[13px] text-text-1 leading-relaxed">{inv.concepto || '—'}</p>
              </div>
              {inv.documento && (
                <div className="flex items-center gap-2.5 p-3 rounded-[10px] border border-border" style={{ color: '#A9A6A1' }}>
                  <Paperclip className="w-4 h-4 shrink-0" />
                  <span className="text-[12px]">{inv.documento.name}</span>
                </div>
              )}
              {inv.requerimientos && inv.requerimientos.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide">Requerimientos enviados</div>
                  {inv.requerimientos.map((r, i) => (
                    <div key={i} className="rounded-[12px] p-3 border" style={{ background: '#FDF6E8', borderColor: 'rgba(239,122,44,0.25)' }}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-orange">{r.emisor}</span>
                        <span className="text-[10px]" style={{ color: '#A9A6A1' }}>{r.fecha}</span>
                      </div>
                      <p className="text-[12px] text-text-1 leading-relaxed">{r.mensaje}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Modal>
        );
      })()}

    </AppShell>
  );
}
