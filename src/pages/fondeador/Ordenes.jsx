import { useState } from 'react';
import { Search, Zap, Eye, CheckCircle, ShieldCheck } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import InfoRow from '../../components/ui/InfoRow';
import InvoiceDetailModal from '../../components/invoices/InvoiceDetailModal';
import { facturaService } from '../../services/factura.service';
import { fmt } from '../empresa-pequena/epData';
import { BANCO, netoFactura, CONDICIONES_DEFAULT } from './fondeadorShared';

// ── ÓRDENES DE FONDEO (portal Banco Fondeador) ────────────────────────────────
// Bandeja de órdenes enviadas por las Contratantes (estado "Orden al Fondeador"):
// el banco confirma la transferencia a Bonafide y dispara el OTP a la Contratante
// (Fondeo Recibido → OTP Enviada).
export default function FondOrdenes() {
  const [busqueda, setBusqueda] = useState('');
  const [liquidando, setLiquidando] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [, setTick] = useState(0);
  const bump = () => setTick(t => t + 1);

  const ordenes = facturaService.bandejaOrdenes(BANCO);
  const q = busqueda.trim().toLowerCase();
  const filtradas = !q ? ordenes : ordenes.filter(f =>
    [f.id, f.ipi?.numero, f.pyme, f.contratante].some(v => (v ?? '').toLowerCase().includes(q))
  );

  const totalNeto = filtradas.reduce((a, f) => a + netoFactura(f), 0);

  const handleLiquidar = (f, opts) => {
    facturaService.liquidarFondeo(f.id, opts);
    setLiquidando(null);
    setDetalle(null);
    bump();
  };

  return (
    <AppShell
      active="fondOrdenes"
      role="fondeador"
      title="Órdenes de Fondeo"
      sub={`Órdenes de pago recibidas de las Contratantes para ${BANCO}`}
    >
      <div className="fade-in space-y-5">

        <div className="bg-white rounded-[14px] border border-border p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="bona-gradient-bg w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-[14px] font-bold text-text-1">Órdenes pendientes de liquidar</div>
                <div className="text-[11px] text-text-4">Confirmá la transferencia para acreditar los fondos a Bonafide.</div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-orange-dark whitespace-nowrap">{filtradas.length} pendientes</span>
          </div>

          {/* Buscador */}
          <div className="relative mb-4">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4" />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por Nº, IPI, PYME o contratante…"
              className="w-full pl-8 pr-3 py-2 text-[12px] rounded-[8px] border border-border bg-white placeholder-text-4 focus:outline-none focus:border-orange"
            />
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-page-bg">
                <tr className="border-b border-border">
                  {['IPI', 'PYME', 'Contratante', 'Monto IPI', 'Condiciones', 'A transferir', 'Emisión', 'Acción'].map((h, i) => (
                    <th key={h} className={`text-xs font-semibold text-text-4 uppercase tracking-wide px-4 py-3
                      ${i === 0 ? 'text-left' : i === 5 ? 'text-right' : i === 7 ? 'text-center' : 'text-center'}
                    `}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtradas.map(f => {
                  const c = f.condiciones ?? CONDICIONES_DEFAULT;
                  return (
                    <tr key={f.id} className="border-b border-border last:border-0 transition-colors hover:bg-orange-tint/40">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-[12px] font-bold text-text-1">{f.id}</div>
                        <div className="text-[10px] font-mono text-text-4">{f.ipi?.numero ?? '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-[12px] font-semibold text-text-1 whitespace-nowrap">{f.pyme}</td>
                      <td className="px-4 py-3 text-[12px] text-text-4 max-w-[220px]">
                        <span className="block truncate">{f.contratante}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-[12px] font-semibold text-text-1 whitespace-nowrap">{fmt(f.monto)} XAF</td>
                      <td className="px-4 py-3 text-center text-[10px] text-text-4 whitespace-nowrap">
                        Ret {c.retencion}% · Cob {c.gestionCobranza}% · Int {c.interes}%
                      </td>
                      <td className="px-4 py-3 text-right text-[12px] font-extrabold text-green-text whitespace-nowrap">{fmt(netoFactura(f))} XAF</td>
                      <td className="px-4 py-3 text-center text-[11px] text-text-5 whitespace-nowrap">{f.ipi?.fechaEmision ?? f.fecha}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                          <Button variant="secondary" size="sm" onClick={() => setDetalle(f)}>
                            <Eye className="w-3.5 h-3.5 mr-1" />Detalle
                          </Button>
                          <Button variant="primary" size="sm" onClick={() => setLiquidando(f)}>
                            <Zap className="w-3.5 h-3.5 mr-1" />Liquidar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtradas.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-[12px] text-text-4">
                      {ordenes.length === 0 ? 'No hay órdenes pendientes de liquidar.' : 'No se encontraron órdenes con el filtro aplicado.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filtradas.length > 0 && (
            <div className="flex justify-end mt-4 text-[12px] text-text-4">
              Total a transferir:&nbsp;<span className="font-extrabold text-text-1">{fmt(totalNeto)} XAF</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-[14px] border border-border p-5">
          <div className="text-[13px] font-bold mb-3">Flujo del fondeo</div>
          <div className="flex flex-col sm:flex-row gap-2 text-[11px] text-text-3">
            <span className="px-2.5 py-1.5 rounded-full bg-page-bg">1 · Contratante envía la orden</span>
            <span className="px-2.5 py-1.5 rounded-full bg-page-bg">2 · {BANCO} liquida el fondeo</span>
            <span className="px-2.5 py-1.5 rounded-full bg-page-bg">3 · Acredita a Bonafide</span>
            <span className="px-2.5 py-1.5 rounded-full bg-page-bg">4 · OTP a la Contratante</span>
          </div>
        </div>

      </div>

      {/* ── Modal: liquidar fondeo ── */}
      {liquidando && (
        <LiquidarFondeoModal
          factura={liquidando}
          onClose={() => setLiquidando(null)}
          onConfirm={handleLiquidar}
        />
      )}

      {/* ── Modal: detalle de la orden ── */}
      {detalle && (
        <InvoiceDetailModal
          factura={facturaService.obtener(detalle.id) ?? detalle}
          onClose={() => setDetalle(null)}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setDetalle(null)}>Cerrar</Button>
              <Button variant="primary" size="sm" onClick={() => { const f = detalle; setDetalle(null); setLiquidando(f); }}>
                <Zap className="w-3.5 h-3.5 mr-1" />Liquidar fondeo
              </Button>
            </>
          }
        />
      )}
    </AppShell>
  );
}

// ── Modal: confirmar la liquidación (transferencia a Bonafide + OTP) ──────────
function LiquidarFondeoModal({ factura, onClose, onConfirm }) {
  const [referencia, setReferencia] = useState('');
  const c = factura.condiciones ?? CONDICIONES_DEFAULT;
  const neto = netoFactura(factura);

  return (
    <Modal
      title={`Liquidar fondeo · ${factura.id}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={() => onConfirm(factura, { referencia })}>
            <CheckCircle className="w-3.5 h-3.5 mr-1" />Confirmar transferencia
          </Button>
        </>
      }
      wide
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InfoRow label="PYME" value={factura.pyme} />
          <InfoRow label="Contratante" value={factura.contratante} />
          <InfoRow label="Contrato" value={factura.contrato} />
          <InfoRow label="Monto IPI" value={`${fmt(factura.monto)} XAF`} />
        </div>

        <div className="rounded-[12px] border border-border p-4" style={{ background: '#F8F7F5' }}>
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-text-4">Monto del IPI</span>
            <span className="font-semibold">{fmt(factura.monto)} XAF</span>
          </div>
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-text-4">Retención</span>
            <span className="font-semibold">− {fmt(factura.monto * c.retencion / 100)} XAF</span>
          </div>
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-text-4">Gestión de cobranza</span>
            <span className="font-semibold">− {fmt(factura.monto * c.gestionCobranza / 100)} XAF</span>
          </div>
          <div className="flex justify-between text-[12px] mb-2">
            <span className="text-text-4">Intereses</span>
            <span className="font-semibold">− {fmt(factura.monto * c.interes / 100)} XAF</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2.5">
            <span className="text-[12px] font-semibold text-text-1">Monto a transferir</span>
            <span className="text-[16px] font-extrabold text-green-text">{fmt(neto)} XAF</span>
          </div>
        </div>

        <div>
          <label className="text-[11px] text-text-4 mb-1 block">Referencia bancaria (opcional)</label>
          <input
            type="text"
            value={referencia}
            onChange={e => setReferencia(e.target.value)}
            placeholder="Nº de operación / transferencia…"
            className="w-full h-11 px-3 rounded-[10px] border-2 border-input-border focus:border-orange focus:outline-none text-[13px]"
          />
        </div>

        <div className="flex items-start gap-2.5 rounded-[12px] border border-orange/40 bg-orange-tint/10 p-3.5">
          <ShieldCheck className="w-4 h-4 text-orange shrink-0 mt-0.5" />
          <p className="text-[12px] text-text-3 leading-relaxed">
            Al confirmar, se acreditan <span className="font-semibold text-text-1">{fmt(neto)} XAF</span> a Bonafide
            y se envía un código OTP a <span className="font-semibold text-text-1">{factura.contratante}</span> para
            que verifique la transferencia.
          </p>
        </div>
      </div>
    </Modal>
  );
}
