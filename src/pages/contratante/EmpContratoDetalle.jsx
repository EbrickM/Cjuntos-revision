import { useState } from 'react';
import {
  ChevronRight, TrendingUp, CreditCard, CheckCircle, ClipboardList, FileText, Clock, Building2, User, Users,
  Receipt, ListFilter, Zap, X,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { InfoRow, SectionHeader, IpiVerificacionModal } from './contratanteShared';
import { RED, ORA, GREEN, WARN, ERR, TEXT4, BLUE, fmt, facturas, pymes, facturaBadge, scoreColor, contratanteState } from './contratanteData';

// ── DETALLE DE CONTRATO ───────────────────────────────────────────────────────
const TABS_DETALLE = [
  { id: 'contrato', lbl: 'Contrato', Icon: FileText,    iconBg: '#FFF3E0', iconColor: ORA  },
  { id: 'pyme',     lbl: 'PYME',     Icon: Users,       iconBg: '#EFF6FF', iconColor: BLUE },
  { id: 'facturas', lbl: 'Facturas', Icon: Receipt,     iconBg: '#FDF6E8', iconColor: WARN },
];

export default function EmpContratoDetalle() {
  const { go } = useApp();
  const [tab, setTab] = useState('contrato');
  const [facturaModal, setFacturaModal] = useState(null);
  const [ipiStep, setIpiStep]           = useState(null);
  const [estadoMap, setEstadoMap]       = useState({});
  const [filtroFac, setFiltroFac]       = useState('Todos');
  const c    = contratanteState.selectedContrato;
  const pct  = Math.round((c.utilizado / c.asignado) * 100);
  const bar  = pct > 90 ? ERR : pct > 70 ? WARN : GREEN;
  const disp = c.asignado - c.utilizado;
  const facturasContrato = facturas
    .filter(f => f.contrato === c.id)
    .map(f => ({ ...f, estado: estadoMap[f.id] ?? f.estado }));
  const pyme    = pymes.find(p => p.ini === c.ini);
  const modalFac = facturaModal ? (facturasContrato.find(f => f.id === facturaModal.id) ?? facturaModal) : null;

  const closeModal        = () => { setFacturaModal(null); setIpiStep(null); };
  const handleVerificar   = () => { setEstadoMap(p => ({ ...p, [modalFac.id]: 'Verificada' })); closeModal(); };
  const handleEnviarCodigo= () => setIpiStep('codigo');
  const handleConfirmarIPI= () => { setEstadoMap(p => ({ ...p, [modalFac.id]: 'IPI emitido' })); closeModal(); };

  return (
    <AppShell active="empContratos" role="contratante" title="Detalle de Contrato" sub={`${c.pyme} · ${c.id}`}>
      <div className="fade-in space-y-5">

        {/* Breadcrumb */}
        <button onClick={() => go('empContratos')} className="flex items-center gap-1.5 text-[12px] font-medium hover:opacity-75 transition px-3 py-2 rounded-[10px] hover:bg-page-bg w-fit" style={{ color: TEXT4 }}>
          <ChevronRight className="w-4 h-4 rotate-180" style={{ color: ORA }} />
          <span>Mis contratos</span>
          <span className="mx-1" style={{ color: TEXT4 }}>/</span>
          <span className="text-text-1 font-semibold">{c.id}</span>
        </button>

        {/* ── Resumen financiero (como en PYME) ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { lbl: 'Fondo Asignado', val: `${fmt(c.asignado)} XAF`,  Icon: TrendingUp,   iconBg: '#FDEEEB', iconColor: RED   },
            { lbl: 'Utilizado',      val: `${fmt(c.utilizado)} XAF`, Icon: CreditCard,   iconBg: '#FDF6E8', iconColor: WARN  },
            { lbl: 'Disponible',     val: `${fmt(disp)} XAF`,        Icon: CheckCircle,  iconBg: '#E3F4EA', iconColor: GREEN },
            { lbl: '% Utilización',  val: `${pct}%`,                 Icon: ClipboardList,iconBg: pct > 90 ? '#FDEEEB' : pct > 70 ? '#FDF6E8' : '#E3F4EA', iconColor: bar },
          ].map(({ lbl, val, Icon, iconBg, iconColor }) => (
            <div key={lbl} className="card-enter bg-white rounded-[12px] border border-border p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: iconBg }}>
                <Icon className="w-5 h-5" style={{ color: iconColor }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-semibold text-text-4 uppercase tracking-wide mb-0.5">{lbl}</p>
                {val.endsWith(' XAF') ? (
                  <>
                    <p className="text-[12px] sm:text-[13px] font-extrabold text-text-1 leading-tight">{val.slice(0, -4)}</p>
                    <p className="text-[9px] font-semibold leading-tight" style={{ color: TEXT4 }}>XAF</p>
                  </>
                ) : (
                  <p className="text-[13px] font-extrabold text-text-1 leading-tight">{val}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs con iconos (como en PYME) ── */}
        <div className="flex gap-1 bg-page-bg p-1 rounded-[10px] overflow-x-auto">
          {TABS_DETALLE.map(({ id, lbl, Icon, iconBg, iconColor }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-[8px] text-[12px] font-medium transition-all whitespace-nowrap cursor-pointer
                  ${active ? 'bg-white shadow-sm text-text-1 font-semibold' : 'text-text-4 hover:text-text-2'}`}
              >
                <div className="w-5 h-5 rounded-[5px] flex items-center justify-center"
                     style={{ background: active ? iconBg : 'transparent' }}>
                  <Icon className="w-3 h-3" style={{ color: active ? iconColor : 'currentColor' }} />
                </div>
                {id === 'facturas' ? `${lbl} (${facturasContrato.length})` : lbl}
              </button>
            );
          })}
        </div>

        {/* ── Tab: Contrato ── */}
        {tab === 'contrato' && (
          <div className="space-y-4">

            {/* Objeto del trabajo */}
            <div className="card-enter bg-white rounded-[14px] border border-border p-5">
              <SectionHeader title="Objeto del Trabajo" sub="Descripción del alcance y servicios pactados en el contrato" Icon={FileText} />
              <p className="text-[13px] text-text-1 leading-relaxed">{c.objeto || '—'}</p>
            </div>

            {/* Condiciones económicas y plazos */}
            <div className="card-enter bg-white rounded-[14px] border border-border p-5" style={{ animationDelay: '60ms' }}>
              <SectionHeader title="Condiciones Económicas y Plazos" sub="Montos, fechas de vigencia y plazo de ejecución" Icon={Clock} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoRow label="Monto global"       value={`${fmt(c.asignado)} XAF`} />
                <InfoRow label="Fecha de inicio"    value={c.fechaInicio} />
                <InfoRow label="Fecha de fin"       value={c.fechaFin} />
                <InfoRow label="Plazo de ejecución" value={c.plazo} />
              </div>
            </div>

            {/* Documento */}
            <div className="card-enter bg-white rounded-[14px] border border-border p-5" style={{ animationDelay: '120ms' }}>
              <SectionHeader title="Documento del Contrato" sub="Archivo adjunto firmado entre las partes" Icon={FileText} />
              <div className="flex items-center gap-2 text-[12px]" style={{ color: TEXT4 }}>
                <FileText className="w-4 h-4 shrink-0" />
                No se ha adjuntado documento al contrato.
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: PYME ── */}
        {tab === 'pyme' && pyme && (
          <div className="space-y-4">

            {/* Datos de Identidad */}
            <div className="card-enter bg-white rounded-[14px] border border-border p-5">
              <SectionHeader
                title="Datos de Identidad"
                sub="Información legal y fiscal de la PYME"
                Icon={Building2}
                right={
                  <div className="shrink-0 px-2.5 py-1.5 rounded-[8px]" style={{ background: scoreColor(pyme.score) + '20' }}>
                    <div className="hidden sm:flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold" style={{ color: scoreColor(pyme.score) }}>Score crediticio</span>
                      <span className="text-[15px] font-extrabold" style={{ color: scoreColor(pyme.score) }}>{pyme.score}/1000</span>
                    </div>
                    <div className="flex flex-col items-center sm:hidden">
                      <span className="text-[10px] font-semibold" style={{ color: scoreColor(pyme.score) }}>Score</span>
                      <span className="text-[18px] font-extrabold leading-none mt-0.5" style={{ color: scoreColor(pyme.score) }}>{pyme.score}</span>
                    </div>
                  </div>
                }
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                <InfoRow label="Razón Social"      value={pyme.nombre} />
                <InfoRow label="Nombre Comercial"  value={pyme.nombreComercial} />
                <InfoRow label="RUC / NIF"         value={pyme.ruc} />
                <InfoRow label="Sector Productivo" value={pyme.sector} />
                <InfoRow label="Teléfono"          value={pyme.telefono} />
                <InfoRow label="Correo"            value={pyme.correo} />
              </div>
            </div>

            {/* Representante Legal */}
            <div className="card-enter bg-white rounded-[14px] border border-border p-5" style={{ animationDelay: '60ms' }}>
              <SectionHeader title="Representante Legal" sub="Persona autorizada para firmar y representar a la PYME" Icon={User} />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                <InfoRow label="Nombre y Apellido"    value={pyme.repNombre} />
                <InfoRow label="Tipo de Documento"    value={pyme.repTipoDoc} />
                <InfoRow label="Nº de Identificación" value={pyme.repId} />
                <InfoRow label="Cargo"                value={pyme.repCargo} />
                <InfoRow label="Teléfono"             value={pyme.repTel} />
                <InfoRow label="Correo"               value={pyme.repCorreo} />
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Facturas ── */}
        {tab === 'facturas' && (() => {
          const estadosDisponibles = ['Todos', ...Array.from(new Set(facturasContrato.map(f => f.estado)))];
          return (
          <div className="card-enter bg-white rounded-[14px] border border-border p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                     style={{ background: 'linear-gradient(135deg, #E0201C, #EF7A2C)' }}>
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-text-1">Facturas ({facturasContrato.length})</div>
                  <div className="text-[12px] text-text-4">Emitidas por la PYME en este contrato</div>
                </div>
              </div>
              <div className="relative flex items-center self-center sm:self-auto">
                <ListFilter className="absolute left-2.5 w-3.5 h-3.5 pointer-events-none shrink-0" style={{ color: ORA }} />
                <select
                  value={filtroFac}
                  onChange={e => setFiltroFac(e.target.value)}
                  className="h-8 pl-8 pr-7 text-[12px] font-medium rounded-[8px] border-2 border-orange bg-white text-text-1 focus:outline-none transition cursor-pointer appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23EF7A2C' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
                >
                  {estadosDisponibles.map(e => <option key={e}>{e}</option>)}
                </select>
              </div>
            </div>
            {(() => {
              const visibles = filtroFac === 'Todos' ? facturasContrato : facturasContrato.filter(f => f.estado === filtroFac);
              return visibles.length === 0 ? (
              <div className="py-10 flex flex-col items-center gap-2" style={{ color: TEXT4 }}>
                <Receipt className="w-8 h-8" />
                <p className="text-[13px] font-semibold">Sin facturas con estado "{filtroFac}"</p>
              </div>
            ) : (
              <div className="space-y-2">
                {visibles.map(f => (
                  <div key={f.id} onClick={() => { setFacturaModal(f); setIpiStep(null); }} className="cursor-pointer">

                    {/* ── Móvil: card igual que Mis Facturas ── */}
                    <div className="sm:hidden bg-white rounded-[14px] border border-border p-4 flex flex-col gap-3 hover:bg-page-bg transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[13px] font-bold font-mono text-text-1">{f.id}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: TEXT4 }}>{f.fecha}</p>
                        </div>
                        <Badge variant={facturaBadge(f.estado)}>{f.estado}</Badge>
                      </div>
                      <p className="text-[12px] leading-snug line-clamp-2" style={{ color: TEXT4 }}>{f.concepto}</p>
                      <div className="bg-page-bg rounded-[10px] p-3">
                        <p className="text-[9px] font-semibold uppercase tracking-wide mb-2" style={{ color: TEXT4 }}>Monto</p>
                        <div className="flex items-center gap-1.5">
                          <Receipt className="w-4 h-4 shrink-0" style={{ color: GREEN }} />
                          <p className="text-[15px] font-extrabold leading-none" style={{ color: GREEN }}>
                            {fmt(f.monto)} <span className="text-[10px] font-semibold" style={{ color: GREEN }}>XAF</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end pt-1 border-t border-border">
                        <span className="text-[11px] font-semibold flex items-center gap-0.5" style={{ color: ORA }}>
                          Ver detalle <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>

                    {/* ── Desktop: row ── */}
                    <div className="hidden sm:flex items-start gap-4 p-4 rounded-[12px] border border-border hover:border-orange/30 hover:bg-page-bg transition-all group">
                      <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 mt-0.5" style={{ background: '#FFF3E0' }}>
                        <Receipt className="w-5 h-5" style={{ color: ORA }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[13px] font-bold text-text-1 font-mono block mb-1">{f.id}</span>
                        <p className="text-[12px] leading-snug mb-2 line-clamp-2" style={{ color: TEXT4 }}>{f.concepto}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={facturaBadge(f.estado)}>{f.estado}</Badge>
                          <span className="text-[10px]" style={{ color: TEXT4 }}>{f.fecha}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0 gap-0.5 pt-0.5">
                        <div className="text-[14px] font-extrabold text-text-1">{fmt(f.monto)}</div>
                        <div className="text-[10px]" style={{ color: TEXT4 }}>XAF</div>
                      </div>
                      <ChevronRight className="w-4 h-4 shrink-0 opacity-40 group-hover:opacity-100 transition mt-1" style={{ color: ORA }} />
                    </div>

                  </div>
                ))}
              </div>
            );
            })()}
          </div>
          );
        })()}

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
            {/* Estado + fecha */}
            <div className="flex items-center justify-between">
              <Badge variant={facturaBadge(modalFac.estado)}>{modalFac.estado}</Badge>
              <span className="text-[12px]" style={{ color: TEXT4 }}>{modalFac.fecha}</span>
            </div>
            {/* Datos principales */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoRow label="Nº Factura"  value={modalFac.id} />
              <InfoRow label="PYME"        value={modalFac.pyme} />
              <InfoRow label="Contrato"    value={modalFac.contrato} />
              <InfoRow label="Monto"       value={`${fmt(modalFac.monto)} XAF`} />
              <InfoRow label="Fecha"       value={modalFac.fecha} />
              <InfoRow label="Concepto"    value={modalFac.concepto} />
            </div>
            {/* Documentos adjuntos */}
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
          <div className="w-full max-w-md rounded-2xl p-[2px]"
               style={{ background: 'linear-gradient(135deg, #E0201C 0%, #EF7A2C 100%)', boxShadow: '0 8px 32px rgba(224,32,28,0.18)' }}>
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
