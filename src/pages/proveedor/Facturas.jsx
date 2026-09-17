import { useState } from 'react';
import {
  ChevronRight, FileText, Banknote, ScrollText,
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import { StatCard } from '../../components/common/StatCard';
import InfiniteScrollSentinel from '../../components/common/InfiniteScrollSentinel';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import InvoiceDetailModal from '../../components/invoices/InvoiceDetailModal';
import InvoiceStatusBadge from '../../components/invoices/InvoiceStatusBadge';
import { facturaService } from '../../services/factura.service';
import { INV } from '../../lib/invoiceStates';

const FILTROS = ['Todas', 'Aprobadas', 'En pago', 'Pagadas'];

// ── MIS FACTURAS (portal Proveedor) ───────────────────────────────────────────
// Fase 2 del BPMN: el Proveedor recibe facturas de sus suministradores; el
// Banco Fondeador (core) paga por transferencia, o emite Cheque de Venta para
// proveedores sin cuenta bancaria. Los comprobantes se consultan aquí.
export default function ProvFacturas() {
  const [filtro, setFiltro]     = useState('Todas');
  const [detalle, setDetalle]   = useState(null);

  const facturas   = facturaService.listarPorRol('proveedor');
  const pagos      = facturaService.listarPagos();
  const fmt        = v => new Intl.NumberFormat('de-DE').format(v ?? 0);

  const pagoDe = (id) => pagos.find(p => p.facturaId === id);

  const filtered = filtro === 'Todas'    ? facturas
    : filtro === 'Aprobadas'             ? facturas.filter(f => f.estado === INV.aprobada)
    : filtro === 'En pago'               ? facturas.filter(f => [INV.conRequerimientos, INV.ordenFondeador, INV.fondeado, INV.otpEnviada, INV.otpVerificada].includes(f.estado))
    : facturas.filter(f => f.estado === INV.pagada);

  const aprobadas = facturas.filter(f => f.estado === INV.aprobada).length;
  const pagadas   = facturas.filter(f => f.estado === INV.pagada).length;
  const totalMonto = facturas.reduce((a, f) => a + f.monto, 0);

  const { visibleItems: paged, hasMore, loading, sentinelRef } =
    useInfiniteScroll(filtered, { pageSize: 10, delay: 0, resetKey: filtro });

  const accion = (f) =>
    f.estado === INV.aprobada ? { lbl: 'Ver condiciones', Icon: ScrollText, handler: () => setDetalle(f) } : null;

  return (
    <AppShell active="provFacturas" role="proveedor" title="Mis Facturas" sub="Facturas de suministradores y comprobantes de pago (core bancario / Cheque de Venta)" back>
      <div className="fade-in space-y-5">

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { lbl: 'Total facturas', val: String(facturas.length) },
            { lbl: 'Aprobadas (en pago)', val: String(aprobadas) },
            { lbl: 'Pagadas', val: String(pagadas) },
            { lbl: 'Monto total', val: `${fmt(totalMonto)} XAF` },
          ].map(({ lbl, val }) => (
            <StatCard key={lbl} label={lbl} value={val} tone="gradient" />
          ))}
        </div>

        {/* Filtros */}
        <div className="overflow-x-auto max-w-full">
          <div className="flex gap-1 bg-page-bg p-1 rounded-xl w-fit min-w-max">
            {FILTROS.map(f => (
              <button key={f} onClick={() => setFiltro(f)}
                className={`px-3 py-1.5 rounded-[8px] text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  filtro === f ? 'bg-white shadow-sm text-text-1' : 'text-text-4 hover:text-text-2'
                }`}>{f}
              </button>
            ))}
          </div>
        </div>

        {/* Cards de facturas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paged.map((f, idx) => {
            const pago = pagoDe(f.id);
            const a = accion(f);
            return (
              <div
                key={f.id}
                onClick={() => setDetalle(f)}
                className="bg-white rounded-[16px] p-5 cursor-pointer flex flex-col gap-4 transition-all duration-200 hover:scale-[1.015] shadow-[0_3px_10px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_32px_rgba(224,32,28,0.18),0_4px_14px_rgba(239,122,44,0.12)] card-enter"
                style={{ animationDelay: `${(idx % 8) * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[13px] font-mono font-bold text-text-1">{f.id}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: '#A9A6A1' }}>{f.fecha}</p>
                  </div>
                  <InvoiceStatusBadge estado={f.estado} />
                </div>

                <div>
                  <p className="text-[12px] font-semibold text-text-1 leading-snug">{f.suministrador}</p>
                  <p className="text-[10px] font-mono" style={{ color: '#A9A6A1' }}>{f.contrato} · {f.contratante}</p>
                </div>

                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-text-4 mb-0.5">Monto</div>
                  <div className="text-[17px] font-extrabold text-text-1 leading-tight">{fmt(f.monto)} XAF</div>
                </div>

                {pago && (
                  <div className="flex items-center gap-2 p-2.5 rounded-[10px]" style={{ background: pago.metodo === 'cheque' ? '#FDF6E8' : '#E3F4EA' }}>
                    {pago.metodo === 'cheque' ? <FileText className="w-3.5 h-3.5 text-yellow-text shrink-0" /> : <Banknote className="w-3.5 h-3.5 text-green-text shrink-0" />}
                    <Badge variant={pago.metodo === 'cheque' ? 'yellow' : 'green'}>
                      {pago.metodo === 'cheque' ? pago.cheque : `Transferencia · ${pago.cuenta ?? 'core bancario'}`}
                    </Badge>
                  </div>
                )}

                <div className="mt-auto pt-1 flex items-center justify-between">
                  {a ? (
                    <span className="text-[9px] font-semibold flex items-center gap-1" style={{ color: '#E8A000' }}>
                      <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0" style={{ background: '#E8A000' }} />
                      En proceso de pago
                    </span>
                  ) : <span />}
                  <button
                    onClick={e => { e.stopPropagation(); setDetalle(f); }}
                    className="text-[11px] font-semibold flex items-center gap-0.5 hover:opacity-75 cursor-pointer transition text-orange"
                  >
                    Ver detalle <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
          <InfiniteScrollSentinel sentinelRef={sentinelRef} loading={loading} hasMore={hasMore} />
        </div>

      </div>

      {/* ── Modal: Detalle de factura ── */}
      {detalle && (
        <InvoiceDetailModal
          factura={facturaService.obtener(detalle.id) ?? detalle}
          onClose={() => setDetalle(null)}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setDetalle(null)}>Cerrar</Button>
              {pagoDe(detalle.id) && (
                <div className="flex items-center gap-2">
                  <Badge variant={pagoDe(detalle.id).metodo === 'cheque' ? 'yellow' : 'green'}>
                    {pagoDe(detalle.id).metodo === 'cheque' ? pagoDe(detalle.id).cheque : 'Transferencia core'}
                  </Badge>
                </div>
              )}
            </>
          }
        >
          {detalle.estado === INV.aprobada && (
            <div className="rounded-[12px] p-4 border border-border" style={{ background: '#F8F7F5' }}>
              <div className="text-[12px] font-semibold text-text-1 mb-1">Próximo paso</div>
              <div className="text-[12px] text-text-4 leading-relaxed">
                El Banco Fondeador ejecutará la transferencia a tu cuenta, o emitirá un <b>Cheque de Venta</b> si no
                tenés cuenta bancaria registrada. Verás el comprobante aquí en cuanto esté disponible.
              </div>
            </div>
          )}
        </InvoiceDetailModal>
      )}

    </AppShell>
  );
}