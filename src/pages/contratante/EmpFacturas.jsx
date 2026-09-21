import { useState } from 'react';
import {
  CheckCircle, Banknote, Send, ShieldCheck, Check, X, ChevronDown, Search, ListFilter,
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import { StatCard } from '../../components/common/StatCard';
import InfiniteScrollSentinel from '../../components/common/InfiniteScrollSentinel';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import InvoiceDetailModal from '../../components/invoices/InvoiceDetailModal';
import FondeadorOtpModal from '../../components/invoices/FondeadorOtpModal';
import RequerimientoBadge from '../../components/invoices/RequerimientoBadge';
import RequerirButton from '../../components/invoices/RequerirButton';
import AprobarButton from '../../components/invoices/AprobarButton';
import { SELECT_ARROW } from '../../components/ui/selectArrow';
import { facturaService } from '../../services/factura.service';
import { INV, estadoLabel, estadoBadge } from '../../lib/invoiceStates';

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
  const [, setTick]                     = useState(0);
  const bump = () => setTick(t => t + 1);

  const facturas = facturaService.listarPorRol('contratante');
  const facturasVivas = facturas.map(f => ({ ...f }));

  const ESTADOS = ['Todos', ...Array.from(new Set(facturasVivas.map(labelDe)))];

  const filtered = facturasVivas.filter(f =>
    (filtroEstado === 'Todos' || labelDe(f) === filtroEstado) &&
    (!busqueda.trim() ||
      f.id.toLowerCase().includes(busqueda.toLowerCase()) ||
      (f.pyme || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (f.contrato || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (f.concepto || '').toLowerCase().includes(busqueda.toLowerCase()))
  );

  const pendientes  = facturasVivas.filter(f => f.estado === INV.enviada || f.estado === INV.enEvaluacion).length;
  const conOtp      = facturasVivas.filter(f => f.estado === INV.otpEnviada).length;
  const totalMonto  = facturasVivas.reduce((a, f) => a + f.monto, 0);

  const { visibleItems: pagedFacturas, hasMore, loading, sentinelRef } =
    useInfiniteScroll(filtered, { pageSize: 10, delay: 0, resetKey: `${busqueda}|${filtroEstado}` });

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
    <AppShell active="empFacturas" role="contratante" title="Mis Facturas" sub="Facturas emitidas por PYMEs contratadas — evalúa y aprueba el pago" back>
      <div className="fade-in space-y-5">

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { lbl: 'Total facturas',     val: String(facturasVivas.length) },
            { lbl: 'Pendientes validar', val: String(pendientes) },
            { lbl: 'OTP por confirmar',  val: String(conOtp) },
            { lbl: 'Monto total',        val: `${new Intl.NumberFormat('de-DE').format(totalMonto)} XAF` },
          ].map(({ lbl, val }) => (
            <StatCard key={lbl} label={lbl} value={val} tone="gradient" />
          ))}
        </div>

        {/* Filtros + Cards */}
        {/* Título + buscador + estado */}
        <SectionHeader
            title="Facturas de PYMEs"
          />
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4" />
              <input
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar factura, PYME, contrato…"
                className="h-9 w-full pl-8 pr-3 text-[12px] rounded-[8px] border-2 border-orange bg-white placeholder-text-4 focus:outline-none focus:border-orange transition"
              />
            </div>
            <div className="relative flex items-center shrink-0">
              <ListFilter className="absolute left-2.5 w-3.5 h-3.5 pointer-events-none shrink-0 text-orange" />
              <select
                value={filtroEstado}
                onChange={e => setFiltroEstado(e.target.value)}
                className="h-9 pl-8 pr-7 text-[12px] font-medium rounded-[8px] border-2 border-orange bg-white text-text-1 focus:outline-none transition cursor-pointer appearance-none w-full sm:w-auto"
                style={{ backgroundImage: SELECT_ARROW, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
              >
                {ESTADOS.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>

          {/* Cards de facturas */}
          <div className="rounded-[14px] pt-2 pb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-7">
          {pagedFacturas.map((f, idx) => {
            const hasAction = !!accion(f);
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
                  <Badge variant={estadoBadge(f.estado)}>
                    {estadoLabel(f.estado)}
                  </Badge>
                  <RequerimientoBadge factura={f} />
                </div>

                <div>
                  <p className="text-[12px] font-semibold text-text-1 leading-snug">{f.pyme}</p>
                  <p className="text-[10px] font-mono" style={{ color: '#A9A6A1' }}>{f.contrato}</p>
                </div>

                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-text-4 mb-0.5">Monto</div>
                  <div className="text-[17px] font-extrabold text-text-1 leading-tight">{new Intl.NumberFormat('de-DE').format(f.monto)} XAF</div>
                </div>

                <div className="mt-auto pt-1 flex items-center justify-between">
                  {hasAction ? (
                    <span className="text-[9px] font-semibold flex items-center gap-1" style={{ color: '#E8A000' }}>
                      <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0" style={{ background: '#E8A000' }} />
                      Acción requerida
                    </span>
                  ) : <span />}
                  <div className="flex items-center gap-0.5 shrink-0">
                    {f.estado === INV.enviada && (
                      <AprobarButton onClick={() => setEvaluando(f)} />
                    )}
                    <RequerirButton factura={{ id: f.id }} emisor="La Contratante" onEnviar={(msg) => { facturaService.enviarRequerimiento(f.id, { mensaje: msg, emisor: 'La Contratante' }); bump(); }} />
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
          {filtered.length === 0 && (
            <div className="col-span-full text-[13px] text-text-4 text-center py-10">No hay facturas con los filtros aplicados.</div>
          )}
          <InfiniteScrollSentinel sentinelRef={sentinelRef} loading={loading} hasMore={hasMore} />
          </div>
        </div>

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
              <span className="text-[16px] font-extrabold text-green-text">
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
              { id: 'aprobar', lbl: 'Aprobar factura', sub: esInverso ? 'La PYME queda lista para el IPI.' : 'Pago directo a la PYME.' },
              { id: 'correcciones', lbl: 'Devolver con correcciones', sub: 'Regresa a la PYME para corregir y reenviar.' },
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