import { useState } from 'react';
import {
  Receipt, Clock, FileCheck, TrendingUp, Users, ChevronRight, CheckCircle, Zap, FileText, X,
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { InfoRow, IpiVerificacionModal } from './contratanteShared';
import { ORA, GREEN, WARN, BLUE, TEXT4, fmt, facturas, facturaBadge } from './contratanteData';

// ── MIS FACTURAS ──────────────────────────────────────────────────────────────
const FILTROS_FAC = ['Todas', 'Recibidas', 'Verificadas', 'Pagadas'];

export default function EmpFacturas() {
  const [filtro, setFiltro]             = useState('Todas');
  const [facturaModal, setFacturaModal] = useState(null);
  const [ipiStep, setIpiStep]           = useState(null);
  const [estadoMap, setEstadoMap]       = useState({});

  const facturasVivas = facturas.map(f => ({ ...f, estado: estadoMap[f.id] ?? f.estado }));

  const filtered = filtro === 'Todas'      ? facturasVivas
    : filtro === 'Recibidas'               ? facturasVivas.filter(f => f.estado === 'Recibida' || f.estado === 'En revisión')
    : filtro === 'Verificadas'             ? facturasVivas.filter(f => f.estado === 'Verificada' || f.estado === 'IPI emitido')
    : facturasVivas.filter(f => f.estado === 'Pagada');

  const pendientes  = facturasVivas.filter(f => f.estado === 'Recibida').length;
  const verificadas = facturasVivas.filter(f => f.estado === 'Verificada').length;
  const totalMonto  = facturasVivas.reduce((a, f) => a + f.monto, 0);

  const modalFac = facturaModal ? (facturasVivas.find(f => f.id === facturaModal.id) ?? facturaModal) : null;

  const closeModal         = () => { setFacturaModal(null); setIpiStep(null); };
  const handleVerificar    = () => { setEstadoMap(p => ({ ...p, [modalFac.id]: 'Verificada' })); closeModal(); };
  const handleEnviarCodigo = () => setIpiStep('codigo');
  const handleConfirmarIPI = () => { setEstadoMap(p => ({ ...p, [modalFac.id]: 'IPI emitido' })); closeModal(); };

  return (
    <AppShell active="empFacturas" role="contratante" title="Mis Facturas" sub="Facturas emitidas por PYMEs contratadas">
      <div className="fade-in space-y-5">

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { lbl: 'Total facturas',     val: String(facturasVivas.length), Icon: Receipt,    iconBg: '#FFF3E0', iconColor: ORA   },
            { lbl: 'Pendientes validar', val: String(pendientes),           Icon: Clock,      iconBg: '#FDF6E8', iconColor: WARN  },
            { lbl: 'Listas para IPI',    val: String(verificadas),          Icon: FileCheck,  iconBg: '#EFF6FF', iconColor: BLUE  },
            { lbl: 'Monto total',        val: `${fmt(totalMonto)} XAF`,     Icon: TrendingUp, iconBg: '#E3F4EA', iconColor: GREEN },
          ].map(({ lbl, val, Icon, iconBg, iconColor }) => (
            <div key={lbl} className="card-lift card-enter bg-white rounded-[12px] border border-border p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: iconBg }}>
                <Icon className="w-5 h-5" style={{ color: iconColor }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-semibold text-text-4 uppercase tracking-wide mb-0.5">{lbl}</p>
                {val.endsWith(' XAF') ? (
                  <>
                    <p className="text-[12px] sm:text-[14px] font-extrabold text-text-1 leading-tight">{val.slice(0, -4)}</p>
                    <p className="text-[9px] font-semibold leading-tight" style={{ color: TEXT4 }}>XAF</p>
                  </>
                ) : (
                  <p className="text-[14px] font-extrabold text-text-1 leading-tight">{val}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="overflow-x-auto max-w-full">
        <div className="flex gap-1 bg-page-bg p-1 rounded-xl w-fit min-w-max">
          {FILTROS_FAC.map(f => (
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
          {filtered.map(f => {
            const hasAction = f.estado === 'Recibida' || f.estado === 'Verificada';
            return (
              <div key={f.id} className="card-lift card-enter bg-white rounded-[14px] border border-border p-5 flex flex-col gap-4">

                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[12px] font-mono font-bold text-text-1">{f.id}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: TEXT4 }}>{f.fecha}</p>
                  </div>
                  <Badge variant={facturaBadge(f.estado)}>{f.estado}</Badge>
                </div>

                {/* PYME + Contrato */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: '#FFF3E0' }}>
                    <Users className="w-4 h-4" style={{ color: ORA }} />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-text-1 leading-snug">{f.pyme}</p>
                    <p className="text-[10px] font-mono" style={{ color: TEXT4 }}>{f.contrato}</p>
                  </div>
                </div>

                {/* Monto */}
                <div className="bg-page-bg rounded-[10px] p-3">
                  <p className="text-[9px] font-semibold uppercase tracking-wide mb-2" style={{ color: TEXT4 }}>Monto</p>
                  <div className="flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 shrink-0" style={{ color: GREEN }} />
                    <p className="text-[15px] font-extrabold leading-none truncate" style={{ color: GREEN }}>
                      {fmt(f.monto)} <span className="text-[10px] font-semibold" style={{ color: GREEN }}>XAF</span>
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-1 flex items-center justify-between">
                  {hasAction ? (
                    <span className="text-[9px] font-semibold flex items-center gap-1" style={{ color: WARN }}>
                      <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0" style={{ background: WARN }} />
                      Acción requerida
                    </span>
                  ) : <span />}
                  <button
                    onClick={() => { setFacturaModal(f); setIpiStep(null); }}
                    className="text-[11px] font-semibold flex items-center gap-0.5 hover:opacity-75 cursor-pointer transition"
                    style={{ color: ORA }}
                  >
                    Ver detalle <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ── Modal: Detalle de factura ── */}
      {modalFac && (
        <Modal
          title={`Factura · ${modalFac.id}`}
          onClose={closeModal}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={closeModal}>Cerrar</Button>
              <div className="flex gap-2">
                {modalFac.estado === 'Recibida' && (
                  <Button variant="primary" size="sm" onClick={handleVerificar}>
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />Verificar factura
                  </Button>
                )}
                {modalFac.estado === 'Verificada' && (
                  <Button variant="primary" size="sm" onClick={() => setIpiStep('confirm')}>
                    <Zap className="w-3.5 h-3.5 mr-1" />Emitir IPI
                  </Button>
                )}
              </div>
            </>
          }
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <Badge variant={facturaBadge(modalFac.estado)}>{modalFac.estado}</Badge>
              <span className="text-[12px]" style={{ color: TEXT4 }}>{modalFac.fecha}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoRow label="Nº Factura"  value={modalFac.id} />
              <InfoRow label="PYME"        value={modalFac.pyme} />
              <InfoRow label="Contrato"    value={modalFac.contrato} />
              <InfoRow label="Monto"       value={`${fmt(modalFac.monto)} XAF`} />
              <InfoRow label="Fecha"       value={modalFac.fecha} />
              <InfoRow label="Concepto"    value={modalFac.concepto} />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2">Documento adjunto</div>
              <div className="flex items-center gap-2.5 p-3 rounded-[10px] border border-border" style={{ color: TEXT4 }}>
                <FileText className="w-4 h-4 shrink-0" />
                <span className="text-[12px]">No se ha adjuntado documento a esta factura.</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal IPI paso 1: confirmación ── */}
      {ipiStep === 'confirm' && modalFac && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
             onClick={e => e.target === e.currentTarget && setIpiStep(null)}>
          <div className="bona-gradient-shadow w-full max-w-md rounded-2xl p-[2px]">
            <div className="bg-white rounded-2xl p-8 relative">
              <button onClick={() => setIpiStep(null)} className="absolute top-4 right-4 p-2 hover:bg-page-bg rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5 text-text-3" />
              </button>

              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                     style={{ background: 'linear-gradient(135deg, #EF7A2C, #E0201C)' }}>
                  <Zap className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-text-1 mb-1">Autorizar pago IPI</h2>
                <p className="text-sm text-text-3">Revisa los datos y confirma la autorización</p>
              </div>

              <div className="rounded-[14px] border border-border p-4 mb-4" style={{ background: '#F8F7F5' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>Factura</span>
                  <span className="text-[12px] font-bold font-mono text-text-1">{modalFac.id}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>PYME</span>
                  <span className="text-[12px] font-medium text-text-1">{modalFac.pyme}</span>
                </div>
                <div className="flex items-center justify-between pt-2 mt-1 border-t border-border">
                  <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>Monto</span>
                  <span className="text-[16px] font-extrabold" style={{ color: GREEN }}>
                    {fmt(modalFac.monto)} <span className="text-[10px] font-semibold">XAF</span>
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-[12px] p-4 mb-6" style={{ background: '#FFF3E0', border: '1px solid #FDDDB8' }}>
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: ORA }} />
                <p className="text-[13px] text-text-1 leading-relaxed">
                  Confirmo que esta factura ha sido validada y autorizo el pago en la fecha de vencimiento.
                </p>
              </div>

              <Button onClick={handleEnviarCodigo} full className="h-[48px] mb-3">
                Aceptar y continuar
              </Button>
              <button onClick={() => setIpiStep(null)} className="w-full text-sm text-center font-medium text-text-3 hover:text-text-1 transition-colors cursor-pointer">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal IPI paso 2: verificación con código ── */}
      {ipiStep === 'codigo' && modalFac && (
        <IpiVerificacionModal
          factura={modalFac}
          onClose={() => setIpiStep(null)}
          onConfirm={handleConfirmarIPI}
        />
      )}
    </AppShell>
  );
}
